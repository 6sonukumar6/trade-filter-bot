// Telegram Bot API helpers.
import { TELEGRAM_CHUNK } from "./config.js";
import { splitText, toBase64 } from "./utils.js";

export async function tg(env, method, payload) {
  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function sendMessage(env, chatId, text) {
  for (const part of splitText(text, TELEGRAM_CHUNK)) {
    await tg(env, "sendMessage", { chat_id: chatId, text: part });
  }
}

export function sendTyping(env, chatId) {
  return tg(env, "sendChatAction", { chat_id: chatId, action: "typing" });
}

// Download a Telegram file and return it as base64 plus its size in bytes.
export async function downloadImage(env, fileId) {
  const info = await tg(env, "getFile", { file_id: fileId });
  if (!info.ok) throw new Error("telegram getFile failed");
  const res = await fetch(`https://api.telegram.org/file/bot${env.TELEGRAM_BOT_TOKEN}/${info.result.file_path}`);
  if (!res.ok) throw new Error("telegram download failed " + res.status);
  const buffer = await res.arrayBuffer();
  return { base64: toBase64(buffer), bytes: buffer.byteLength };
}
