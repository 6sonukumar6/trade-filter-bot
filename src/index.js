// Entry point: Telegram sends every message here (webhook).
import { handleMessage } from "./handler.js";

export default {
  async fetch(request, env, ctx) {
    if (request.method !== "POST") return new Response("Trade filter bot is running");

    // Only accept requests that carry our secret (set when registering the webhook).
    if (request.headers.get("X-Telegram-Bot-Api-Secret-Token") !== env.WEBHOOK_SECRET) {
      return new Response("forbidden", { status: 403 });
    }

    let update;
    try {
      update = await request.json();
    } catch (e) {
      return new Response("bad request", { status: 400 });
    }

    // Reply to Telegram immediately, then do the slow work in the background.
    if (update.message) ctx.waitUntil(handleMessage(update.message, env));
    return new Response("ok");
  },
};
