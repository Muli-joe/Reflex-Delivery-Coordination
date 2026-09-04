import { Router } from 'express';
import { getAuth } from '@clerk/express';
import { query, withTransaction } from '@workspace/db';
import healthRouter from './health.js';
import reflexRouter from './reflex.js';

const router = Router();

const ACTOR_SELECT = `
  SELECT id, business_id AS "businessId", name, role, is_active AS "isActive"
  FROM users
`;

async function findActor(userId) {
  const result = await query(`
    ${ACTOR_SELECT}
    WHERE clerk_user_id = $1
  `, [userId]);
  return result.rows[0];
}

async function bootstrapFirstDispatcher(userId) {
  return withTransaction(async (client) => {
    const linked = await client.query(`
      SELECT 1
      FROM users
      WHERE clerk_user_id IS NOT NULL
      LIMIT 1
    `);
    if (linked.rows.length) return undefined;

    const candidate = await client.query(`
      SELECT id
      FROM users
      WHERE clerk_user_id IS NULL
        AND is_active = true
        AND role IN ('owner', 'admin', 'dispatcher')
      ORDER BY CASE role
        WHEN 'dispatcher' THEN 1
        WHEN 'admin' THEN 2
        WHEN 'owner' THEN 3
        ELSE 4
      END, created_at
      LIMIT 1
      FOR UPDATE
    `);
    if (!candidate.rows[0]) return undefined;

    const result = await client.query(`
      UPDATE users
      SET clerk_user_id = $1
      WHERE id = $2
      RETURNING id, business_id AS "businessId", name, role, is_active AS "isActive"
    `, [userId, candidate.rows[0].id]);
    return result.rows[0];
  });
}

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
  let actor = await findActor(userId);
  if (!actor) {
    actor = await bootstrapFirstDispatcher(userId);
  }
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
router.get('/v1/me', (req, res) => {
  res.json({
    id: req.actor.id,
    businessId: req.actor.businessId,
    name: req.actor.name,
    role: req.actor.role,
  });
});
router.use(reflexRouter);

export default router;
