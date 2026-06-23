import { db } from "@/db";
import { menuItem } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateSchema = z.object({
  categoryId: z.string().uuid().nullable().optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  priceKobo: z.number().int().positive().optional(),
  imageUrl: z.string().url().nullable().optional(),
  available: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [updated] = await db
    .update(menuItem)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(menuItem.id, id))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;

  await db.delete(menuItem).where(eq(menuItem.id, id));
  return NextResponse.json({ ok: true });
}
