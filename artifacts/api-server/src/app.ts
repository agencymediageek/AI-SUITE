import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());

// Capture raw body for Stripe webhook signature verification
// Must run BEFORE express.json() — Stripe needs the unmodified Buffer
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// ── Idempotent DB migrations (add columns that may be missing in older DBs) ──
import { db as _db } from "@workspace/db";
import { sql as _sql } from "drizzle-orm";
(async () => {
  try {
    await _db.execute(_sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_gateway TEXT`);
    await _db.execute(_sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT`);
    await _db.execute(_sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT`);
  } catch { /* table may not exist yet on first boot — harmless */ }
})();

// Serve static plugin ZIPs for download
import { join } from "path";
import { fileURLToPath } from "url";
const __dirname = fileURLToPath(new URL(".", import.meta.url));
app.use("/api/plugins", express.static(join(__dirname, "../public/plugins"), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".zip")) {
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="${filePath.split("/").pop()}"`);
    }
  }
}));

app.use("/api", router);

export default app;
