/**
 * One-time script: create APEX CORE admin user
 * Run from project root: pnpm --filter @workspace/api-server tsx src/scripts/make-admin.ts
 *
 * If the email already exists, promotes the account to admin.
 * If not, creates the account with admin role and max tokens.
 */
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const EMAIL    = "admin@apex.techsites.ai";
const PASSWORD = "ApexAdmin@2026!";
const NAME     = "APEX Admin";

const existing = await db
  .select({ id: usersTable.id, role: usersTable.role })
  .from(usersTable)
  .where(eq(usersTable.email, EMAIL))
  .limit(1);

if (existing.length > 0) {
  await db
    .update(usersTable)
    .set({ role: "admin", tokenBalance: 9_999_999 })
    .where(eq(usersTable.email, EMAIL));
  console.log(`✅ Conta já existia — promovida para admin: ${EMAIL}`);
} else {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  await db.insert(usersTable).values({
    email: EMAIL,
    name: NAME,
    passwordHash,
    role: "admin",
    tokenBalance: 9_999_999,
    isActive: true,
  });
  console.log(`✅ Admin criado com sucesso:`);
  console.log(`   Email:  ${EMAIL}`);
  console.log(`   Senha:  ${PASSWORD}`);
  console.log(`   Tokens: 9.999.999`);
  console.log(`   URL:    https://apex.techsites.ai/admin`);
}

process.exit(0);
