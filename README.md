# Trade Filter Bot (Telegram) - free version

Send a trade chart screenshot to the bot at any time. It replies with all 7 crossover filters
(200 slope, 50-200 gap, strong close, volume, 1H trend, breakout, safe stop), the price-volume
relationship, a score and a verdict.

Cost: no money needed. It uses Cloudflare Workers (free plan) and the Google Gemini API free tier.
Do NOT add a credit card or billing to the Google project, so nothing can be charged.

## What you need (all free)
1. A NEW Telegram bot token: BotFather > /newbot (do not reuse the SMA alert bot's token).
2. A free Gemini API key: aistudio.google.com/apikey > Create API key (Google account, no billing). A Gemini Plus or other app subscription does NOT include API access, so you still need this key.
3. Your Telegram chat ID (the same number you used for the SMA alert bot).
4. Node.js on your laptop (nodejs.org) and a free Cloudflare account.

## Easiest setup: GitHub + Cloudflare (no terminal, no VS Code)
You do this once. After that the bot runs by itself 24/7 and you only send screenshots in Telegram.
1. Create a free GitHub repository (private is best) and upload this whole folder (the .env file is not needed).
2. Cloudflare dashboard > Workers & Pages > Create > import the GitHub repository (Workers Builds). Keep the project name trade-filter-bot and the default build/deploy settings. Cloudflare then deploys it and redeploys every time you push to GitHub.
3. Open the Worker > Settings > Variables and Secrets and add 4 secrets: TELEGRAM_BOT_TOKEN, GEMINI_API_KEY, WEBHOOK_SECRET (random letters/numbers/_/-), ALLOWED_CHAT_ID (your chat ID).
4. Copy the Worker URL (https://trade-filter-bot.<name>.workers.dev) and open this once in a browser:
   https://api.telegram.org/bot<TOKEN>/setWebhook?url=<WORKER_URL>&secret_token=<WEBHOOK_SECRET>
   You should see "Webhook was set".
5. Open the bot in Telegram, press Start, send a chart screenshot.
(Cloudflare menu names can change slightly; the idea is: connect repo, add 4 secrets, set the webhook once.)

## Alternative setup with a terminal (also one time only)
Open a terminal inside this folder, then run:
1. npm install
2. npx wrangler login
3. npx wrangler deploy
   (prints your URL, like https://trade-filter-bot.<name>.workers.dev)
4. Add the secrets. Each command asks you to paste the value:
   npx wrangler secret put TELEGRAM_BOT_TOKEN
   npx wrangler secret put GEMINI_API_KEY
   npx wrangler secret put WEBHOOK_SECRET      (random letters/numbers/_/-, e.g. filterbot_83hd72kd)
   npx wrangler secret put ALLOWED_CHAT_ID     (your chat ID; REQUIRED so nobody else can use your free quota)
5. Create a file named .env in this folder with 3 lines:
   TELEGRAM_BOT_TOKEN=your_new_bot_token
   WEBHOOK_SECRET=the_same_secret_as_above
   WORKER_URL=your_worker_url_from_step_3
6. npm run webhook      (should print { ok: true ... })
7. Open your new bot in Telegram, press Start, and send a chart screenshot.

## Free tier limits
- Gemini's free tier has per-minute and per-day request limits. See your exact numbers at aistudio.google.com/rate-limit. If you hit them the bot says "Free limit reached" and works again later.
- Google may use free-tier inputs to improve its products, so send only chart screenshots (no account balances or personal data).
- Google can rename or change free models. If the bot starts failing with a model error, set MODEL in wrangler.toml to a free model listed in AI Studio, then commit the change on GitHub (it redeploys by itself).

## Use
- Send as a Photo (or as a File for big images). Optional caption such as "short" or "1H trend down".
- 1H trend and safe stop show a question mark unless the screenshot or caption shows them.
- Works with TradingView (blue 50 / orange 200) and GoCharting (brown 50 / orange 200) screenshots, and with replay position boxes.

## Keep it safe
- .env is listed in .gitignore. Never upload keys to a public GitHub repo.
- Marks come from a vision model reading the picture. The free model may misread small details more often than a larger paid model, so send full, clear charts with volume visible and double-check the volume and slope marks.

## Troubleshooting
- No reply: open https://api.telegram.org/bot<TOKEN>/getWebhookInfo and read last_error_message.
- Live logs: Cloudflare > your Worker > Logs
- "Something went wrong" reply: open the Worker Logs and look for "gemini api" errors (bad key, wrong model name).
