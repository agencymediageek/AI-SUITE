/**
 * TTS (Text-to-Speech) — ElevenLabs with browser fallback signal
 *
 * POST /api/tts
 * Body: { text: string; voiceId?: string; language?: string }
 * Returns: audio/mpeg stream when ELEVENLABS_API_KEY is configured.
 *          503 { error, fallback: true } when key is not set (client uses browser TTS).
 */

import { Router } from "express";
import { requireAuth } from "../lib/auth.js";

const router = Router();

// Good multilingual voices:
// pNInz6obpgDQGcFmaJgB — Adam (EN, clear & deep)
// EXAVITQu4vr4xnSDxMaL — Bella (multilingual)
// XB0fDUnXU5powFXDhCwa — Charlotte (warm, multilingual)
const DEFAULT_VOICE_ID = process.env["ELEVENLABS_VOICE_ID"] ?? "EXAVITQu4vr4xnSDxMaL";
const MODEL_ID = "eleven_multilingual_v2";

router.post("/tts", requireAuth, async (req, res) => {
  const apiKey = process.env["ELEVENLABS_API_KEY"];
  if (!apiKey) {
    res.status(503).json({ error: "ElevenLabs not configured", fallback: true });
    return;
  }

  const { text, voiceId, language } = req.body as {
    text?: string;
    voiceId?: string;
    language?: string;
  };

  if (!text?.trim()) {
    res.status(400).json({ error: "text is required" });
    return;
  }

  // Clamp to 4 000 chars — ElevenLabs max per request
  const clampedText = text.slice(0, 4000);
  const voice = voiceId ?? DEFAULT_VOICE_ID;

  try {
    const elRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}/stream`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: clampedText,
          model_id: MODEL_ID,
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.80,
            style: 0.15,
            use_speaker_boost: true,
          },
        }),
        signal: AbortSignal.timeout(30_000),
      }
    );

    if (!elRes.ok) {
      const errBody = await elRes.text().catch(() => "");
      req.log.error({ status: elRes.status, errBody }, "ElevenLabs API error");
      res.status(502).json({ error: "ElevenLabs error", fallback: true });
      return;
    }

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Voice-Id", voice);

    // Stream audio bytes straight to client
    const reader = (elRes.body as any)?.getReader?.();
    if (reader) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(Buffer.from(value));
        }
      } finally {
        reader.releaseLock();
      }
      res.end();
    } else {
      // Node.js fetch — pipe readable stream
      const buf = Buffer.from(await elRes.arrayBuffer());
      res.setHeader("Content-Length", buf.length);
      res.end(buf);
    }
  } catch (err) {
    req.log.error(err, "TTS request failed");
    res.status(500).json({ error: "TTS request failed", fallback: true });
  }
});

export default router;
