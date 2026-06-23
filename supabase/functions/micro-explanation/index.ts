import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FREE_MODELS = ["meta-llama/llama-3.3-8b-instruct:free","mistralai/mistral-7b-instruct:free","google/gemma-2-9b-it:free","microsoft/phi-3-mini-128k-instruct:free"];
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

async function callOpenRouter(messages: { role: string; content: string }[], systemPrompt: string, modelIndex = 0): Promise<string> {
  const apiKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!apiKey) { console.error("OPENROUTER_API_KEY not set"); return ""; }
  const res = await fetch(OPENROUTER_URL, { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "HTTP-Referer": "https://electroniq.app", "X-Title": "ElectronIQ" }, body: JSON.stringify({ model: FREE_MODELS[modelIndex] ?? FREE_MODELS[0], messages: [{ role: "system", content: systemPrompt }, ...messages] }) });
  if (!res.ok) { if (modelIndex < FREE_MODELS.length - 1) return callOpenRouter(messages, systemPrompt, modelIndex + 1); console.error("OpenRouter error:", res.status); return ""; }
  const data = await res.json(); return data.choices?.[0]?.message?.content ?? "";
}

function generatePromptHash(messages: { role: string; content: string }[], systemPrompt: string): string {
  const input = systemPrompt + messages.map(m => `${m.role}:${m.content}`).join("|");
  let h = 0; for (let i = 0; i < input.length; i++) { const c = input.charCodeAt(i); h = ((h << 5) - h) + c; h = h & h; } return Math.abs(h).toString(16);
}

async function checkRateLimit(sc: any, sid: string, fn: string): Promise<boolean> {
  const ta = new Date(Date.now() - 30_000).toISOString();
  const { count, error } = await sc.from("ai_calls").select("id", { count: "exact", head: true }).eq("student_id", sid).eq("function_name", fn).gte("created_at", ta);
  return error ? false : (count ?? 0) > 0;
}

async function getCachedResponse(sc: any, ph: string, fn: string): Promise<string | null> {
  const { data, error } = await sc.from("ai_calls").select("response_text").eq("prompt_hash", ph).eq("function_name", fn).order("created_at", { ascending: false }).limit(1).single();
  return error || !data ? null : data.response_text;
}

async function cacheResponse(sc: any, sid: string, fn: string, ph: string, rt: string): Promise<void> {
  const { error } = await sc.from("ai_calls").insert({ student_id: sid, function_name: fn, prompt_hash: ph, response_text: rt });
  if (error) console.error("Cache error:", error);
}

const EXPLAIN_SYSTEM = "You are a Class 11 Chemistry tutor in India (NCERT syllabus). A student predicted incorrectly in a virtual CRT experiment. Explain why the correct answer is right in 2 simple sentences. If language is 'ml', respond in simple Malayalam but keep science terms in English. Max 50 words.";

serve(async (req) => {
  const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" };
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...headers, "Content-Type": "application/json" } });

  try {
    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "");
    const { student_id, language, question_context, wrong_answer, correct_answer } = await req.json();
    if (!student_id || !question_context || !wrong_answer || !correct_answer) return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: { ...headers, "Content-Type": "application/json" } });

    if (await checkRateLimit(supabaseClient, student_id, "micro-explanation")) return new Response(JSON.stringify({ error: "Rate limited. Please wait 30 seconds." }), { status: 429, headers: { ...headers, "Content-Type": "application/json" } });

    const messages = [{ role: "user", content: `Language: ${language}\nQuestion: ${question_context}\nWrong answer: ${wrong_answer}\nCorrect answer: ${correct_answer}` }];
    const promptHash = generatePromptHash(messages, EXPLAIN_SYSTEM);
    const cached = await getCachedResponse(supabaseClient, promptHash, "micro-explanation");
    if (cached) return new Response(JSON.stringify({ explanation: cached }), { status: 200, headers: { ...headers, "Content-Type": "application/json" } });

    const explanation = await callOpenRouter(messages, EXPLAIN_SYSTEM);
    if (!explanation) return new Response(JSON.stringify({ error: "Failed to generate explanation" }), { status: 500, headers: { ...headers, "Content-Type": "application/json" } });
    await cacheResponse(supabaseClient, student_id, "micro-explanation", promptHash, explanation);

    return new Response(JSON.stringify({ explanation }), { status: 200, headers: { ...headers, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("micro-explanation error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { ...headers, "Content-Type": "application/json" } });
  }
});
