/**
 * One-time script: create admin user
 * Run from api-server dir: pnpm tsx src/scripts/make-admin.ts
 */
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const EMAIL = "admin@net.mediageek.io";
const PASSWORD = "Rprobos19@netmail";
const NAME = "Admin";

const existing = await db
  .select({ id: usersTable.id, role: usersTable.role })
  .from(usersTable)
  .where(eq(usersTable.email, EMAIL))
  .limit(1);

if (existing.length > 0) {
  await db.update(usersTable).set({ role: "admin" }).where(eq(usersTable.email, EMAIL));
  console.log(`✅ Promovido a admin: ${EMAIL}`);
} else {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  await db.insert(usersTable).values({
    email: EMAIL,
    name: NAME,
    passwordHash,
    role: "admin",
    tokenBalance: 9999999,
    isActive: true,
  });
  console.log(`✅ Admin criado: ${EMAIL}`);
}

process.exit(0);
