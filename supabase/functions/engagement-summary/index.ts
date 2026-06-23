import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { callOpenRouter } from "../_shared/openrouter.ts";

const SUMMARY_SYSTEM =
  "You are an educational analytics assistant. Given class engagement data as JSON, write a 3-sentence plain English summary highlighting strengths, weaknesses, and one actionable suggestion for the teacher. Be specific, not generic. Max 100 words.";

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
    const { admin_id, class_data_json } = await req.json();

    if (!admin_id || !class_data_json) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: admin_id, class_data_json" }),
        { status: 400, headers: { ...headers, "Content-Type": "application/json" } },
      );
    }

    const messages = [
      {
        role: "user",
        content: `Class engagement data:\n${JSON.stringify(class_data_json, null, 2)}`,
      },
    ];

    const summary = await callOpenRouter(messages, SUMMARY_SYSTEM);

    if (!summary) {
      return new Response(
        JSON.stringify({ error: "Failed to generate summary" }),
        { status: 500, headers: { ...headers, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ summary }),
      { status: 200, headers: { ...headers, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("engagement-summary error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...headers, "Content-Type": "application/json" } },
    );
  }
});
