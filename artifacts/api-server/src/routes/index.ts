import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import toolsRouter from "./tools.js";
import aiRouter from "./ai.js";
import userRouter from "./user.js";
import plansRouter from "./plans.js";
import dashboardRouter from "./dashboard.js";
import adminRouter from "./admin.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(toolsRouter);
router.use(aiRouter);
router.use(userRouter);
router.use(plansRouter);
router.use(dashboardRouter);
router.use(adminRouter);

export default router;
