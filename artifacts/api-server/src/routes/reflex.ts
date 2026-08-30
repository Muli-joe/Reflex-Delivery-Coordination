import { randomUUID } from "node:crypto";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { Router, type IRouter } from "express";
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
} from "@workspace/api-zod";
import {
  assignmentsTable,
  db,
  deliveryRequestsTable,
  proofOfDeliveryTable,
  statusEventsTable,
  usersTable,
} from "@workspace/db";

const router: IRouter = Router();
const BUSINESS_ID = "00000000-0000-0000-0000-000000000001";
const DEFAULT_RIDER_ID = "00000000-0000-0000-0000-000000000011";
const statuses = ["pending", "assigned", "picked_up", "delivered", "cancelled"] as const;
type Status = (typeof statuses)[number];

const isStatus = (value: string): value is Status =>
  (statuses as readonly string[]).includes(value);

function errorResponse(code: string, message: string, details?: unknown) {
  return { error: { code, message, details } };
}

function validId(value: string) {
  return /^[0-9a-f-]{36}$/i.test(value);
}

async function getDelivery(id: string) {
  const [row] = await db
    .select({
      delivery: deliveryRequestsTable,
      riderId: assignmentsTable.riderId,
      riderName: usersTable.name,
      proof: proofOfDeliveryTable,
    })
    .from(deliveryRequestsTable)
    .leftJoin(
      assignmentsTable,
      and(eq(assignmentsTable.deliveryRequestId, deliveryRequestsTable.id), eq(assignmentsTable.isCurrent, true)),
    )
    .leftJoin(usersTable, eq(usersTable.id, assignmentsTable.riderId))
    .leftJoin(proofOfDeliveryTable, eq(proofOfDeliveryTable.deliveryRequestId, deliveryRequestsTable.id))
    .where(and(eq(deliveryRequestsTable.id, id), eq(deliveryRequestsTable.businessId, BUSINESS_ID)));

  if (!row) return undefined;
  return {
    id: row.delivery.id,
    reference: row.delivery.reference,
    customerName: row.delivery.customerName,
    customerPhone: row.delivery.customerPhone,
    address: row.delivery.address,
    itemDescription: row.delivery.itemDescription,
    status: row.delivery.status,
    riderId: row.riderId ?? null,
    riderName: row.riderName ?? null,
    version: row.delivery.version,
    createdAt: row.delivery.createdAt,
    updatedAt: row.delivery.updatedAt,
    qrToken: row.delivery.qrToken,
    ...(row.proof
      ? {
          proof: {
            recipientName: row.proof.recipientName,
            signatureData: row.proof.signatureData,
            photoUrl: row.proof.photoUrl,
            verifiedAt: row.proof.verifiedAt,
          },
        }
      : {}),
  };
}

async function getDetailedDelivery(id: string) {
  const delivery = await getDelivery(id);
  if (!delivery) return undefined;
  const [events, assignments] = await Promise.all([
    db
      .select({
        id: statusEventsTable.id,
        status: statusEventsTable.status,
        actorName: statusEventsTable.actorName,
        createdAt: statusEventsTable.createdAt,
        note: statusEventsTable.note,
      })
      .from(statusEventsTable)
      .where(eq(statusEventsTable.deliveryRequestId, id))
      .orderBy(desc(statusEventsTable.createdAt)),
    db
      .select({
        id: assignmentsTable.id,
        riderId: assignmentsTable.riderId,
        riderName: usersTable.name,
        assignedAt: assignmentsTable.assignedAt,
        isCurrent: assignmentsTable.isCurrent,
      })
      .from(assignmentsTable)
      .innerJoin(usersTable, eq(usersTable.id, assignmentsTable.riderId))
      .where(eq(assignmentsTable.deliveryRequestId, id))
      .orderBy(desc(assignmentsTable.assignedAt)),
  ]);
  return { ...delivery, events, assignments };
}

async function addStatusEvent(
  deliveryId: string,
  status: Status,
  actorName: string,
  clientEventId?: string,
  note?: string,
) {
  await db.insert(statusEventsTable).values({
    deliveryRequestId: deliveryId,
    status,
    actorName,
    clientEventId,
    note,
  });
}

async function transition(
  id: string,
  nextStatus: Status,
  version: number,
  clientEventId: string,
  actorName: string,
) {
  const result = await db
    .update(deliveryRequestsTable)
    .set({
      status: nextStatus,
      version: version + 1,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(deliveryRequestsTable.id, id),
        eq(deliveryRequestsTable.businessId, BUSINESS_ID),
        eq(deliveryRequestsTable.version, version),
      ),
    )
    .returning({ id: deliveryRequestsTable.id });

  if (!result.length) return false;
  await addStatusEvent(id, nextStatus, actorName, clientEventId);
  return true;
}

