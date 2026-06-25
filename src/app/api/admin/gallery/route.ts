import { db } from "@/db";
import { gallery } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { audit } from "@/lib/audit";
import { isAllowedImageUrl } from "@/lib/cdn";
import { safeError } from "@/lib/errors";
import { asc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const items = await db.select().from(gallery).orderBy(asc(gallery.sortOrder));

  return NextResponse.json({ items });
}

const createSchema = z.object({
  caption: z.string().min(1).max(200),
  imageUrl: z
    .string()
    .refine(isAllowedImageUrl, "Image URL must be HTTPS or /uploads/"),
  speed: z.string().regex(/^-?\d+(\.\d+)?$/).default("0.15"),
  sortOrder: z.number().int().min(0).max(100_000).default(0),
});

export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  const user = gate.user;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return safeError(400, "Invalid JSON");
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return safeError(400, "Invalid request", parsed.error.flatten());
  }

  const [created] = await db.insert(gallery).values(parsed.data).returning();

  await audit({
    userId: user.id,
    action: "gallery.create",
    targetType: "gallery",
    targetId: created.id,
    meta: { caption: created.caption },
  });

  return NextResponse.json({ item: created }, { status: 201 });
}
