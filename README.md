# Hema Diamond — Web

Public marketing site for Hema Diamond (fresh produce import · Muscat).

## Local setup

1. Open `index.html` via a local static server (recommended), or open the file directly.
2. Copy the local config template and add your Gemini key:

```bash
cp js/config.local.example.js js/config.local.js
```

Edit `js/config.local.js` and set `GEMINI_API_KEY`. That file is gitignored and must never be committed.

3. Restrict the API key by HTTP referrer in Google AI Studio / Cloud.

## Stack

- Static HTML / CSS / JS
- Tailwind CDN + custom `css/style.css`
- Gemini chat assistant (`js/app.js` + `js/config.js`)
- i18n: English, Arabic, Persian (`js/i18n.js`)
