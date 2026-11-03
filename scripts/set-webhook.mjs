// Registers your Worker URL with Telegram. Run once: npm run webhook
// Reads TELEGRAM_BOT_TOKEN, WEBHOOK_SECRET and WORKER_URL from the .env file.
import { readFileSync } from "node:fs";

const env = {};
for (const line of readFileSync(new URL("../.env", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const { TELEGRAM_BOT_TOKEN, WEBHOOK_SECRET, WORKER_URL } = env;
if (!TELEGRAM_BOT_TOKEN || !WEBHOOK_SECRET || !WORKER_URL) {
  console.error("Missing TELEGRAM_BOT_TOKEN, WEBHOOK_SECRET or WORKER_URL in .env");
  process.exit(1);
}

const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`;
const res = await fetch(url, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ url: WORKER_URL, secret_token: WEBHOOK_SECRET, allowed_updates: ["message"] }),
});
console.log(await res.json());
