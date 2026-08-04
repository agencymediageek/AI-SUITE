import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
const [user] = await db.select({ id: usersTable.id, email: usersTable.email, role: usersTable.role, hashLen: usersTable.passwordHash }).from(usersTable).where(eq(usersTable.email, "admin@apex.techsites.ai")).limit(1);
console.log(JSON.stringify({ ...user, hashLen: user?.hashLen?.length }));
process.exit(0);
