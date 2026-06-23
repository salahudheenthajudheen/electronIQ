import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FREE_MODELS = [
  "meta-llama/llama-3.3-8b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
  "google/gemma-2-9b-it:free",
  "microsoft/phi-3-mini-128k-instruct:free",
];

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

async function callOpenRouter(messages: { role: string; content: string }[], systemPrompt: string, modelIndex = 0): Promise<string> {
  const apiKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!apiKey) { console.error("OPENROUTER_API_KEY not set"); return ""; }
  const body = { model: FREE_MODELS[modelIndex] ?? FREE_MODELS[0], messages: [{ role: "system", content: systemPrompt }, ...messages] };
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "HTTP-Referer": "https://electroniq.app", "X-Title": "ElectronIQ" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    if (modelIndex < FREE_MODELS.length - 1) return callOpenRouter(messages, systemPrompt, modelIndex + 1);
    console.error("OpenRouter error:", response.status); return "";
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

function generatePromptHash(messages: { role: string; content: string }[], systemPrompt: string): string {
  const input = systemPrompt + messages.map(m => `${m.role}:${m.content}`).join("|");
  let hash = 0;
  for (let i = 0; i < input.length; i++) { const c = input.charCodeAt(i); hash = ((hash << 5) - hash) + c; hash = hash & hash; }
  return Math.abs(hash).toString(16);
}

async function checkRateLimit(supabaseClient: any, studentId: string, functionName: string): Promise<boolean> {
  const thirtySecondsAgo = new Date(Date.now() - 30_000).toISOString();
  const { count, error } = await supabaseClient.from("ai_calls").select("id", { count: "exact", head: true }).eq("student_id", studentId).eq("function_name", functionName).gte("created_at", thirtySecondsAgo);
  if (error) { console.error("Rate limit error:", error); return false; }
  return (count ?? 0) > 0;
}

async function getCachedResponse(supabaseClient: any, promptHash: string, functionName: string): Promise<string | null> {
  const { data, error } = await supabaseClient.from("ai_calls").select("response_text").eq("prompt_hash", promptHash).eq("function_name", functionName).order("created_at", { ascending: false }).limit(1).single();
  if (error || !data) return null;
  return data.response_text;
}

async function cacheResponse(supabaseClient: any, studentId: string, functionName: string, promptHash: string, responseText: string): Promise<void> {
  const { error } = await supabaseClient.from("ai_calls").insert({ student_id: studentId, function_name: functionName, prompt_hash: promptHash, response_text: responseText });
  if (error) console.error("Cache insert error:", error);
}

const HINT_SYSTEM =
  "You are a Class 11 Chemistry tutor in India (NCERT syllabus). Give hints about cathode ray tube experiments and electron properties. Tier 1: one directional sentence, do not give the answer. Tier 2: near-complete explanation in two sentences. If language is 'ml', respond in simple Malayalam but keep science terms in English. Be concise. Max 60 words.";

serve(async (req) => {
  const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" };
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...headers, "Content-Type": "application/json" } });

  try {
    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "");
    const { student_id, tier, language, question_context } = await req.json();
    if (!student_id || !tier || !question_context)
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: { ...headers, "Content-Type": "application/json" } });

    const isRateLimited = await checkRateLimit(supabaseClient, student_id, "hint-generator");
    if (isRateLimited)
      return new Response(JSON.stringify({ error: "Rate limited. Please wait 30 seconds." }), { status: 429, headers: { ...headers, "Content-Type": "application/json" } });

    const messages = [{ role: "user", content: `Tier: ${tier}\nLanguage: ${language}\nQuestion: ${question_context}` }];
    const promptHash = generatePromptHash(messages, HINT_SYSTEM);
    const cached = await getCachedResponse(supabaseClient, promptHash, "hint-generator");
    if (cached) return new Response(JSON.stringify({ hint: cached, tier }), { status: 200, headers: { ...headers, "Content-Type": "application/json" } });

    const hint = await callOpenRouter(messages, HINT_SYSTEM);
    if (!hint) return new Response(JSON.stringify({ error: "Failed to generate hint" }), { status: 500, headers: { ...headers, "Content-Type": "application/json" } });
    await cacheResponse(supabaseClient, student_id, "hint-generator", promptHash, hint);

    return new Response(JSON.stringify({ hint, tier }), { status: 200, headers: { ...headers, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("hint-generator error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { ...headers, "Content-Type": "application/json" } });
  }
});
