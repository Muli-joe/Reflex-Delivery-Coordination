import { z } from "zod";

const statuses = ["pending", "assigned", "picked_up", "delivered", "cancelled"];
const deliveryStatus = z.enum(statuses);

const proof = z.object({
  recipientName: z.string(),
  signatureData: z.string().nullish(),
  photoUrl: z.string().nullish(),
  verifiedAt: z.coerce.date(),
});

const delivery = z.object({
  id: z.string(),
  reference: z.string(),
  customerName: z.string(),
  customerPhone: z.string(),
  address: z.string(),
  itemDescription: z.string(),
  status: deliveryStatus,
  riderId: z.string().nullish(),
  riderName: z.string().nullish(),
  version: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  proof: proof.optional(),
});

const statusEvent = z.object({
  id: z.string(),
  status: deliveryStatus,
  actorName: z.string(),
  createdAt: z.coerce.date(),
  note: z.string().nullish(),
});

const assignment = z.object({
  id: z.string(),
  riderId: z.string(),
  riderName: z.string(),
  assignedAt: z.coerce.date(),
  isCurrent: z.boolean(),
});

export const HealthCheckResponse = z.object({ status: z.string() });

export const GetDashboardSummaryResponse = z.object({
  totalToday: z.number(),
  pending: z.number(),
  assigned: z.number(),
  pickedUp: z.number(),
  delivered: z.number(),
  cancelled: z.number(),
  onTimeRate: z.number(),
  activeRiders: z.number(),
});

export const ListActivityQueryParams = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
});

export const ListActivityResponse = z.array(z.object({
  id: z.string(),
  deliveryId: z.string(),
  reference: z.string(),
  status: deliveryStatus,
  actorName: z.string(),
  createdAt: z.coerce.date(),
  note: z.string().nullish(),
}));

export const ListDeliveryRequestsQueryParams = z.object({
  status: deliveryStatus.optional(),
  search: z.coerce.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export const ListDeliveryRequestsResponse = z.array(delivery);

export const CreateDeliveryRequestBody = z.object({
  customerName: z.string().min(2),
  customerPhone: z.string().min(7),
  address: z.string().min(4),
  itemDescription: z.string().min(2),
});
export const CreateDeliveryRequestResponse = delivery;

export const GetDeliveryRequestParams = z.object({ id: z.coerce.string() });
export const GetDeliveryRequestResponse = delivery.extend({
  events: z.array(statusEvent),
  assignments: z.array(assignment),
});

export const AssignDeliveryRequestParams = z.object({ id: z.coerce.string() });
export const AssignDeliveryRequestBody = z.object({
  riderId: z.string(),
  version: z.number(),
});
export const AssignDeliveryRequestResponse = delivery;

export const CancelDeliveryRequestParams = z.object({ id: z.coerce.string() });
export const CancelDeliveryRequestResponse = delivery;

export const UpdateDeliveryStatusParams = z.object({ id: z.coerce.string() });
export const UpdateDeliveryStatusBody = z.object({
  status: deliveryStatus,
  version: z.number(),
  clientEventId: z.string(),
});
export const UpdateDeliveryStatusResponse = delivery;

export const SubmitProofOfDeliveryParams = z.object({ id: z.coerce.string() });
export const SubmitProofOfDeliveryBody = z.object({
  recipientName: z.string().min(2),
  signatureData: z.string().nullish(),
  photoUrl: z.string().nullish(),
});
export const SubmitProofOfDeliveryResponse = delivery;

export const ListRidersResponse = z.array(z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  status: z.enum(["available", "on_route", "offline"]),
  activeDeliveries: z.number(),
}));

export const ListMyDeliveriesResponse = z.array(delivery);

export const SyncOfflineEventsBody = z.object({
  events: z.array(z.object({
    deliveryId: z.string(),
    status: deliveryStatus,
    version: z.number(),
    clientEventId: z.string(),
  })),
});

export const SyncOfflineEventsResponse = z.object({
  accepted: z.number(),
  duplicate: z.number(),
  rejected: z.number(),
  deliveries: z.array(delivery).optional(),
});