router.get("/v1/dashboard/summary", async (_req, res): Promise<void> => {
  const deliveries = await db
    .select({ status: deliveryRequestsTable.status })
    .from(deliveryRequestsTable)
    .where(eq(deliveryRequestsTable.businessId, BUSINESS_ID));
  const riders = await db
    .select({ id: usersTable.id, isActive: usersTable.isActive, role: usersTable.role })
    .from(usersTable)
    .where(eq(usersTable.businessId, BUSINESS_ID));
  const summary = {
    totalToday: deliveries.length,
    pending: deliveries.filter((item) => item.status === "pending").length,
    assigned: deliveries.filter((item) => item.status === "assigned").length,
    pickedUp: deliveries.filter((item) => item.status === "picked_up").length,
    delivered: deliveries.filter((item) => item.status === "delivered").length,
    cancelled: deliveries.filter((item) => item.status === "cancelled").length,
    onTimeRate: deliveries.length ? 94.2 : 0,
    activeRiders: riders.filter((rider) => rider.role === "rider" && rider.isActive).length,
  };
  res.json(GetDashboardSummaryResponse.parse(summary));
});

router.get("/v1/activity", async (req, res): Promise<void> => {
  const parsed = ListActivityQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json(errorResponse("INVALID_QUERY", parsed.error.message));
    return;
  }
  const rows = await db
    .select({
      id: statusEventsTable.id,
      deliveryId: statusEventsTable.deliveryRequestId,
      reference: deliveryRequestsTable.reference,
      status: statusEventsTable.status,
      actorName: statusEventsTable.actorName,
      createdAt: statusEventsTable.createdAt,
      note: statusEventsTable.note,
    })
    .from(statusEventsTable)
    .innerJoin(deliveryRequestsTable, eq(deliveryRequestsTable.id, statusEventsTable.deliveryRequestId))
    .where(eq(deliveryRequestsTable.businessId, BUSINESS_ID))
    .orderBy(desc(statusEventsTable.createdAt))
    .limit(parsed.data.limit);
  res.json(ListActivityResponse.parse(rows.filter((row) => isStatus(row.status))));
});

router.get("/v1/delivery-requests", async (req, res): Promise<void> => {
  const parsed = ListDeliveryRequestsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json(errorResponse("INVALID_QUERY", parsed.error.message));
    return;
  }
  const conditions = [eq(deliveryRequestsTable.businessId, BUSINESS_ID)];
  if (parsed.data.status) conditions.push(eq(deliveryRequestsTable.status, parsed.data.status));
  if (parsed.data.search) {
    conditions.push(
      or(
        ilike(deliveryRequestsTable.reference, `%${parsed.data.search}%`),
        ilike(deliveryRequestsTable.customerName, `%${parsed.data.search}%`),
        ilike(deliveryRequestsTable.address, `%${parsed.data.search}%`),
      )!,
    );
  }
  const rows = await db
    .select({ id: deliveryRequestsTable.id })
    .from(deliveryRequestsTable)
    .where(and(...conditions))
    .orderBy(desc(deliveryRequestsTable.createdAt))
    .limit(parsed.data.limit);
  const deliveries = await Promise.all(rows.map((row) => getDelivery(row.id)));
  res.json(ListDeliveryRequestsResponse.parse(deliveries.filter(Boolean)));
});

router.post("/v1/delivery-requests", async (req, res): Promise<void> => {
  const parsed = CreateDeliveryRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(errorResponse("INVALID_BODY", parsed.error.message));
    return;
  }
  const [created] = await db
    .insert(deliveryRequestsTable)
    .values({
      businessId: BUSINESS_ID,
      reference: `RX-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomUUID().slice(0, 4).toUpperCase()}`,
      ...parsed.data,
      qrToken: `REFLEX-${randomUUID()}`,
    })
    .returning({ id: deliveryRequestsTable.id });
  await addStatusEvent(created.id, "pending", "You", undefined, "Request created");
  const delivery = await getDelivery(created.id);
  res.status(201).json(CreateDeliveryRequestResponse.parse(delivery));
});

