// Free backup: Groq API (Llama 4 vision models). Used only when Gemini is busy or out of quota.
import { SYSTEM_PROMPT } from "./prompt.js";

const GROQ_MODELS = ["meta-llama/llama-4-scout-17b-16e-instruct", "meta-llama/llama-4-maverick-17b-128e-instruct"];

export async function analyseWithGroq(env, base64, mediaType, userPrompt) {
  let lastErr = "";
  for (const model of GROQ_MODELS) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 1500,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              { type: "image_url", image_url: { url: `data:${mediaType};base64,${base64}` } },
            ],
          },
        ],
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const text = data.choices && data.choices[0] && data.choices[0].message && (data.choices[0].message.content || "").trim();
      if (text) return text + "\n\n(Answered by the Groq backup model. Double-check volume and slope marks.)";
      lastErr = `groq ${model}: empty reply`;
      continue;
    }
    lastErr = `groq ${model} ${res.status} ${(await res.text()).slice(0, 150)}`;
  }
  throw new Error(lastErr || "no reply from Groq");
}
