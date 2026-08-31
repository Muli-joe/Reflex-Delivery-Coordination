import { Router } from 'express';
import healthRouter from './health.js';
import reflexRouter from './reflex.js';

const router = Router();
router.use(healthRouter);
router.use(reflexRouter);

export default router;