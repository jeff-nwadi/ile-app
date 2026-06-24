import "server-only";
import { db } from "@/db";
import { auditLog } from "@/db/schema";
import { headers } from "next/headers";

export type AuditAction =
  | "auth.signin"
  | "auth.signup"
  | "auth.signin_failed"
  | "auth.signout"
  | "menu.create"
  | "menu.update"
  | "menu.delete"
  | "gallery.create"
  | "gallery.update"
  | "gallery.delete"
  | "order.status"
  | "order.customer_cancel"
  | "reservation.status"
  | "upload.create"
  | "webhook.signature_failed"
  | "webhook.duplicate"
  | "webhook.processed";

export type AuditTargetType =
  | "user"
  | "menu_item"
  | "gallery"
  | "order"
  | "reservation"
  | "upload"
  | "paystack";

export interface AuditParams {
  userId: string | null;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId?: string | null;
  meta?: Record<string, unknown>;
}

/**
 * Best-effort audit writer. Never throws — auditing must not break a
 * user request. Failure is logged to stderr so a separate process can
 * alert on it.
 */
export async function audit(params: AuditParams): Promise<void> {
  try {
    let ip: string | null = null;
    let userAgent: string | null = null;
    try {
      const h = await headers();
      ip =
        h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        h.get("x-real-ip") ??
        null;
      userAgent = h.get("user-agent") ?? null;
    } catch {
      // Not in a request context (e.g. called from a script). Skip.
    }

    await db.insert(auditLog).values({
      userId: params.userId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId ?? null,
      meta: params.meta ? JSON.stringify(params.meta) : null,
      ip,
      userAgent,
    });
  } catch (err) {
    // Never let an audit failure break the request flow.
    console.error("[audit] write failed", err);
  }
}
