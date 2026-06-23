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

const STORY_SYSTEM = "You are helping a Class 11 student write a creative science story about electrons. Suggest the next 1-2 sentences to continue their draft naturally. Keep it scientifically accurate but imaginative and age-appropriate. If language is 'ml', respond in simple Malayalam but keep science terms in English. Max 80 words.";

serve(async (req) => {
  const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" };
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...headers, "Content-Type": "application/json" } });

  try {
    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "");
    const { student_id, language, draft_text, option_type } = await req.json();
    if (!student_id || !draft_text || !option_type) return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: { ...headers, "Content-Type": "application/json" } });

    if (await checkRateLimit(supabaseClient, student_id, "story-assistant")) return new Response(JSON.stringify({ error: "Rate limited. Please wait 30 seconds." }), { status: 429, headers: { ...headers, "Content-Type": "application/json" } });

    const messages = [{ role: "user", content: `Language: ${language}\nOption type: ${option_type}\nCurrent draft: ${draft_text}` }];
    const promptHash = generatePromptHash(messages, STORY_SYSTEM);
    const cached = await getCachedResponse(supabaseClient, promptHash, "story-assistant");
    if (cached) return new Response(JSON.stringify({ suggestion: cached }), { status: 200, headers: { ...headers, "Content-Type": "application/json" } });

    const suggestion = await callOpenRouter(messages, STORY_SYSTEM);
    if (!suggestion) return new Response(JSON.stringify({ error: "Failed to generate suggestion" }), { status: 500, headers: { ...headers, "Content-Type": "application/json" } });
    await cacheResponse(supabaseClient, student_id, "story-assistant", promptHash, suggestion);

    return new Response(JSON.stringify({ suggestion }), { status: 200, headers: { ...headers, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("story-assistant error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { ...headers, "Content-Type": "application/json" } });
  }
});