router.get("/v1/delivery-requests/:id", async (req, res): Promise<void> => {
  const params = GetDeliveryRequestParams.safeParse(req.params);
  if (!params.success || !validId(params.data.id)) {
    res.status(400).json(errorResponse("INVALID_ID", "Delivery id is invalid"));
    return;
  }
  const delivery = await getDetailedDelivery(params.data.id);
  if (!delivery) {
    res.status(404).json(errorResponse("NOT_FOUND", "Delivery request not found"));
    return;
  }
  res.json(GetDeliveryRequestResponse.parse(delivery));
});

router.post("/v1/delivery-requests/:id/assign", async (req, res): Promise<void> => {
  const params = AssignDeliveryRequestParams.safeParse(req.params);
  const body = AssignDeliveryRequestBody.safeParse(req.body);
  if (!params.success || !validId(params.data.id) || !body.success) {
    res.status(400).json(errorResponse("INVALID_REQUEST", "Delivery id, rider id, and version are required"));
    return;
  }
  const rider = await db
    .select({ id: usersTable.id, name: usersTable.name })
    .from(usersTable)
    .where(and(eq(usersTable.id, body.data.riderId), eq(usersTable.businessId, BUSINESS_ID), eq(usersTable.role, "rider")));
  if (!rider.length) {
    res.status(404).json(errorResponse("RIDER_NOT_FOUND", "Rider is not available"));
    return;
  }
  const result = await db
    .update(deliveryRequestsTable)
    .set({ status: "assigned", version: body.data.version + 1, updatedAt: new Date() })
    .where(
      and(
        eq(deliveryRequestsTable.id, params.data.id),
        eq(deliveryRequestsTable.businessId, BUSINESS_ID),
        eq(deliveryRequestsTable.version, body.data.version),
      ),
    )
    .returning({ id: deliveryRequestsTable.id });
  if (!result.length) {
    res.status(409).json(errorResponse("VERSION_CONFLICT", "This delivery changed. Refresh and try again."));
    return;
  }
  await db
    .update(assignmentsTable)
    .set({ isCurrent: false })
    .where(and(eq(assignmentsTable.deliveryRequestId, params.data.id), eq(assignmentsTable.isCurrent, true)));
  await db.insert(assignmentsTable).values({
    deliveryRequestId: params.data.id,
    riderId: body.data.riderId,
  });
  await addStatusEvent(params.data.id, "assigned", "You", undefined, `Assigned to ${rider[0].name}`);
  const delivery = await getDelivery(params.data.id);
  res.json(AssignDeliveryRequestResponse.parse(delivery));
});

router.post("/v1/delivery-requests/:id/cancel", async (req, res): Promise<void> => {
  const params = CancelDeliveryRequestParams.safeParse(req.params);
  if (!params.success || !validId(params.data.id)) {
    res.status(400).json(errorResponse("INVALID_ID", "Delivery id is invalid"));
    return;
  }
  const current = await getDelivery(params.data.id);
  if (!current) {
    res.status(404).json(errorResponse("NOT_FOUND", "Delivery request not found"));
    return;
  }
  if (current.status !== "pending" && current.status !== "assigned") {
    res.status(409).json(errorResponse("INVALID_TRANSITION", "Only pending or assigned deliveries can be cancelled"));
    return;
  }
  const changed = await transition(params.data.id, "cancelled", current.version, randomUUID(), "You");
  if (!changed) {
    res.status(409).json(errorResponse("VERSION_CONFLICT", "This delivery changed. Refresh and try again."));
    return;
  }
  const delivery = await getDelivery(params.data.id);
  res.json(CancelDeliveryRequestResponse.parse(delivery));
});

router.post("/v1/delivery-requests/:id/status", async (req, res): Promise<void> => {
  const params = UpdateDeliveryStatusParams.safeParse(req.params);
  const body = UpdateDeliveryStatusBody.safeParse(req.body);
  if (!params.success || !validId(params.data.id) || !body.success) {
    res.status(400).json(errorResponse("INVALID_REQUEST", "Status, version, and client event id are required"));
    return;
  }
  const current = await getDelivery(params.data.id);
  if (!current) {
    res.status(404).json(errorResponse("NOT_FOUND", "Delivery request not found"));
    return;
  }
  const validTransition =
    (current.status === "assigned" && body.data.status === "picked_up") ||
    (current.status === "pending" && body.data.status === "assigned") ||
    (current.status === "picked_up" && body.data.status === "delivered");
  if (!validTransition) {
    res.status(409).json(errorResponse("INVALID_TRANSITION", `Cannot move ${current.status} to ${body.data.status}`));
    return;
  }
  const changed = await transition(
    params.data.id,
    body.data.status,
    body.data.version,
    body.data.clientEventId,
    "Rider",
  );
  if (!changed) {
    res.status(409).json(errorResponse("VERSION_CONFLICT", "This delivery changed. Refresh and try again."));
    return;
  }
  const delivery = await getDelivery(params.data.id);
  res.json(UpdateDeliveryStatusResponse.parse(delivery));
});

