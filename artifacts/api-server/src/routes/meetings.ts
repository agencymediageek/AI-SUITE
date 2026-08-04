import { Router } from "express";
import { db } from "@workspace/db";
import { meetingsTable, meetingSessionsTable, usersTable } from "@workspace/db";
import { eq, and, desc, count, avg, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router = Router();

// ─── List meetings ────────────────────────────────────────────────────────────
router.get("/meetings", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const meetings = await db
      .select({
        id: meetingsTable.id,
        userId: meetingsTable.userId,
        title: meetingsTable.title,
        description: meetingsTable.description,
        company: meetingsTable.company,
        companyUrl: meetingsTable.companyUrl,
        logoUrl: meetingsTable.logoUrl,
        aiName: meetingsTable.aiName,
        language: meetingsTable.language,
        resources: meetingsTable.resources,
        briefingText: meetingsTable.briefingText,
        status: meetingsTable.status,
        createdAt: meetingsTable.createdAt,
        sessionCount: sql<number>`cast(count(${meetingSessionsTable.id}) as int)`,
        lastSessionAt: sql<string | null>`max(${meetingSessionsTable.startedAt})`,
      })
      .from(meetingsTable)
      .leftJoin(meetingSessionsTable, eq(meetingSessionsTable.meetingId, meetingsTable.id))
      .where(eq(meetingsTable.userId, user.id))
      .groupBy(meetingsTable.id)
      .orderBy(desc(meetingsTable.createdAt));

    res.json(meetings.map(m => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
      lastSessionAt: m.lastSessionAt ? new Date(m.lastSessionAt).toISOString() : null,
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list meetings" });
  }
});

// ─── Create meeting ───────────────────────────────────────────────────────────
router.post("/meetings", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { title, description, company, companyUrl, logoUrl, aiName, language, resources, briefingText } = req.body;
    if (!title) {
      res.status(400).json({ error: "Title is required" });
      return;
    }
    const [meeting] = await db.insert(meetingsTable).values({
      userId: user.id,
      title,
      description: description ?? null,
      company: company ?? null,
      companyUrl: companyUrl ?? null,
      logoUrl: logoUrl ?? null,
      aiName: aiName ?? "APEX CORE",
      language: language ?? "pt",
      resources: resources ?? [],
      briefingText: briefingText ?? null,
    }).returning();

    res.status(201).json({
      ...meeting,
      createdAt: meeting.createdAt.toISOString(),
      sessionCount: 0,
      lastSessionAt: null,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create meeting" });
  }
});

// ─── Meetings overview (wow endpoint) ────────────────────────────────────────
router.get("/meetings/overview", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;

    const [totalRow] = await db
      .select({ count: count() })
      .from(meetingsTable)
      .where(eq(meetingsTable.userId, user.id));

    const [sessionRow] = await db
      .select({
        total: count(),
        active: sql<number>`cast(sum(case when ${meetingSessionsTable.status} = 'active' then 1 else 0 end) as int)`,
        avgDuration: avg(
          sql<number>`extract(epoch from (coalesce(${meetingSessionsTable.endedAt}, now()) - ${meetingSessionsTable.startedAt})) / 60`
        ),
      })
      .from(meetingSessionsTable)
      .innerJoin(meetingsTable, eq(meetingsTable.id, meetingSessionsTable.meetingId))
      .where(eq(meetingsTable.userId, user.id));

    const recentSessions = await db
      .select({
        meetingId: meetingsTable.id,
        meetingTitle: meetingsTable.title,
        startedAt: meetingSessionsTable.startedAt,
        status: meetingSessionsTable.status,
      })
      .from(meetingSessionsTable)
      .innerJoin(meetingsTable, eq(meetingsTable.id, meetingSessionsTable.meetingId))
      .where(eq(meetingsTable.userId, user.id))
      .orderBy(desc(meetingSessionsTable.startedAt))
      .limit(5);

    res.json({
      totalMeetings: totalRow?.count ?? 0,
      totalSessions: Number(sessionRow?.total ?? 0),
      activeSessions: Number(sessionRow?.active ?? 0),
      avgDurationMinutes: sessionRow?.avgDuration ? Number(sessionRow.avgDuration) : null,
      recentSessions: recentSessions.map(s => ({
        ...s,
        startedAt: s.startedAt.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get overview" });
  }
});

// ─── Get meeting ──────────────────────────────────────────────────────────────
router.get("/meetings/:meetingId", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const meetingId = parseInt(req.params.meetingId);
    if (isNaN(meetingId)) { res.status(400).json({ error: "Invalid meeting ID" }); return; }

    const [row] = await db
      .select({
        id: meetingsTable.id,
        userId: meetingsTable.userId,
        title: meetingsTable.title,
        description: meetingsTable.description,
        company: meetingsTable.company,
        companyUrl: meetingsTable.companyUrl,
        logoUrl: meetingsTable.logoUrl,
        aiName: meetingsTable.aiName,
        language: meetingsTable.language,
        resources: meetingsTable.resources,
        briefingText: meetingsTable.briefingText,
        status: meetingsTable.status,
        createdAt: meetingsTable.createdAt,
        sessionCount: sql<number>`cast(count(${meetingSessionsTable.id}) as int)`,
        lastSessionAt: sql<string | null>`max(${meetingSessionsTable.startedAt})`,
      })
      .from(meetingsTable)
      .leftJoin(meetingSessionsTable, eq(meetingSessionsTable.meetingId, meetingsTable.id))
      .where(and(eq(meetingsTable.id, meetingId), eq(meetingsTable.userId, user.id)))
      .groupBy(meetingsTable.id);

    if (!row) { res.status(404).json({ error: "Meeting not found" }); return; }
    res.json({ ...row, createdAt: row.createdAt.toISOString(), lastSessionAt: row.lastSessionAt ? new Date(row.lastSessionAt).toISOString() : null });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get meeting" });
  }
});

// ─── Update meeting ───────────────────────────────────────────────────────────
router.patch("/meetings/:meetingId", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const meetingId = parseInt(req.params.meetingId);
    if (isNaN(meetingId)) { res.status(400).json({ error: "Invalid meeting ID" }); return; }

    const [existing] = await db.select().from(meetingsTable).where(and(eq(meetingsTable.id, meetingId), eq(meetingsTable.userId, user.id)));
    if (!existing) { res.status(404).json({ error: "Meeting not found" }); return; }

    const { title, description, company, companyUrl, logoUrl, aiName, language, resources, briefingText, status } = req.body;
    const [updated] = await db.update(meetingsTable)
      .set({
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(company !== undefined && { company }),
        ...(companyUrl !== undefined && { companyUrl }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(aiName !== undefined && { aiName }),
        ...(language !== undefined && { language }),
        ...(resources !== undefined && { resources }),
        ...(briefingText !== undefined && { briefingText }),
        ...(status !== undefined && { status }),
        updatedAt: new Date(),
      })
      .where(eq(meetingsTable.id, meetingId))
      .returning();

    res.json({ ...updated, createdAt: updated.createdAt.toISOString(), sessionCount: existing ? 0 : 0, lastSessionAt: null });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update meeting" });
  }
});

// ─── Delete meeting ───────────────────────────────────────────────────────────
router.delete("/meetings/:meetingId", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const meetingId = parseInt(req.params.meetingId);
    if (isNaN(meetingId)) { res.status(400).json({ error: "Invalid meeting ID" }); return; }

    const [existing] = await db.select().from(meetingsTable).where(and(eq(meetingsTable.id, meetingId), eq(meetingsTable.userId, user.id)));
    if (!existing) { res.status(404).json({ error: "Meeting not found" }); return; }

    await db.delete(meetingsTable).where(eq(meetingsTable.id, meetingId));
    res.json({ success: true, message: "Meeting deleted" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete meeting" });
  }
});

// ─── List sessions ────────────────────────────────────────────────────────────
router.get("/meetings/:meetingId/sessions", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const meetingId = parseInt(req.params.meetingId);
    if (isNaN(meetingId)) { res.status(400).json({ error: "Invalid meeting ID" }); return; }

    const [meeting] = await db.select().from(meetingsTable).where(and(eq(meetingsTable.id, meetingId), eq(meetingsTable.userId, user.id)));
    if (!meeting) { res.status(404).json({ error: "Meeting not found" }); return; }

    const sessions = await db
      .select()
      .from(meetingSessionsTable)
      .where(eq(meetingSessionsTable.meetingId, meetingId))
      .orderBy(desc(meetingSessionsTable.startedAt));

    res.json(sessions.map(s => ({
      ...s,
      startedAt: s.startedAt.toISOString(),
      endedAt: s.endedAt?.toISOString() ?? null,
      durationMinutes: s.endedAt ? Math.round((s.endedAt.getTime() - s.startedAt.getTime()) / 60000) : null,
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list sessions" });
  }
});

// ─── Start session ────────────────────────────────────────────────────────────
router.post("/meetings/:meetingId/sessions", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const meetingId = parseInt(req.params.meetingId);
    if (isNaN(meetingId)) { res.status(400).json({ error: "Invalid meeting ID" }); return; }

    const [meeting] = await db.select().from(meetingsTable).where(and(eq(meetingsTable.id, meetingId), eq(meetingsTable.userId, user.id)));
    if (!meeting) { res.status(404).json({ error: "Meeting not found" }); return; }

    const [session] = await db.insert(meetingSessionsTable).values({
      meetingId,
      status: "active",
    }).returning();

    res.status(201).json({
      ...session,
      startedAt: session.startedAt.toISOString(),
      endedAt: null,
      durationMinutes: null,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to start session" });
  }
});

// ─── Get session ──────────────────────────────────────────────────────────────
router.get("/meetings/:meetingId/sessions/:sessionId", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const meetingId = parseInt(req.params.meetingId);
    const sessionId = parseInt(req.params.sessionId);
    if (isNaN(meetingId) || isNaN(sessionId)) { res.status(400).json({ error: "Invalid ID" }); return; }

    const [meeting] = await db.select().from(meetingsTable).where(and(eq(meetingsTable.id, meetingId), eq(meetingsTable.userId, user.id)));
    if (!meeting) { res.status(404).json({ error: "Meeting not found" }); return; }

    const [session] = await db.select().from(meetingSessionsTable).where(and(eq(meetingSessionsTable.id, sessionId), eq(meetingSessionsTable.meetingId, meetingId)));
    if (!session) { res.status(404).json({ error: "Session not found" }); return; }

    res.json({
      ...session,
      startedAt: session.startedAt.toISOString(),
      endedAt: session.endedAt?.toISOString() ?? null,
      durationMinutes: session.endedAt ? Math.round((session.endedAt.getTime() - session.startedAt.getTime()) / 60000) : null,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get session" });
  }
});

// ─── End/update session ───────────────────────────────────────────────────────
router.patch("/meetings/:meetingId/sessions/:sessionId", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const meetingId = parseInt(req.params.meetingId);
    const sessionId = parseInt(req.params.sessionId);
    if (isNaN(meetingId) || isNaN(sessionId)) { res.status(400).json({ error: "Invalid ID" }); return; }

    const [meeting] = await db.select().from(meetingsTable).where(and(eq(meetingsTable.id, meetingId), eq(meetingsTable.userId, user.id)));
    if (!meeting) { res.status(404).json({ error: "Meeting not found" }); return; }

    const { summary, transcript, endedAt, status, builtAssets } = req.body;
    const endTs = endedAt ? new Date(endedAt) : (status === "ended" ? new Date() : undefined);

    const [updated] = await db.update(meetingSessionsTable)
      .set({
        ...(summary !== undefined && { summary }),
        ...(transcript !== undefined && { transcript }),
        ...(builtAssets !== undefined && { builtAssets }),
        ...(status !== undefined && { status }),
        ...(endTs !== undefined && { endedAt: endTs }),
      })
      .where(and(eq(meetingSessionsTable.id, sessionId), eq(meetingSessionsTable.meetingId, meetingId)))
      .returning();

    if (!updated) { res.status(404).json({ error: "Session not found" }); return; }
    res.json({
      ...updated,
      startedAt: updated.startedAt.toISOString(),
      endedAt: updated.endedAt?.toISOString() ?? null,
      durationMinutes: updated.endedAt ? Math.round((updated.endedAt.getTime() - updated.startedAt.getTime()) / 60000) : null,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update session" });
  }
});

// ─── Ask APEX ─────────────────────────────────────────────────────────────────
router.post("/meetings/:meetingId/ask", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const meetingId = parseInt(req.params.meetingId);
    if (isNaN(meetingId)) { res.status(400).json({ error: "Invalid meeting ID" }); return; }

    const [meeting] = await db.select().from(meetingsTable).where(and(eq(meetingsTable.id, meetingId), eq(meetingsTable.userId, user.id)));
    if (!meeting) { res.status(404).json({ error: "Meeting not found" }); return; }

    const { message, sessionId, imageBase64 } = req.body;
    if (!message) { res.status(400).json({ error: "Message is required" }); return; }

    const GROK_API_KEY = process.env["GROK"];
    if (!GROK_API_KEY) {
      res.status(500).json({ error: "AI service not configured" });
      return;
    }

    // Build system prompt with meeting context
    const systemPrompt = `You are ${meeting.aiName || "APEX CORE"}, an elite AI intelligence conducting a corporate meeting.
${meeting.company ? `This meeting is for: ${meeting.company}` : ""}
${meeting.briefingText ? `Company briefing: ${meeting.briefingText}` : ""}
Language: ${meeting.language === "pt" ? "Portuguese (Brazil)" : meeting.language === "es" ? "Spanish" : "English"}

You are fully capable of executing real actions: building websites, creating documents, configuring DNS, deploying infrastructure. When asked, describe what you are doing in real-time as if actively executing.
Available resources: ${meeting.resources?.join(", ") || "voice, analysis"}.
Be authoritative, intelligent, and precise. Respond in ${meeting.language === "pt" ? "Portuguese" : meeting.language === "es" ? "Spanish" : "English"}.`;

    const messages: any[] = [{ role: "system", content: systemPrompt }];
    if (imageBase64) {
      messages.push({
        role: "user",
        content: [
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
          { type: "text", text: message },
        ],
      });
    } else {
      messages.push({ role: "user", content: message });
    }

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${GROK_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "grok-3-mini", messages, max_tokens: 1024 }),
    });

    if (!response.ok) {
      const err = await response.text();
      req.log.error({ err }, "Grok API error");
      res.status(502).json({ error: "AI service error" });
      return;
    }

    const data = await response.json() as any;
    const aiMessage = data.choices?.[0]?.message?.content ?? "I'm processing your request.";
    const tokensUsed = data.usage?.total_tokens ?? 0;

    // Update session transcript if sessionId provided
    if (sessionId) {
      const [session] = await db.select().from(meetingSessionsTable)
        .where(and(eq(meetingSessionsTable.id, sessionId), eq(meetingSessionsTable.meetingId, meetingId)));
      if (session) {
        const prevTranscript = session.transcript ?? "";
        const newEntry = `\n[User]: ${message}\n[${meeting.aiName}]: ${aiMessage}`;
        await db.update(meetingSessionsTable)
          .set({ transcript: prevTranscript + newEntry })
          .where(eq(meetingSessionsTable.id, sessionId));
      }
    }

    res.json({ message: aiMessage, action: null, actionResult: null, tokensUsed });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to process request" });
  }
});

