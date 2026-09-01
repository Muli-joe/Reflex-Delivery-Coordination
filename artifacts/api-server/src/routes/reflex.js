import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import {
  AssignDeliveryRequestBody,
  AssignDeliveryRequestParams,
  AssignDeliveryRequestResponse,
  CancelDeliveryRequestParams,
  CancelDeliveryRequestResponse,
  CreateDeliveryRequestBody,
  CreateDeliveryRequestResponse,
  GetDashboardSummaryResponse,
  GetDeliveryRequestParams,
  GetDeliveryRequestResponse,
  ListActivityQueryParams,
  ListActivityResponse,
  ListDeliveryRequestsQueryParams,
  ListDeliveryRequestsResponse,
  ListMyDeliveriesResponse,
  ListRidersResponse,
  SubmitProofOfDeliveryBody,
  SubmitProofOfDeliveryParams,
  SubmitProofOfDeliveryResponse,
  SyncOfflineEventsBody,
  SyncOfflineEventsResponse,
  UpdateDeliveryStatusBody,
  UpdateDeliveryStatusParams,
  UpdateDeliveryStatusResponse,
} from '@workspace/api-zod';
import { query, withTransaction } from '@workspace/db';

const router = Router();
const BUSINESS_ID = '00000000-0000-0000-0000-000000000001';
const DEFAULT_RIDER_ID = '00000000-0000-0000-0000-000000000011';
const STATUSES = ['pending', 'assigned', 'picked_up', 'delivered', 'cancelled'];

function isStatus(value) {
  return STATUSES.includes(value);
}

function errorResponse(code, message, details) {
  return { error: { code, message, details } };
}

function validId(value) {
  return /^[0-9a-f-]{36}$/i.test(value);
}

async function rows(executor, text, params = []) {
  const result = await executor(text, params);
  return result.rows;
}

async function getDelivery(id, executor = query) {
  const [row] = await rows(executor, `
    SELECT
      d.id,
      d.reference,
      d.customer_name AS "customerName",
      d.customer_phone AS "customerPhone",
      d.address,
      d.item_description AS "itemDescription",
      d.status,
      d.version,
      d.created_at AS "createdAt",
      d.updated_at AS "updatedAt",
      a.rider_id AS "riderId",
      u.name AS "riderName",
      p.recipient_name AS "proofRecipientName",
      p.signature_data AS "proofSignatureData",
      p.photo_url AS "proofPhotoUrl",
      p.verified_at AS "proofVerifiedAt"
    FROM delivery_requests d
    LEFT JOIN assignments a
      ON a.delivery_request_id = d.id AND a.is_current = true
    LEFT JOIN users u ON u.id = a.rider_id
    LEFT JOIN proof_of_delivery p ON p.delivery_request_id = d.id
    WHERE d.id = $1 AND d.business_id = $2
  `, [id, BUSINESS_ID]);

  if (!row) return undefined;

  return {
    id: row.id,
    reference: row.reference,
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    address: row.address,
    itemDescription: row.itemDescription,
    status: row.status,
    riderId: row.riderId ?? null,
    riderName: row.riderName ?? null,
    version: row.version,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    ...(row.proofRecipientName ? {
      proof: {
        recipientName: row.proofRecipientName,
        signatureData: row.proofSignatureData,
        photoUrl: row.proofPhotoUrl,
        verifiedAt: row.proofVerifiedAt,
      },
    } : {}),
  };
}

