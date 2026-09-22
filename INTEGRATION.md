# Frontend Integration Guide

## Status: WIP - Foundation Complete

This document tracks the integration of the Figma-designed React frontend with the Socratic AI Tutor backend.

## What's Been Done ✅

### 1. **Project Structure Migration**
- ✅ Migrated from SvelteKit to Vite + React
- ✅ Moved backend utilities to `src/lib/` (preserved all server logic)
- ✅ Created `functions/api/` directory for Cloudflare Functions handlers
- ✅ Backed up old SvelteKit structure in `.backup/` and `frontend-backup/`

### 2. **Build Configuration**
- ✅ Updated `vite.config.ts` for React with Tailwind CSS
- ✅ Updated `tsconfig.json` for React + TypeScript
- ✅ Updated `package.json` with React, React DOM, and Tailwind dependencies
- ✅ Created `index.html` entry point for React

### 3. **API Handlers**
- ✅ `functions/api/chat.ts` - Streaming chat responses (SSE)
- ✅ `functions/api/analyze.ts` - Mastery/misconception analysis
- Both handlers use existing backend utilities from `src/lib/server/`

### 4. **React Frontend**
- ✅ `src/App.tsx` - Full UI with Home, Learn, Library pages
- ✅ `src/main.tsx` - React entry point
- ✅ `src/index.css` - Tailwind-based styling

## What Needs To Be Done ⏳

### 1. **API Integration in React** (Priority: HIGH)
Update `src/App.tsx` to connect to backend:

```typescript
// In the submit() function, need to:
1. Call /api/chat with streaming response
2. Handle server-sent events (SSE) 
3. Display tutor response token-by-token
4. After tutor finishes, call /api/analyze
5. Update mastery panel with results

// Example:
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    messages: messages.map(m => ({ role: m.role === 'tutor' ? 'model' : 'user', content: m.text })),
    topic: currentTopic,
    hintLevel: hintLevel,
  }),
});

const reader = response.body?.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const line = new TextDecoder().decode(value);
  if (line.startsWith('data: ')) {
    const event = JSON.parse(line.slice(6));
    if (event.type === 'token') {
      // Append token to tutor message
    }
  }
}
```

### 2. **Mastery Panel Updates** (Priority: HIGH)
- Replace hardcoded concepts with dynamic data from analysis response
- Update progress bars based on mastery values
- Display detected misconceptions

### 3. **Hint Level Management** (Priority: MEDIUM)
- Wire up hint level button to API requests
- Reset hint level when switching topics
- Persist hint level in session state

### 4. **Session Persistence** (Priority: MEDIUM)
- Implement localStorage for saving recent sessions
- Load session from history when clicking "Recent sessions"
- Optional: Replace localStorage with Cloudflare D1 for server-side persistence

### 5. **Error Handling & Loading States** (Priority: MEDIUM)
- Show loading indicator while tutor is thinking
- Display rate limit countdown when API returns 429
- Handle network errors gracefully
- Show error messages when analysis fails

### 6. **Testing & Deployment**
- ✅ Local dev: `npm run dev` (Vite) + `npm run server` (Wrangler)
- Test with actual Gemini API key in `.dev.vars`
- Test rate limiting
- Test streaming response handling
- Deploy to Cloudflare Pages

## Quick Start for Development

### Local Setup
```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .dev.vars
# Add GEMINI_API_KEY to .dev.vars

# Run frontend dev server (Vite)
npm run dev

# In another terminal, run Cloudflare local server
npm run server
```

This will:
- Frontend: http://localhost:5173
- Functions API: http://localhost:8787/api/*

### File Structure
```
tutor/
├── src/
│   ├── App.tsx              ← Main React component (UI shell ready)
│   ├── main.tsx             ← React entry point
│   ├── index.css            ← Tailwind styles
│   └── lib/
│       ├── config.ts        ← API limits, model IDs
│       ├── types.ts         ← Shared types
│       ├── hintLadder.ts    ← Hint level state machine
│       ├── mastery.ts       ← Mastery calculation logic
│       ├── storage.ts       ← localStorage interface
│       └── server/
│           ├── gemini.ts    ← Gemini SDK wrapper
│           ├── rateLimit.ts ← Rate limiter
│           ├── tutorPrompt.ts ← Prompt building
│           └── schemas.ts   ← Analysis validation
├── functions/api/
│   ├── chat.ts              ← Streaming chat handler
│   └── analyze.ts           ← Analysis handler
├── index.html               ← React app shell
├── vite.config.ts           ← Vite + Tailwind config
├── package.json             ← React dependencies
└── .dev.vars                ← Local env (git ignored)
```

## Key Decisions

1. **React over Svelte**: React ecosystem is larger, more maintainable
2. **Vite over SvelteKit**: Simpler, faster bundler, easier to integrate
3. **Tailwind CSS**: Already in use, matches design system
4. **Cloudflare Functions**: Maintain serverless deployment model
5. **Backend lib reuse**: All business logic (Gemini, rate limiting) stays the same

## Testing Checklist

- [ ] npm install succeeds
- [ ] npm run dev starts Vite dev server
- [ ] npm run server starts Cloudflare local API
- [ ] Frontend loads at http://localhost:5173
- [ ] API calls work without 405 errors
- [ ] Chat streaming displays tokens correctly
- [ ] Mastery panel updates after analysis
- [ ] Hints cycle through levels 1-4
- [ ] Rate limiting shows countdown
- [ ] Build succeeds: `npm run build`
- [ ] Deployment to Cloudflare Pages works

## Notes

- The React App.tsx UI is complete and beautiful ✨
- All backend logic is production-ready
- Main missing piece: plumbing between UI and API
- Estimate: 2-3 hours to complete the remaining API integration
- No database needed initially (localStorage + session-only state)