// ─── Analyze external URL ─────────────────────────────────────────────────────
router.post("/meetings/:meetingId/analyze-url", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const meetingId = parseInt(req.params.meetingId);
    if (isNaN(meetingId)) { res.status(400).json({ error: "Invalid meeting ID" }); return; }

    const [meeting] = await db.select().from(meetingsTable)
      .where(and(eq(meetingsTable.id, meetingId), eq(meetingsTable.userId, user.id)));
    if (!meeting) { res.status(404).json({ error: "Meeting not found" }); return; }

    const { url: rawUrl } = req.body;
    if (!rawUrl) { res.status(400).json({ error: "URL is required" }); return; }

    // SSRF protection: validate protocol, resolve DNS to block private targets,
    // and follow redirects manually so each hop is re-validated.
    const { assertPublicUrl, safeFetch } = await import("../lib/url-safety.js");
    let parsed: URL;
    try {
      parsed = await assertPublicUrl(rawUrl);
    } catch (validationErr: any) {
      res.status(400).json({ error: validationErr.message });
      return;
    }

    // Use safeFetch: redirect: "manual" + re-validation on every Location hop
    const fetchRes = await safeFetch(parsed, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; APEX-CORE/2.0; +https://apex.techsites.ai)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!fetchRes.ok) {
      res.status(502).json({ error: `URL returned HTTP ${fetchRes.status}` });
      return;
    }

    const html = await fetchRes.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch?.[1]?.trim() ?? "";

    // Strip HTML: remove scripts/styles/tags, decode entities, collapse whitespace
    const clean = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#\d+;/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim()
      .slice(0, 20000);

    res.json({ text: clean, title, url: parsed.href });
  } catch (err: any) {
    req.log.error(err);
    if (err.name === "TimeoutError") {
      res.status(504).json({ error: "URL request timed out" });
    } else {
      res.status(500).json({ error: err.message || "Failed to analyze URL" });
    }
  }
});

