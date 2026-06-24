import { db } from "@/db";
import { gallery } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { asc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  await requireAdmin();

  const items = await db.select().from(gallery).orderBy(asc(gallery.sortOrder));

  return NextResponse.json({ items });
}

const createSchema = z.object({
  caption: z.string().min(1),
  imageUrl: z
    .string()
    .refine((val) => val.startsWith("/") || val.startsWith("http")),
  speed: z.string().default("0.15"),
  sortOrder: z.number().int().default(0),
});

export async function POST(req: NextRequest) {
  await requireAdmin();

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const [created] = await db.insert(gallery).values(parsed.data).returning();
  return NextResponse.json({ item: created }, { status: 201 });
}
