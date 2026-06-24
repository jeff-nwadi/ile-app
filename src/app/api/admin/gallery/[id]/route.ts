import { db } from "@/db";
import { gallery } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateSchema = z.object({
  caption: z.string().min(1).optional(),
  imageUrl: z
    .string()
    .refine((val) => val.startsWith("/") || val.startsWith("http"))
    .optional(),
  speed: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await params;

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const [updated] = await db
    .update(gallery)
    .set(parsed.data)
    .where(eq(gallery.id, id))
    .returning();

  if (!updated)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await params;

  await db.delete(gallery).where(eq(gallery.id, id));
  return NextResponse.json({ ok: true });
}
