import { db } from "@/db";
import { gallery } from "@/db/schema";
import { mustAdmin } from "@/lib/session";
import { audit } from "@/lib/audit";
import { isAllowedImageUrl } from "@/lib/cdn";
import { safeError } from "@/lib/errors";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateSchema = z.object({
  caption: z.string().min(1).max(200).optional(),
  imageUrl: z
    .string()
    .refine(isAllowedImageUrl, "Image URL must be HTTPS or /uploads/")
    .optional(),
  speed: z.string().regex(/^-?\d+(\.\d+)?$/).optional(),
  sortOrder: z.number().int().min(0).max(100_000).optional(),
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
    .update(gallery)
    .set(parsed.data)
    .where(eq(gallery.id, id))
    .returning();

  if (!updated) return safeError(404, "Not found");

  await audit({
    userId: user.id,
    action: "gallery.update",
    targetType: "gallery",
    targetId: id,
    meta: { changed: Object.keys(parsed.data) },
  });

  return NextResponse.json({ item: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await mustAdmin();
  const { id } = await params;

  await db.delete(gallery).where(eq(gallery.id, id));

  await audit({
    userId: user.id,
    action: "gallery.delete",
    targetType: "gallery",
    targetId: id,
  });

  return NextResponse.json({ ok: true });
}
