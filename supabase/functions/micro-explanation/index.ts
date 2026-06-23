import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  callOpenRouter,
  cacheResponse,
  checkRateLimit,
  generatePromptHash,
  getCachedResponse,
} from "../_shared/openrouter.ts";

const EXPLAIN_SYSTEM =
  "You are a Class 11 Chemistry tutor in India (NCERT syllabus). A student predicted incorrectly in a virtual CRT experiment. Explain why the correct answer is right in 2 simple sentences. If language is 'ml', respond in simple Malayalam but keep science terms in English. Max 50 words.";

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

    const { student_id, language, question_context, wrong_answer, correct_answer } =
      await req.json();

    if (!student_id || !question_context || !wrong_answer || !correct_answer) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: student_id, question_context, wrong_answer, correct_answer",
        }),
        { status: 400, headers: { ...headers, "Content-Type": "application/json" } },
      );
    }

    const isRateLimited = await checkRateLimit(
      supabaseClient,
      student_id,
      "micro-explanation",
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
          `Language: ${language}\nQuestion: ${question_context}\nStudent's wrong answer: ${wrong_answer}\nCorrect answer: ${correct_answer}`,
      },
    ];

    const promptHash = generatePromptHash(messages, EXPLAIN_SYSTEM);

    const cached = await getCachedResponse(
      supabaseClient,
      promptHash,
      "micro-explanation",
    );
    if (cached) {
      return new Response(
        JSON.stringify({ explanation: cached }),
        { status: 200, headers: { ...headers, "Content-Type": "application/json" } },
      );
    }

    const explanation = await callOpenRouter(messages, EXPLAIN_SYSTEM);

    if (explanation) {
      await cacheResponse(
        supabaseClient,
        student_id,
        "micro-explanation",
        promptHash,
        explanation,
      );
    } else {
      return new Response(
        JSON.stringify({ error: "Failed to generate explanation" }),
        { status: 500, headers: { ...headers, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ explanation }),
      { status: 200, headers: { ...headers, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("micro-explanation error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...headers, "Content-Type": "application/json" } },
    );
  }
});
