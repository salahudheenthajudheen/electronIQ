import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  callOpenRouter,
  cacheResponse,
  checkRateLimit,
  generatePromptHash,
  getCachedResponse,
} from "../_shared/openrouter.ts";

const STORY_SYSTEM =
  "You are helping a Class 11 student write a creative science story about electrons. Suggest the next 1-2 sentences to continue their draft naturally. Keep it scientifically accurate but imaginative and age-appropriate. If language is 'ml', respond in simple Malayalam but keep science terms in English. Max 80 words.";

serve(async (req) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    const { student_id, language, draft_text, option_type } = await req.json();

    if (!student_id || !draft_text || !option_type) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: student_id, draft_text, option_type",
        }),
        { status: 400, headers: { ...headers, "Content-Type": "application/json" } },
      );
    }

    const isRateLimited = await checkRateLimit(
      supabaseClient,
      student_id,
      "story-assistant",
    );
    if (isRateLimited) {
      return new Response(
        JSON.stringify({ error: "Rate limited. Please wait 30 seconds between requests." }),
        { status: 429, headers: { ...headers, "Content-Type": "application/json" } },
      );
    }

    const messages = [
      {
        role: "user",
        content:
          `Language: ${language}\nOption type: ${option_type}\nCurrent draft: ${draft_text}`,
      },
    ];

    const promptHash = generatePromptHash(messages, STORY_SYSTEM);

    const cached = await getCachedResponse(
      supabaseClient,
      promptHash,
      "story-assistant",
    );
    if (cached) {
      return new Response(
        JSON.stringify({ suggestion: cached }),
        { status: 200, headers: { ...headers, "Content-Type": "application/json" } },
      );
    }

    const suggestion = await callOpenRouter(messages, STORY_SYSTEM);

    if (suggestion) {
      await cacheResponse(
        supabaseClient,
        student_id,
        "story-assistant",
        promptHash,
        suggestion,
      );
    } else {
      return new Response(
        JSON.stringify({ error: "Failed to generate suggestion" }),
        { status: 500, headers: { ...headers, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ suggestion }),
      { status: 200, headers: { ...headers, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("story-assistant error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...headers, "Content-Type": "application/json" } },
    );
  }
});