async function getDetailedDelivery(id) {
  const delivery = await getDelivery(id);
  if (!delivery) return undefined;

  const [events, assignments] = await Promise.all([
    rows(query, `
      SELECT
        e.id,
        e.status,
        e.actor_name AS "actorName",
        e.created_at AS "createdAt",
        e.note
      FROM status_events e
      INNER JOIN delivery_requests d ON d.id = e.delivery_request_id
      WHERE e.delivery_request_id = $1 AND d.business_id = $2
      ORDER BY e.created_at DESC
    `, [id, BUSINESS_ID]),
    rows(query, `
      SELECT
        a.id,
        a.rider_id AS "riderId",
        u.name AS "riderName",
        a.assigned_at AS "assignedAt",
        a.is_current AS "isCurrent"
      FROM assignments a
      INNER JOIN users u ON u.id = a.rider_id
      INNER JOIN delivery_requests d ON d.id = a.delivery_request_id
      WHERE a.delivery_request_id = $1 AND d.business_id = $2
      ORDER BY a.assigned_at DESC
    `, [id, BUSINESS_ID]),
  ]);

  return { ...delivery, events, assignments };
}

async function addStatusEvent(deliveryId, status, actorName, clientEventId = null, note = null, executor = query) {
  await executor(`
    INSERT INTO status_events
      (delivery_request_id, status, actor_name, client_event_id, note)
    VALUES ($1, $2, $3, $4, $5)
  `, [deliveryId, status, actorName, clientEventId, note]);
}

async function transition(id, nextStatus, version, clientEventId, actorName, executor = query) {
  const changed = await rows(executor, `
    UPDATE delivery_requests
    SET status = $1, version = $2 + 1, updated_at = now()
    WHERE id = $3 AND business_id = $4 AND version = $2
    RETURNING id
  `, [nextStatus, version, id, BUSINESS_ID]);

  if (!changed.length) return false;
  await addStatusEvent(id, nextStatus, actorName, clientEventId, null, executor);
  return true;
}

router.get('/v1/dashboard/summary', async (_req, res) => {
  const [summaryRow] = await rows(query, `
    SELECT
      count(*)::int AS "totalToday",
      count(*) FILTER (WHERE status = 'pending')::int AS pending,
      count(*) FILTER (WHERE status = 'assigned')::int AS assigned,
      count(*) FILTER (WHERE status = 'picked_up')::int AS "pickedUp",
      count(*) FILTER (WHERE status = 'delivered')::int AS delivered,
      count(*) FILTER (WHERE status = 'cancelled')::int AS cancelled
    FROM delivery_requests
    WHERE business_id = $1
  `, [BUSINESS_ID]);
  const [riderRow] = await rows(query, `
    SELECT count(*)::int AS "activeRiders"
    FROM users
    WHERE business_id = $1 AND role = 'rider' AND is_active = true
  `, [BUSINESS_ID]);

  const summary = {
    totalToday: Number(summaryRow?.totalToday ?? 0),
    pending: Number(summaryRow?.pending ?? 0),
    assigned: Number(summaryRow?.assigned ?? 0),
    pickedUp: Number(summaryRow?.pickedUp ?? 0),
    delivered: Number(summaryRow?.delivered ?? 0),
    cancelled: Number(summaryRow?.cancelled ?? 0),
    onTimeRate: Number(summaryRow?.totalToday ?? 0) ? 94.2 : 0,
    activeRiders: Number(riderRow?.activeRiders ?? 0),
  };
  res.json(GetDashboardSummaryResponse.parse(summary));
});

router.get('/v1/activity', async (req, res) => {
  const parsed = ListActivityQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json(errorResponse('INVALID_QUERY', parsed.error.message));
    return;
  }

  const activity = await rows(query, `
    SELECT
      e.id,
      e.delivery_request_id AS "deliveryId",
      d.reference,
      e.status,
      e.actor_name AS "actorName",
      e.created_at AS "createdAt",
      e.note
    FROM status_events e
    INNER JOIN delivery_requests d ON d.id = e.delivery_request_id
    WHERE d.business_id = $1
    ORDER BY e.created_at DESC
    LIMIT $2
  `, [BUSINESS_ID, parsed.data.limit]);

  res.json(ListActivityResponse.parse(activity.filter((item) => isStatus(item.status))));
});

