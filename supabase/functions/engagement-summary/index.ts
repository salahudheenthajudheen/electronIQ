import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const FREE_MODELS = ["meta-llama/llama-3.3-8b-instruct:free","mistralai/mistral-7b-instruct:free","google/gemma-2-9b-it:free","microsoft/phi-3-mini-128k-instruct:free"];
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

async function callOpenRouter(messages: { role: string; content: string }[], systemPrompt: string, modelIndex = 0): Promise<string> {
  const apiKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!apiKey) { console.error("OPENROUTER_API_KEY not set"); return ""; }
  const res = await fetch(OPENROUTER_URL, { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "HTTP-Referer": "https://electroniq.app", "X-Title": "ElectronIQ" }, body: JSON.stringify({ model: FREE_MODELS[modelIndex] ?? FREE_MODELS[0], messages: [{ role: "system", content: systemPrompt }, ...messages] }) });
  if (!res.ok) { if (modelIndex < FREE_MODELS.length - 1) return callOpenRouter(messages, systemPrompt, modelIndex + 1); console.error("OpenRouter error:", res.status); return ""; }
  const data = await res.json(); return data.choices?.[0]?.message?.content ?? "";
}

const SUMMARY_SYSTEM = "You are an educational analytics assistant. Given class engagement data as JSON, write a 3-sentence plain English summary highlighting strengths, weaknesses, and one actionable suggestion for the teacher. Be specific, not generic. Max 100 words.";

serve(async (req) => {
  const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" };
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...headers, "Content-Type": "application/json" } });

  try {
    const { admin_id, class_data_json } = await req.json();
    if (!admin_id || !class_data_json) return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: { ...headers, "Content-Type": "application/json" } });

    const messages = [{ role: "user", content: `Class engagement data:\n${JSON.stringify(class_data_json, null, 2)}` }];
    const summary = await callOpenRouter(messages, SUMMARY_SYSTEM);
    if (!summary) return new Response(JSON.stringify({ error: "Failed to generate summary" }), { status: 500, headers: { ...headers, "Content-Type": "application/json" } });

    return new Response(JSON.stringify({ summary }), { status: 200, headers: { ...headers, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("engagement-summary error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { ...headers, "Content-Type": "application/json" } });
  }
});
