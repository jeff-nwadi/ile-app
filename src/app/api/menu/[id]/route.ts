import { db } from "@/db";
import { menuItem } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { audit } from "@/lib/audit";
import { isAllowedImageUrl } from "@/lib/cdn";
import { safeError } from "@/lib/errors";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateSchema = z.object({
  categoryId: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(2000).optional(),
  priceKobo: z.number().int().positive().max(100_000_000).optional(),
  imageUrl: z
    .string()
    .refine(isAllowedImageUrl, "Image URL must be HTTPS or /uploads/")
    .nullable()
    .optional(),
  available: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(100_000).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  const user = gate.user;
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
    .update(menuItem)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(menuItem.id, id))
    .returning();

  if (!updated) return safeError(404, "Not found");

  await audit({
    userId: user.id,
    action: "menu.update",
    targetType: "menu_item",
    targetId: id,
    meta: { changed: Object.keys(parsed.data) },
  });

  return NextResponse.json({ item: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  const user = gate.user;
  const { id } = await params;

  await db.delete(menuItem).where(eq(menuItem.id, id));

  await audit({
    userId: user.id,
    action: "menu.delete",
    targetType: "menu_item",
    targetId: id,
  });

  return NextResponse.json({ ok: true });
}