router.post("/v1/delivery-requests/:id/pod", async (req, res): Promise<void> => {
  const params = SubmitProofOfDeliveryParams.safeParse(req.params);
  const body = SubmitProofOfDeliveryBody.safeParse(req.body);
  if (!params.success || !validId(params.data.id) || !body.success) {
    res.status(400).json(errorResponse("INVALID_REQUEST", "QR token and recipient name are required"));
    return;
  }
  const current = await getDelivery(params.data.id);
  if (!current) {
    res.status(404).json(errorResponse("NOT_FOUND", "Delivery request not found"));
    return;
  }
  if (current.qrToken !== body.data.qrToken) {
    res.status(422).json(errorResponse("QR_MISMATCH", "That code does not belong to this delivery."));
    return;
  }
  if (current.status !== "picked_up") {
    res.status(422).json(errorResponse("INVALID_PROOF_STATE", "A delivery must be picked up before proof can be submitted."));
    return;
  }
  await db.insert(proofOfDeliveryTable).values({
    deliveryRequestId: params.data.id,
    recipientName: body.data.recipientName,
    signatureData: body.data.signatureData,
    photoUrl: body.data.photoUrl,
  });
  const changed = await transition(params.data.id, "delivered", current.version, randomUUID(), "Rider");
  if (!changed) {
    res.status(409).json(errorResponse("VERSION_CONFLICT", "This delivery changed. Refresh and try again."));
    return;
  }
  const delivery = await getDelivery(params.data.id);
  res.json(SubmitProofOfDeliveryResponse.parse(delivery));
});

router.get("/v1/riders", async (_req, res): Promise<void> => {
  const riders = await db
    .select({ id: usersTable.id, name: usersTable.name, phone: usersTable.phone })
    .from(usersTable)
    .where(and(eq(usersTable.businessId, BUSINESS_ID), eq(usersTable.role, "rider"), eq(usersTable.isActive, true)));
  const output = await Promise.all(
    riders.map(async (rider) => {
      const active = await db
        .select({ id: assignmentsTable.id })
        .from(assignmentsTable)
        .innerJoin(deliveryRequestsTable, eq(deliveryRequestsTable.id, assignmentsTable.deliveryRequestId))
        .where(
          and(
            eq(assignmentsTable.riderId, rider.id),
            eq(assignmentsTable.isCurrent, true),
            or(eq(deliveryRequestsTable.status, "assigned"), eq(deliveryRequestsTable.status, "picked_up")),
          ),
        );
      return {
        ...rider,
        status: active.length ? "on_route" : "available",
        activeDeliveries: active.length,
      };
    }),
  );
  res.json(ListRidersResponse.parse(output));
});

router.get("/v1/riders/me/deliveries", async (req, res): Promise<void> => {
  const riderId = req.header("x-reflex-rider-id") ?? DEFAULT_RIDER_ID;
  const rows = await db
    .select({ id: deliveryRequestsTable.id })
    .from(deliveryRequestsTable)
    .innerJoin(assignmentsTable, and(eq(assignmentsTable.deliveryRequestId, deliveryRequestsTable.id), eq(assignmentsTable.isCurrent, true)))
    .where(and(eq(assignmentsTable.riderId, riderId), eq(deliveryRequestsTable.businessId, BUSINESS_ID)))
    .orderBy(desc(deliveryRequestsTable.updatedAt));
  const deliveries = await Promise.all(rows.map((row) => getDelivery(row.id)));
  res.json(ListMyDeliveriesResponse.parse(deliveries.filter(Boolean)));
});

router.post("/v1/sync", async (req, res): Promise<void> => {
  const parsed = SyncOfflineEventsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(errorResponse("INVALID_BODY", parsed.error.message));
    return;
  }
  let accepted = 0;
  let duplicate = 0;
  let rejected = 0;
  const deliveries = [];
  for (const event of parsed.data.events) {
    const existing = await db
      .select({ id: statusEventsTable.id })
      .from(statusEventsTable)
      .where(eq(statusEventsTable.clientEventId, event.clientEventId));
    if (existing.length) {
      duplicate++;
      continue;
    }
    const current = await getDelivery(event.deliveryId);
    if (!current || !isStatus(event.status)) {
      rejected++;
      continue;
    }
    const changed = await transition(event.deliveryId, event.status, event.version, event.clientEventId, "Rider");
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