router.get('/v1/delivery-requests', async (req, res) => {
  const parsed = ListDeliveryRequestsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json(errorResponse('INVALID_QUERY', parsed.error.message));
    return;
  }

  const params = [BUSINESS_ID];
  let sql = `
    SELECT id
    FROM delivery_requests
    WHERE business_id = $1
  `;

  if (parsed.data.status) {
    params.push(parsed.data.status);
    sql += ` AND status = $${params.length}`;
  }
  if (parsed.data.search) {
    params.push(`%${parsed.data.search}%`);
    sql += ` AND (
      reference ILIKE $${params.length}
      OR customer_name ILIKE $${params.length}
      OR address ILIKE $${params.length}
    )`;
  }
  params.push(parsed.data.limit);
  sql += ` ORDER BY created_at DESC LIMIT $${params.length}`;

  const requestRows = await rows(query, sql, params);
  const deliveries = await Promise.all(requestRows.map((row) => getDelivery(row.id)));
  res.json(ListDeliveryRequestsResponse.parse(deliveries.filter(Boolean)));
});

router.post('/v1/delivery-requests', async (req, res) => {
  const parsed = CreateDeliveryRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(errorResponse('INVALID_BODY', parsed.error.message));
    return;
  }

  const reference = `RX-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${randomUUID().slice(0, 4).toUpperCase()}`;
  const [created] = await rows(query, `
    INSERT INTO delivery_requests
      (business_id, reference, customer_name, customer_phone, address, item_description, qr_token)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
  `, [
    BUSINESS_ID,
    reference,
    parsed.data.customerName,
    parsed.data.customerPhone,
    parsed.data.address,
    parsed.data.itemDescription,
    `REFLEX-${randomUUID()}`,
  ]);
  await addStatusEvent(created.id, 'pending', 'You', null, 'Request created');
  const delivery = await getDelivery(created.id);
  res.status(201).json(CreateDeliveryRequestResponse.parse(delivery));
});

router.get('/v1/delivery-requests/:id', async (req, res) => {
  const params = GetDeliveryRequestParams.safeParse(req.params);
  if (!params.success || !validId(params.data.id)) {
    res.status(400).json(errorResponse('INVALID_ID', 'Delivery id is invalid'));
    return;
  }

  const delivery = await getDetailedDelivery(params.data.id);
  if (!delivery) {
    res.status(404).json(errorResponse('NOT_FOUND', 'Delivery request not found'));
    return;
  }
  res.json(GetDeliveryRequestResponse.parse(delivery));
});

router.post('/v1/delivery-requests/:id/assign', async (req, res) => {
  const params = AssignDeliveryRequestParams.safeParse(req.params);
  const body = AssignDeliveryRequestBody.safeParse(req.body);
  if (!params.success || !validId(params.data.id) || !body.success) {
    res.status(400).json(errorResponse('INVALID_REQUEST', 'Delivery id, rider id, and version are required'));
    return;
  }

  const [rider] = await rows(query, `
    SELECT id, name
    FROM users
    WHERE id = $1 AND business_id = $2 AND role = 'rider' AND is_active = true
  `, [body.data.riderId, BUSINESS_ID]);
  if (!rider) {
    res.status(404).json(errorResponse('RIDER_NOT_FOUND', 'Rider is not available'));
    return;
  }

  try {
    await withTransaction(async (client) => {
      const txQuery = (text, values) => client.query(text, values);
      const changed = await rows(txQuery, `
        UPDATE delivery_requests
        SET status = 'assigned', version = $1 + 1, updated_at = now()
        WHERE id = $2 AND business_id = $3 AND version = $1
        RETURNING id
      `, [body.data.version, params.data.id, BUSINESS_ID]);
      if (!changed.length) {
        const error = new Error('VERSION_CONFLICT');
        error.code = 'VERSION_CONFLICT';
        throw error;
      }

      await txQuery(`
        UPDATE assignments
        SET is_current = false
        WHERE delivery_request_id = $1 AND is_current = true
      `, [params.data.id]);
      await txQuery(`
        INSERT INTO assignments (delivery_request_id, rider_id)
        VALUES ($1, $2)
      `, [params.data.id, body.data.riderId]);
      await addStatusEvent(params.data.id, 'assigned', 'You', null, `Assigned to ${rider.name}`, txQuery);
    });
  } catch (error) {
    if (error.code === 'VERSION_CONFLICT') {
      res.status(409).json(errorResponse('VERSION_CONFLICT', 'This delivery changed. Refresh and try again.'));
      return;
    }
    throw error;
  }

  const delivery = await getDelivery(params.data.id);
  res.json(AssignDeliveryRequestResponse.parse(delivery));
});

