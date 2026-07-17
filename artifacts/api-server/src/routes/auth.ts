import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, signToken } from "../lib/auth.js";

const router = Router();

router.post("/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ error: "Email, password, and name are required" });
      return;
    }
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(usersTable).values({ email, name, passwordHash, tokenBalance: 1000 }).returning();
    const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role });
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, tokenBalance: user.tokenBalance, planId: user.planId, planName: user.planName, planExpiresAt: user.planExpiresAt?.toISOString() ?? null, paymentGateway: user.paymentGateway ?? null, createdAt: user.createdAt.toISOString() } });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, tokenBalance: user.tokenBalance, planId: user.planId, planName: user.planName, planExpiresAt: user.planExpiresAt?.toISOString() ?? null, paymentGateway: user.paymentGateway ?? null, createdAt: user.createdAt.toISOString() } });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/auth/logout", (_req, res) => {
  res.json({ success: true, message: "Logged out" });
});

router.get("/auth/me", requireAuth, (req, res) => {
  const user = (req as any).user;
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tokenBalance: user.tokenBalance,
    planId: user.planId,
    planName: user.planName,
    planExpiresAt: user.planExpiresAt ? user.planExpiresAt.toISOString() : null,
    paymentGateway: user.paymentGateway ?? null,
    createdAt: user.createdAt.toISOString(),
  });
});

export default router;
