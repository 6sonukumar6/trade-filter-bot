// Decides what to do with each incoming Telegram message.
import { ALLOWED_TYPES, HELP_TEXT, MAX_BYTES } from "./config.js";
import { buildUserPrompt } from "./prompt.js";
import { analyseChart } from "./gemini.js";
import { downloadImage, sendMessage, sendTyping } from "./telegram.js";

// Find the image in a message (normal photo, or an image sent as a file).
function pickImage(msg) {
  if (msg.photo && msg.photo.length) {
    return { fileId: msg.photo[msg.photo.length - 1].file_id, mime: "image/jpeg" }; // largest size
  }
  if (msg.document && msg.document.mime_type && msg.document.mime_type.startsWith("image/")) {
    return { fileId: msg.document.file_id, mime: msg.document.mime_type };
  }
  return null;
}

export async function handleMessage(msg, env) {
  const chatId = msg.chat.id;
  try {
    if (env.ALLOWED_CHAT_ID && String(chatId) !== String(env.ALLOWED_CHAT_ID)) {
      await sendMessage(env, chatId, "Sorry, this bot is private.");
      return;
    }

    const text = (msg.text || "").trim();
    if (text.startsWith("/start") || text.startsWith("/help")) {
      await sendMessage(env, chatId, HELP_TEXT);
      return;
    }

    const image = pickImage(msg);
    if (!image) {
      await sendMessage(env, chatId, "Please send a chart screenshot as a photo. Send /help for tips.");
      return;
    }
    if (!ALLOWED_TYPES.includes(image.mime)) {
      await sendMessage(env, chatId, "I can read JPG, PNG, WEBP or GIF images.");
      return;
    }

    await sendTyping(env, chatId);
    const file = await downloadImage(env, image.fileId);
    if (file.bytes > MAX_BYTES) {
      await sendMessage(env, chatId, "That image is over 5 MB. Send it as a normal photo (not a file) or crop it.");
      return;
    }

    const answer = await analyseChart(env, file.base64, image.mime, buildUserPrompt(msg.caption));
    await sendMessage(env, chatId, answer);
  } catch (err) {
    console.log("error:", String(err));
    let detail = String(err);
    for (const s of [env.GEMINI_API_KEY, env.TELEGRAM_BOT_TOKEN]) if (s) detail = detail.split(s).join("***");
    await sendMessage(
      env,
      chatId,
      "Analysis failed.\n" + detail.slice(0, 300) +
        "\n\nIf it says API key not valid or 403: create a new key in Google AI Studio and update the GEMINI_API_KEY secret. " +
        "If it says model not found: set the MODEL variable. If it says quota: wait and retry."
    );
  }
}