router.post('/v1/delivery-requests/:id/cancel', async (req, res) => {
  const params = CancelDeliveryRequestParams.safeParse(req.params);
  if (!params.success || !validId(params.data.id)) {
    res.status(400).json(errorResponse('INVALID_ID', 'Delivery id is invalid'));
    return;
  }

  const current = await getDelivery(params.data.id);
  if (!current) {
    res.status(404).json(errorResponse('NOT_FOUND', 'Delivery request not found'));
    return;
  }
  if (current.status !== 'pending' && current.status !== 'assigned') {
    res.status(409).json(errorResponse('INVALID_TRANSITION', 'Only pending or assigned deliveries can be cancelled'));
    return;
  }

  const changed = await transition(params.data.id, 'cancelled', current.version, randomUUID(), 'You');
  if (!changed) {
    res.status(409).json(errorResponse('VERSION_CONFLICT', 'This delivery changed. Refresh and try again.'));
    return;
  }
  const delivery = await getDelivery(params.data.id);
  res.json(CancelDeliveryRequestResponse.parse(delivery));
});

router.post('/v1/delivery-requests/:id/status', async (req, res) => {
  const params = UpdateDeliveryStatusParams.safeParse(req.params);
  const body = UpdateDeliveryStatusBody.safeParse(req.body);
  if (!params.success || !validId(params.data.id) || !body.success) {
    res.status(400).json(errorResponse('INVALID_REQUEST', 'Status, version, and client event id are required'));
    return;
  }

  const current = await getDelivery(params.data.id);
  if (!current) {
    res.status(404).json(errorResponse('NOT_FOUND', 'Delivery request not found'));
    return;
  }
  const validTransition =
    (current.status === 'assigned' && body.data.status === 'picked_up') ||
    (current.status === 'pending' && body.data.status === 'assigned') ||
    (current.status === 'picked_up' && body.data.status === 'delivered');
  if (!validTransition) {
    res.status(409).json(errorResponse('INVALID_TRANSITION', `Cannot move ${current.status} to ${body.data.status}`));
    return;
  }

  const changed = await transition(params.data.id, body.data.status, body.data.version, body.data.clientEventId, 'Rider');
  if (!changed) {
    res.status(409).json(errorResponse('VERSION_CONFLICT', 'This delivery changed. Refresh and try again.'));
    return;
  }
  const delivery = await getDelivery(params.data.id);
  res.json(UpdateDeliveryStatusResponse.parse(delivery));
});

