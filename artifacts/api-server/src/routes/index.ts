import { Router } from "express";
import healthRouter from "./health";
import riskRouter from "./risk";

const router: Router = Router();

router.use(healthRouter);
router.use(riskRouter);

export default router;
