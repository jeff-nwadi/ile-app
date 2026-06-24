import "server-only";
import { db } from "@/db";
import { reservation } from "@/db/schema";
import { mustAdmin } from "@/lib/session";
import { audit } from "@/lib/audit";
import { safeError } from "@/lib/errors";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["requested", "confirmed", "cancelled", "completed"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await mustAdmin();
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return safeError(400, "Invalid JSON");
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return safeError(400, "Invalid request", parsed.error.flatten());
  }

  const [updated] = await db
    .update(reservation)
    .set({ status: parsed.data.status })
    .where(eq(reservation.id, id))
    .returning();

  if (!updated) return safeError(404, "Not found");

  await audit({
    userId: user.id,
    action: "reservation.status",
    targetType: "reservation",
    targetId: id,
    meta: { to: parsed.data.status },
  });

  return NextResponse.json({ reservation: updated });
}
