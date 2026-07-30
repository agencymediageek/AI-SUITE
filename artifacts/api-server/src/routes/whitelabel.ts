import { Router } from "express";
import { db } from "@workspace/db";
import { whitelabelConfigsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router = Router();

router.get("/whitelabel", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const [config] = await db.select().from(whitelabelConfigsTable).where(eq(whitelabelConfigsTable.userId, user.id));

    if (!config) {
      // Return default config
      res.json({
        id: null,
        userId: user.id,
        aiName: "APEX CORE",
        logoUrl: null,
        primaryColor: "#00FF41",
        accentColor: "#00FFFF",
        companyName: null,
        subdomain: null,
      });
      return;
    }

    res.json(config);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get white label config" });
  }
});

router.put("/whitelabel", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { aiName, logoUrl, primaryColor, accentColor, companyName, subdomain } = req.body;

    const [existing] = await db.select().from(whitelabelConfigsTable).where(eq(whitelabelConfigsTable.userId, user.id));

    const values = {
      ...(aiName !== undefined && { aiName }),
      ...(logoUrl !== undefined && { logoUrl }),
      ...(primaryColor !== undefined && { primaryColor }),
      ...(accentColor !== undefined && { accentColor }),
      ...(companyName !== undefined && { companyName }),
      ...(subdomain !== undefined && { subdomain }),
    };

    if (existing) {
      const [updated] = await db.update(whitelabelConfigsTable)
        .set(values)
        .where(eq(whitelabelConfigsTable.userId, user.id))
        .returning();
      res.json(updated);
    } else {
      const [created] = await db.insert(whitelabelConfigsTable)
        .values({ userId: user.id, ...values })
        .returning();
      res.json(created);
    }
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update white label config" });
  }
});

export default router;
