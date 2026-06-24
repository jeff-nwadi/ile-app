import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  uuid,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/* ---------------- Better Auth tables ---------------- */
// Better Auth's Drizzle adapter expects these table names/shapes.
// Keep in sync with: npx @better-auth/cli generate (if you regenerate later).

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("customer"), // "customer" | "admin"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  password: text("password"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

/* ---------------- Restaurant domain tables ---------------- */

export const menuCategory = pgTable("menu_category", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(), // e.g. "Starters", "Mains", "Dessert"
  sortOrder: integer("sort_order").notNull().default(0),
});

export const menuItem = pgTable("menu_item", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id").references(() => menuCategory.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  priceKobo: integer("price_kobo").notNull(), // store money in kobo (smallest unit)
  imageUrl: text("image_url"),
  available: boolean("available").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderStatusEnum = pgEnum("order_status", [
  "pending_payment",
  "paid",
  "preparing",
  "ready",
  "completed",
  "cancelled",
]);

export const order = pgTable("order", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  status: orderStatusEnum("status").notNull().default("pending_payment"),
  totalKobo: integer("total_kobo").notNull(),
  paystackReference: text("paystack_reference").unique(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderItem = pgTable("order_item", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => order.id, { onDelete: "cascade" }),
  menuItemId: uuid("menu_item_id").references(() => menuItem.id, {
    onDelete: "set null",
  }),
  nameSnapshot: text("name_snapshot").notNull(), // preserved even if menu item changes later
  priceKoboSnapshot: integer("price_kobo_snapshot").notNull(),
  quantity: integer("quantity").notNull().default(1),
});

export const reservationStatusEnum = pgEnum("reservation_status", [
  "requested",
  "confirmed",
  "cancelled",
  "completed",
]);

export const reservation = pgTable("reservation", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  partySize: integer("party_size").notNull(),
  date: text("date").notNull(), // ISO date "2026-06-21"
  time: text("time").notNull(), // "19:30"
  status: reservationStatusEnum("status").notNull().default("requested"),
  specialRequests: text("special_requests"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const gallery = pgTable("gallery", {
  id: uuid("id").primaryKey().defaultRandom(),
  caption: text("caption").notNull(),
  imageUrl: text("image_url").notNull(),
  speed: text("speed").notNull().default("0.15"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ---------------- Security tables ---------------- */

// Append-only audit trail for privileged actions (admin mutations,
// auth events, webhook deliveries). Reads allowed for admins; writes
// are made by the app role only.
export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  action: text("action").notNull(), // e.g. "menu.create", "order.status", "auth.signin"
  targetType: text("target_type").notNull(),
  targetId: text("target_id"),
  meta: text("meta"), // JSON-stringified
  ip: text("ip"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Webhook idempotency. The unique index on (source, eventType, reference)
// lets us short-circuit duplicate deliveries without an extra round-trip.
export const webhookEvent = pgTable(
  "webhook_event",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    source: text("source").notNull(), // "paystack"
    eventType: text("event_type").notNull(),
    reference: text("reference").notNull(),
    payload: text("payload").notNull(), // raw body
    processedAt: timestamp("processed_at").notNull().defaultNow(),
  },
  (t) => ({
    uniqRef: uniqueIndex("webhook_event_source_ref_uq").on(
      t.source,
      t.eventType,
      t.reference,
    ),
  }),
);
