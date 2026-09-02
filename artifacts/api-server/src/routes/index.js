import { Router } from 'express';
import { getAuth } from '@clerk/express';
import { query } from '@workspace/db';
import healthRouter from './health.js';
import reflexRouter from './reflex.js';

const router = Router();

async function requireAuth(req, res, next) {
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
  const result = await query(`
    SELECT id, business_id AS "businessId", name, role, is_active AS "isActive"
    FROM users
    WHERE clerk_user_id = $1
  `, [userId]);
  const actor = result.rows[0];
  if (!actor || !actor.isActive) {
    return res.status(403).json({
      error: { code: 'ACCOUNT_NOT_PROVISIONED', message: 'Your account is not an active RiderLink team member.' },
    });
  }
  req.actor = actor;
  next();
}

router.use(healthRouter);
router.use(requireAuth);
router.use(reflexRouter);

export default router;
