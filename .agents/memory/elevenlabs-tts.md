---
name: ElevenLabs TTS
description: Backend TTS route + frontend integration in APEX live meeting page
---

## Backend
- Route: `POST /api/tts` in `artifacts/api-server/src/routes/tts.ts`
- Auth: requireAuth (JWT)
- Env vars: `ELEVENLABS_API_KEY` (required), `ELEVENLABS_VOICE_ID` (optional, default: EXAVITQu4vr4xnSDxMaL = Charlotte multilingual)
- Model: `eleven_multilingual_v2` — supports PT, EN, ES natively
- Returns: `audio/mpeg` stream; `503 { fallback: true }` when key not configured
- Text clamped to 4000 chars

## Frontend (live.tsx)
- `speakBrowser()` — existing browser SpeechSynthesis (fallback, mic-loop-safe)
- `speakResponse()` — async; tries POST /api/tts first; plays via `new Audio(blob)` tracked in `currentAudioRef`; on 503 or error falls back to `speakBrowser()`
- `stopSpeaking()` — pauses `currentAudioRef.current` AND cancels browser TTS

**Why:** Browser TTS sounds robotic; ElevenLabs sounds professional for investor demos. The 503 fallback means it works even without the key configured.

**How to apply:** Set `ELEVENLABS_API_KEY` in Replit Secrets. Optionally set `ELEVENLABS_VOICE_ID` for a different voice. Test at `/meetings/:id/live`.
