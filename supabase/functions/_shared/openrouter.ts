export const FREE_MODELS = [
  "meta-llama/llama-3.3-8b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
  "google/gemma-2-9b-it:free",
  "microsoft/phi-3-mini-128k-instruct:free",
];

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function callOpenRouter(
  messages: { role: string; content: string }[],
  systemPrompt: string,
  modelIndex = 0,
): Promise<string> {
  const apiKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!apiKey) {
    console.error("OPENROUTER_API_KEY not set");
    return "";
  }

  const body = {
    model: FREE_MODELS[modelIndex] ?? FREE_MODELS[0],
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
  };

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://electroniq.app",
      "X-Title": "ElectronIQ",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (modelIndex < FREE_MODELS.length - 1) {
      return callOpenRouter(messages, systemPrompt, modelIndex + 1);
    }
    console.error("OpenRouter API error:", response.status, response.statusText);
    return "";
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export function generatePromptHash(
  messages: { role: string; content: string }[],
  systemPrompt: string,
): string {
  const input = systemPrompt + messages.map((m) => `${m.role}:${m.content}`).join("|");
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

export async function checkRateLimit(
  supabaseClient: any,
  studentId: string,
  functionName: string,
): Promise<boolean> {
  const thirtySecondsAgo = new Date(Date.now() - 30_000).toISOString();

  const { count, error } = await supabaseClient
    .from("ai_calls")
    .select("id", { count: "exact", head: true })
    .eq("student_id", studentId)
    .eq("function_name", functionName)
    .gte("created_at", thirtySecondsAgo);

  if (error) {
    console.error("Rate limit check error:", error);
    return false;
  }

  return (count ?? 0) > 0;
}

export async function getCachedResponse(
  supabaseClient: any,
  promptHash: string,
  functionName: string,
): Promise<string | null> {
  const { data, error } = await supabaseClient
    .from("ai_calls")
    .select("response_text")
    .eq("prompt_hash", promptHash)
    .eq("function_name", functionName)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return data.response_text;
}

export async function cacheResponse(
  supabaseClient: any,
  studentId: string,
  functionName: string,
  promptHash: string,
  responseText: string,
): Promise<void> {
  const { error } = await supabaseClient
    .from("ai_calls")
    .insert({
      student_id: studentId,
      function_name: functionName,
      prompt_hash: promptHash,
      response_text: responseText,
    });

  if (error) {
    console.error("Cache insert error:", error);
  }
}
