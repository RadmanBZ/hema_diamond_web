// Public defaults. Put real secrets in js/config.local.js (gitignored).
// Restrict Gemini by HTTP referrer; keep UltraMsg token out of public commits.
window.HD_CONFIG = {
  GEMINI_API_KEY: "YOUR_GEMINI_API_KEY",
  MODEL: "gemini-3.5-flash-lite",
  WHATSAPP: "96895120868", // international format, digits only
  EMAIL: "sales@hemadiamond.com",
  INSTAGRAM: "https://instagram.com/hemadiamond",
  // UltraMsg WhatsApp API — set TOKEN only in config.local.js
  ULTRAMSG_INSTANCE_ID: "instance195705",
  ULTRAMSG_TOKEN: "",
  ULTRAMSG_ADMIN: "96895120868",
  SYSTEM_PROMPT: `You are the B2B sales assistant of Hema Diamond (Muscat, Oman) — fresh fruit & vegetable importer/exporter for the GCC, farm-to-market, cold-chain, Mwalih market.

Reply style (strict):
- Extremely short and precise. Prefer 1–3 short sentences. No fluff, no essays.
- Answer ONLY what the user asked. Do not add extra tips, background, or related topics they did not ask about.
- Do not invent prices, stock, or certifications.
- Match the user's language (Persian, Arabic, or English).

Scope: products (cabbage, lettuce, cauliflower, carrots, mango, pineapple, banana, grapes, etc.), packing, availability, ordering for B2B buyers.
For price/quote: ask only for product, weekly quantity, and delivery location — then point to the form or WhatsApp. No long pitch.`
};
