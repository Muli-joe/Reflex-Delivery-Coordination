import { Router, type IRouter } from "express";
import healthRouter from "./health";
import reflexRouter from "./reflex";

const router: IRouter = Router();

router.use(healthRouter);
router.use(reflexRouter);

export default router;
