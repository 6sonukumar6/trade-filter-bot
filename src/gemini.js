// Calls the Google Gemini API (free tier) with the chart image.
import { MODELS, MAX_TOKENS } from "./config.js";
import { SYSTEM_PROMPT } from "./prompt.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BUSY = [500, 502, 503, 504];

export async function analyseChart(env, base64, mediaType, userPrompt) {
  if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY secret is missing on the Worker");
  const models = env.MODEL ? [env.MODEL] : MODELS;
  let lastErr = "";
  let limited = false;
  let busy = false;

  // Two passes: if Google is busy, wait a few seconds and try the models once more.
  for (let pass = 0; pass < 2; pass++) {
    busy = false;
    for (const model of models) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ inlineData: { mimeType: mediaType, data: base64 } }, { text: userPrompt }] }],
          generationConfig: { maxOutputTokens: MAX_TOKENS, temperature: 0.2 },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.promptFeedback && data.promptFeedback.blockReason) {
          return "Gemini could not process this image. Try a different screenshot.";
        }
        const parts = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [];
        const text = parts.map((p) => p.text || "").join("\n").trim();
        if (text) return text;
        lastErr = `${model}: empty reply`;
        continue;
      }

      const body = (await res.text()).slice(0, 250);
      if (BUSY.includes(res.status)) { busy = true; lastErr = `${model}: busy ${res.status}`; continue; }
      if (res.status === 429) { limited = true; lastErr = `${model}: quota ${body}`; continue; }
      if (res.status === 404 || (res.status === 400 && /model/i.test(body))) { lastErr = `${model}: not available ${res.status} ${body}`; continue; }
      throw new Error(`gemini ${model} ${res.status} ${body}`); // key or request problem: stop and show it
    }
    if (!busy) break;
    await sleep(3000);
  }

  if (busy) return "Google's free Gemini model is busy right now. Please send the screenshot again in a minute.";
  if (limited) return "Free limit reached for now (Gemini free tier). Try again in a minute, or tomorrow if the daily limit is used up.";
  throw new Error(lastErr || "no reply from Gemini");
}

  if (limited) return "Free limit reached for now (Gemini free tier). Try again in a minute, or tomorrow if the daily limit is used up.";
  throw new Error(lastErr || "no reply from Gemini");

