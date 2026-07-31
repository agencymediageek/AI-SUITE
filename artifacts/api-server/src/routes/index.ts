import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import toolsRouter from "./tools.js";
import aiRouter from "./ai.js";
import userRouter from "./user.js";
import plansRouter from "./plans.js";
import dashboardRouter from "./dashboard.js";
import adminRouter from "./admin.js";
import paymentsRouter from "./payments.js";
import meetingsRouter from "./meetings.js";
import whitelabelRouter from "./whitelabel.js";
import wpTechSitesRouter from "./wp-techsites.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(toolsRouter);
router.use(aiRouter);
router.use(userRouter);
router.use(plansRouter);
router.use(dashboardRouter);
router.use(adminRouter);
router.use(paymentsRouter);
router.use(meetingsRouter);
router.use(whitelabelRouter);
router.use(wpTechSitesRouter);

export default router;
