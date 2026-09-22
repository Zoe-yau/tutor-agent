# API Integration Reference

## Overview

The React frontend is now fully integrated with the backend API. Users can chat with the tutor and see mastery updates in real-time.

## How It Works

### 1. **Chat Flow**

```
User types message → Submit → API /chat (streaming) → Tutor response appears token-by-token
                                 ↓
                            /api/analyze → Mastery panel updates
```

### 2. **Streaming Chat** (`/api/chat`)

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "..." },
    { "role": "model", "content": "..." }
  ],
  "hintLevel": 1,
  "topic": "Photosynthesis basics",
  "material": null
}
```

**Response:** Server-Sent Events (SSE)
```
event: token
data: {"type":"token","text":"Here's"}

event: token
data: {"type":"token","text":" an"}

event: done
data: {"type":"done"}

event: error (if error occurs)
data: {"type":"error","code":"rate_limited",...}
```

**Code in App.tsx:**
```typescript
const response = await fetch("/api/chat", { ... });
const reader = response.body?.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  // Parse SSE format
  // Append each token to tutorMessage
}
```

### 3. **Analysis** (`/api/analyze`)

**Request:**
```json
{
  "messages": [ ... ],
  "knownConcepts": [],
  "topic": "Photosynthesis basics"
}
```

**Response:**
```json
{
  "ok": true,
  "analysis": {
    "mastery": { "concept1": 0.85, "concept2": 0.70 },
    "misconceptions": ["Plants don't need CO2"],
    "concepts": ["Photosynthesis", "Light reactions"]
  }
}
```

**Code in App.tsx:**
```typescript
const response = await fetch("/api/analyze", { ... });
if (response.ok) {
  const data = await response.json();
  // Update mastery panel with data.analysis
}
```

## State Management

### State Variables

| Variable | Type | Purpose |
|----------|------|---------|
| `messages` | `Message[]` | Full conversation history |
| `isLoading` | `boolean` | Shows spinner during API call |
| `error` | `string \| null` | Error message display |
| `retryAfterMs` | `number \| null` | Rate limit countdown |
| `masteryData` | `MasteryData \| undefined` | Mastery panel data |
| `hintLevel` | `1 \| 2 \| 3 \| 4` | Hint detail level |
| `input` | `string` | User's typed message |

### Functions

| Function | Purpose |
|----------|---------|
| `streamChat()` | Calls `/api/chat` with SSE streaming |
| `analyzeResponse()` | Calls `/api/analyze` with current messages |
| `submit()` | Handler for form submission |

## UI Components

### Loading State
- Spinner in send button when `isLoading === true`
- Button disabled when loading or rate limited
- "..." shown in last tutor message while streaming

### Error Display
- Red error box with error message
- Shows "Retry in Ns..." countdown when rate limited
- Auto-clears when message successfully sent

### Mastery Panel
- Shows overall mastery percentage
- Lists concepts with progress bars
- Displays misconceptions when detected
- Updates after analysis completes

## Rate Limiting

When API returns 429:

```typescript
setRetryAfterMs(data.retryAfterMs || 10000);
setError("Rate limited. Please wait before trying again.");
```

Countdown timer:
```typescript
// Timer counts down retryAfterMs every 100ms
// Form button disabled while retryAfterMs > 0
```

## Error Handling

| Error | Handling |
|-------|----------|
| Network error | Show error message |
| 429 (rate limited) | Show countdown timer |
| 500 (server error) | Show generic error |
| Analysis fails | Log to console, don't block chat |

## SSE Parsing

```typescript
buffer += decoder.decode(value, { stream: true });
const lines = buffer.split("\n");
buffer = lines.pop() || ""; // Keep incomplete line

for (const line of lines) {
  if (line.startsWith("data: ")) {
    const event = JSON.parse(line.slice(6));
    if (event.type === "token" && event.text) {
      tutorMessage += event.text;
      // Update UI
    }
  }
}
```

## Auto-scroll

Chat container auto-scrolls to bottom when messages change:
```typescript
useEffect(() => {
  chatScrollRef.current?.scrollTo(0, chatScrollRef.current.scrollHeight);
}, [messages]);
```

## Next Steps for Polish

- [ ] Persist conversations to localStorage
- [ ] Save/load from Cloudflare D1 database
- [ ] Add "New conversation" button
- [ ] Show session duration timer
- [ ] Add copy message button
- [ ] Implement hint level UI (show 4 hints when requested)
- [ ] Add voice input/output
- [ ] Sync mastery across sessions

## Testing Checklist

- [x] Submit message works
- [x] Tutor response streams in real-time
- [x] Loading spinner shows
- [x] Mastery panel updates
- [x] Error messages display
- [x] Rate limit countdown shows
- [x] Form disables during loading
- [x] Auto-scroll works
- [ ] Works with real Gemini API key
- [ ] Handles long responses
- [ ] Works on mobile
- [ ] Handles connection drop gracefully

## Performance Notes

- Bundle size: 250 KB JS (77 KB gzipped)
- Streaming gives real-time feel
- Analysis is non-blocking (failures don't break chat)
- Rate limiting is per-client, best-effort
- For production: consider server-side rate limiting with KV or Durable Objects

## Deployment

```bash
# Build
npm run build

# Test locally
npm run dev      # Terminal 1: Frontend
npm run server   # Terminal 2: Backend API

# Deploy to Cloudflare Pages
git push origin frontend
# Or: npx wrangler pages deploy .svelte-kit/cloudflare --project-name tutor
```
