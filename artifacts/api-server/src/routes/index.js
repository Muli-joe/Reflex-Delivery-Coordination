import { Router } from 'express';
import { getAuth } from '@clerk/express';
import healthRouter from './health.js';
import reflexRouter from './reflex.js';

const router = Router();

function requireAuth(req, res, next) {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
    });
  }
  req.userId = userId;
  next();
}

router.use(healthRouter);
router.use(requireAuth);
router.use(reflexRouter);

export default router;