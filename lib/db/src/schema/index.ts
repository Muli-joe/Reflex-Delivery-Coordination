import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const businessesTable = pgTable("businesses", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull().default("Nairobi, Kenya"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const usersTable = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  businessId: uuid("business_id").notNull().references(() => businessesTable.id),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  role: text("role").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const deliveryRequestsTable = pgTable(
  "delivery_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    businessId: uuid("business_id").notNull().references(() => businessesTable.id),
    reference: text("reference").notNull(),
    customerName: text("customer_name").notNull(),
    customerPhone: text("customer_phone").notNull(),
    address: text("address").notNull(),
    itemDescription: text("item_description").notNull(),
    status: text("status").notNull().default("pending"),
    version: integer("version").notNull().default(1),
    qrToken: text("qr_token").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    businessStatusIdx: uniqueIndex("delivery_business_reference_idx").on(
      table.businessId,
      table.reference,
    ),
    qrTokenIdx: uniqueIndex("delivery_qr_token_idx").on(table.qrToken),
  }),
);

export const assignmentsTable = pgTable("assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  deliveryRequestId: uuid("delivery_request_id")
    .notNull()
    .references(() => deliveryRequestsTable.id),
  riderId: uuid("rider_id").notNull().references(() => usersTable.id),
  assignedAt: timestamp("assigned_at", { withTimezone: true }).notNull().defaultNow(),
  isCurrent: boolean("is_current").notNull().default(true),
});

export const statusEventsTable = pgTable(
  "status_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    deliveryRequestId: uuid("delivery_request_id")
      .notNull()
      .references(() => deliveryRequestsTable.id),
    status: text("status").notNull(),
    actorId: uuid("actor_id").references(() => usersTable.id),
    actorName: text("actor_name").notNull(),
    clientEventId: text("client_event_id"),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    clientEventIdx: uniqueIndex("status_event_client_id_idx").on(table.clientEventId),
  }),
);

export const proofOfDeliveryTable = pgTable("proof_of_delivery", {
  id: uuid("id").defaultRandom().primaryKey(),
  deliveryRequestId: uuid("delivery_request_id")
    .notNull()
    .unique()
    .references(() => deliveryRequestsTable.id),
  recipientName: text("recipient_name").notNull(),
  signatureData: text("signature_data"),
  photoUrl: text("photo_url"),
  verifiedAt: timestamp("verified_at", { withTimezone: true }).notNull().defaultNow(),
});

export const devicesTable = pgTable("devices", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => usersTable.id),
  pushToken: text("push_token").notNull(),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auditLogTable = pgTable("audit_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  businessId: uuid("business_id").notNull().references(() => businessesTable.id),
  actorId: uuid("actor_id").references(() => usersTable.id),
  action: text("action").notNull(),
  subjectId: uuid("subject_id"),
  beforeData: text("before_data"),
  afterData: text("after_data"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBusinessSchema = createInsertSchema(businessesTable).omit({
  id: true,
  createdAt: true,
});
export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
});
export const insertDeliveryRequestSchema = createInsertSchema(deliveryRequestsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertAssignmentSchema = createInsertSchema(assignmentsTable).omit({ id: true });
export const insertStatusEventSchema = createInsertSchema(statusEventsTable).omit({ id: true });
export const insertProofOfDeliverySchema = createInsertSchema(proofOfDeliveryTable).omit({
  id: true,
  verifiedAt: true,
});

export type Business = typeof businessesTable.$inferSelect;
export type User = typeof usersTable.$inferSelect;
export type DeliveryRequest = typeof deliveryRequestsTable.$inferSelect;
export type Assignment = typeof assignmentsTable.$inferSelect;
export type StatusEvent = typeof statusEventsTable.$inferSelect;
export type ProofOfDelivery = typeof proofOfDeliveryTable.$inferSelect;
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertDeliveryRequest = z.infer<typeof insertDeliveryRequestSchema>;