// ─── Index document (PDF / DOCX / TXT / CSV) ──────────────────────────────────
router.post("/meetings/:meetingId/index-document", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const meetingId = parseInt(req.params.meetingId);
    if (isNaN(meetingId)) { res.status(400).json({ error: "Invalid meeting ID" }); return; }

    const [meeting] = await db.select().from(meetingsTable)
      .where(and(eq(meetingsTable.id, meetingId), eq(meetingsTable.userId, user.id)));
    if (!meeting) { res.status(404).json({ error: "Meeting not found" }); return; }

    const { filename, content, mimeType } = req.body;
    if (!content) { res.status(400).json({ error: "Content is required" }); return; }

    const { parseDocumentBuffer } = await import("../lib/doc-parser.js");
    const text = await parseDocumentBuffer(content, mimeType || "", filename || "");

    res.json({ text, filename, characterCount: text.length });
  } catch (err: any) {
    req.log.error(err);
    res.status(500).json({ error: err.message || "Failed to index document" });
  }
});

// ─── Generate presentation slides from indexed document ───────────────────────
router.post("/meetings/:meetingId/generate-slides", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const meetingId = parseInt(req.params.meetingId);
    if (isNaN(meetingId)) { res.status(400).json({ error: "Invalid meeting ID" }); return; }

    const [meeting] = await db.select().from(meetingsTable)
      .where(and(eq(meetingsTable.id, meetingId), eq(meetingsTable.userId, user.id)));
    if (!meeting) { res.status(404).json({ error: "Meeting not found" }); return; }

    const { documentText, language, filename } = req.body;
    if (!documentText) { res.status(400).json({ error: "documentText is required" }); return; }

    const GROK_API_KEY = process.env["GROK"];
    if (!GROK_API_KEY) { res.status(500).json({ error: "AI service not configured" }); return; }

    const lang = language === "pt" ? "Portuguese (Brazil)" : language === "es" ? "Spanish" : "English";
    const excerpt = documentText.slice(0, 12000);

    const systemPrompt = `You are a presentation designer. Create a professional slide deck from the provided document.
Return ONLY valid JSON — an array of slide objects. No markdown, no commentary.
Each slide: { "title": "string", "bullets": ["string", ...], "notes": "string (optional speaker note)" }
Rules:
- 5 to 12 slides depending on content length
- First slide: title/overview; last slide: conclusion/next steps
- Each bullet: concise, max 15 words
- 3 to 5 bullets per slide
- Respond in ${lang}`;

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${GROK_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "grok-3-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Document: "${filename || "document"}"\n\n${excerpt}` },
        ],
        max_tokens: 4096,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      req.log.error({ errText }, "Grok slides error");
      res.status(502).json({ error: "AI service error" });
      return;
    }

    const data = await response.json() as any;
    const raw = data.choices?.[0]?.message?.content ?? "[]";

    let slides: any[];
    try {
      const parsed = JSON.parse(raw);
      // Handle both array and { slides: [...] } shapes
      slides = Array.isArray(parsed) ? parsed : (parsed.slides ?? parsed.data ?? []);
    } catch {
      // Fallback: extract JSON array from raw string
      const match = raw.match(/\[[\s\S]*\]/);
      slides = match ? JSON.parse(match[0]) : [];
    }

    // Validate shape
    slides = slides
      .filter((s: any) => s && typeof s.title === "string")
      .map((s: any) => ({
        title: String(s.title),
        bullets: Array.isArray(s.bullets) ? s.bullets.map(String) : [],
        notes: s.notes ? String(s.notes) : undefined,
      }));

    if (slides.length === 0) {
      res.status(422).json({ error: "AI did not return valid slides" });
      return;
    }

    res.json({ slides });
  } catch (err: any) {
    req.log.error(err);
    res.status(500).json({ error: err.message || "Failed to generate slides" });
  }
});

export default router;
