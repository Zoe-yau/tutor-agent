# Tutor

A 1:1 Socratic AI tutor. Pick a topic (or paste your own study material) and chat with a tutor that asks guiding questions and gives escalating hints before revealing answers. A side panel tracks mastery per concept and detected misconceptions.

Built with SvelteKit (Svelte 5 runes) + TypeScript, deployed to Cloudflare Pages, powered by the free Google Gemini API.

> **Privacy:** on the free tier, Google may use inputs to improve its models. Don't enter personal or confidential information. The app shows this notice in the footer.

## Requirements

- **Node.js 22+** (`.nvmrc` provided; Wrangler 4 requires it)
- A Gemini API key from https://aistudio.google.com/apikey

## Local setup

```sh
npm install
cp .env.example .dev.vars   # then put your key in .dev.vars (gitignored)
npm run dev                 # http://localhost:5173
```

To run under the Cloudflare runtime locally: `npm run build && npm run preview`.

| Script            | Purpose                                 |
| ----------------- | --------------------------------------- |
| `npm run dev`     | Vite dev server                         |
| `npm run build`   | Production build (adapter-cloudflare)   |
| `npm run preview` | Serve the build with `wrangler pages dev` |
| `npm run check`   | svelte-check / TypeScript               |
| `npm test`        | Vitest unit tests                       |

## Environment variables

| Name             | Where                                           | Notes                          |
| ---------------- | ----------------------------------------------- | ------------------------------ |
| `GEMINI_API_KEY` | `.dev.vars` locally; Pages secret in production | Server-only, never sent to the browser |

## Deploy to Cloudflare Pages

**Git integration (recommended)**

1. Push the repo to GitHub/GitLab.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git.
3. Framework preset: SvelteKit (or build command `npm run build`, output directory `.svelte-kit/cloudflare`).
4. Set the environment variable `NODE_VERSION=22`.
5. Settings → Variables and Secrets → add `GEMINI_API_KEY` as a **secret** (Production, and Preview if wanted).

**CLI**

```sh
npm run build
npx wrangler pages deploy .svelte-kit/cloudflare --project-name tutor
npx wrangler pages secret put GEMINI_API_KEY --project-name tutor
```

## Architecture

- `src/routes/api/chat/+server.ts`: streams tutor replies over server-sent events.
- `src/routes/api/analyze/+server.ts`: structured-JSON analysis of each student turn (validated by `parseAnalysis`; malformed output is ignored, never fatal).
- `src/lib/server/`: `gemini.ts` (SDK wrapper, retry with exponential backoff on 429/503), `rateLimit.ts`, `tutorPrompt.ts`, `schemas.ts`. Nothing under here is importable from client code.
- `src/lib/config.ts`: **all model IDs and limits in one place.**
- `src/lib/hintLadder.ts`: pure hint-level state machine (rises only when stuck or on request; resets per concept).
- `src/lib/storage.ts`: `TutorStorage` interface with a localStorage adapter. Implement it against Cloudflare D1 to persist server-side.

## Free-tier notes

- Model IDs are in `src/lib/config.ts`. Flash-Lite models are paid-tier only, so both tutoring and analysis use free Flash models. Re-check https://ai.google.dev/gemini-api/docs/pricing before changing them.
- Free-tier limits are tight and set per API key. Each student turn makes two requests (chat + analysis). The app retries 429s with backoff, applies a per-client limit (`LIMITS` in `config.ts`), shows a countdown when limited, and pauses mastery tracking rather than failing chat.
- The rate limiter is in-memory per Worker isolate, so it is best-effort. For strict limits, back it with Durable Objects or KV.
- The "no final answer at hint levels 1-2" rule is enforced by the system prompt only.
