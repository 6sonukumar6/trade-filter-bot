// Settings and fixed texts for the bot.

// Tried in order. If Google renames a free model the bot moves to the next one.
export const MODELS = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.0-flash"];
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const MAX_BYTES = 5 * 1024 * 1024; // keep images small
export const MAX_TOKENS = 2500;
export const TELEGRAM_CHUNK = 4000; // Telegram message limit is 4096 characters

export const HELP_TEXT =
  "Send me a screenshot of a BTC 15m chart with the 50 and 200 SMA and volume.\n\n" +
  "I check 7 filters: 200 slope, 50-200 gap, strong close, volume, 1H trend, breakout, safe stop.\n\n" +
  "Tips:\n" +
  "- Send it as a photo (not as a file) when possible.\n" +
  "- Add a caption like 'long', 'short' or any note about the trade.\n" +
  "- One screenshot per message.\n" +
  "- Include the volume panel. The 1H trend and stop show ? unless visible.";