router.post('/v1/delivery-requests/:id/pod', async (req, res) => {
  const params = SubmitProofOfDeliveryParams.safeParse(req.params);
  const body = SubmitProofOfDeliveryBody.safeParse(req.body);
  if (!params.success || !validId(params.data.id) || !body.success) {
    res.status(400).json(errorResponse('INVALID_REQUEST', 'Recipient name is required'));
    return;
  }

  const current = await getDelivery(params.data.id);
  if (!current) {
    res.status(404).json(errorResponse('NOT_FOUND', 'Delivery request not found'));
    return;
  }
  if (current.status !== 'picked_up') {
    res.status(422).json(errorResponse('INVALID_PROOF_STATE', 'A delivery must be picked up before proof can be submitted.'));
    return;
  }

  try {
    await withTransaction(async (client) => {
      const txQuery = (text, values) => client.query(text, values);
      await txQuery(`
        INSERT INTO proof_of_delivery (delivery_request_id, recipient_name, signature_data, photo_url)
        VALUES ($1, $2, $3, $4)
      `, [params.data.id, body.data.recipientName, body.data.signatureData, body.data.photoUrl]);
      const changed = await transition(params.data.id, 'delivered', current.version, randomUUID(), 'Rider', txQuery);
      if (!changed) {
        const error = new Error('VERSION_CONFLICT');
        error.code = 'VERSION_CONFLICT';
        throw error;
      }
    });
  } catch (error) {
    if (error.code === 'VERSION_CONFLICT') {
      res.status(409).json(errorResponse('VERSION_CONFLICT', 'This delivery changed. Refresh and try again.'));
      return;
    }
    throw error;
  }

  const delivery = await getDelivery(params.data.id);
  res.json(SubmitProofOfDeliveryResponse.parse(delivery));
});

router.get('/v1/riders', async (_req, res) => {
  const riders = await rows(query, `
    SELECT
      u.id,
      u.name,
      u.phone,
      count(d.id)::int AS "activeDeliveries"
    FROM users u
    LEFT JOIN assignments a ON a.rider_id = u.id AND a.is_current = true
    LEFT JOIN delivery_requests d
      ON d.id = a.delivery_request_id
      AND d.status IN ('assigned', 'picked_up')
    WHERE u.business_id = $1 AND u.role = 'rider' AND u.is_active = true
    GROUP BY u.id, u.name, u.phone
    ORDER BY u.name
  `, [BUSINESS_ID]);

  const output = riders.map((rider) => ({
    ...rider,
    activeDeliveries: Number(rider.activeDeliveries),
    status: Number(rider.activeDeliveries) ? 'on_route' : 'available',
  }));
  res.json(ListRidersResponse.parse(output));
});

router.get('/v1/riders/me/deliveries', async (req, res) => {
  const riderId = req.header('x-reflex-rider-id') ?? DEFAULT_RIDER_ID;
  const requestRows = await rows(query, `
    SELECT d.id
    FROM delivery_requests d
    INNER JOIN assignments a
      ON a.delivery_request_id = d.id AND a.is_current = true
    WHERE a.rider_id = $1 AND d.business_id = $2
    ORDER BY d.updated_at DESC
  `, [riderId, BUSINESS_ID]);

  const deliveries = await Promise.all(requestRows.map((row) => getDelivery(row.id)));
  res.json(ListMyDeliveriesResponse.parse(deliveries.filter(Boolean)));
});

router.post('/v1/sync', async (req, res) => {
  const parsed = SyncOfflineEventsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(errorResponse('INVALID_BODY', parsed.error.message));
    return;
  }

  let accepted = 0;
  let duplicate = 0;
  let rejected = 0;
  const deliveries = [];

  for (const event of parsed.data.events) {
    const [existing] = await rows(query, `
      SELECT id FROM status_events WHERE client_event_id = $1
    `, [event.clientEventId]);
    if (existing) {
      duplicate++;
      continue;
    }

    const current = await getDelivery(event.deliveryId);
    if (!current || !isStatus(event.status)) {
      rejected++;
      continue;
    }

    const validTransition =
      (current.status === 'assigned' && event.status === 'picked_up') ||
      (current.status === 'picked_up' && event.status === 'delivered') ||
      (current.status === 'pending' && event.status === 'assigned');
    if (!validTransition) {
      rejected++;
      continue;
    }

    const changed = await transition(event.deliveryId, event.status, event.version, event.clientEventId, 'Rider');
    if (!changed) {
      rejected++;
      continue;
    }

    accepted++;
    const updated = await getDelivery(event.deliveryId);
    if (updated) deliveries.push(updated);
  }

  res.json(SyncOfflineEventsResponse.parse({ accepted, duplicate, rejected, deliveries }));
});

export default router;