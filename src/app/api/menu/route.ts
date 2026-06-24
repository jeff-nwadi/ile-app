import { db } from "@/db";
import { menuItem, menuCategory } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { asc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// GET /api/menu — public, returns available items grouped is done client-side
export async function GET() {
  const categories = await db
    .select()
    .from(menuCategory)
    .orderBy(asc(menuCategory.sortOrder));

  const items = await db
    .select()
    .from(menuItem)
    .where(eq(menuItem.available, true))
    .orderBy(asc(menuItem.sortOrder));

  return NextResponse.json({ categories, items });
}

const createSchema = z.object({
  categoryId: z.string().uuid().nullable().optional(),
  name: z.string().min(1),
  description: z.string().default(""),
  priceKobo: z.number().int().positive(),
  imageUrl: z
    .string()
    .refine((val) => val.startsWith("/") || val.startsWith("http"))
    .nullable()
    .optional(),
  sortOrder: z.number().int().default(0),
});

// POST /api/menu — admin only, create a menu item
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

  const [created] = await db.insert(menuItem).values(parsed.data).returning();
  return NextResponse.json({ item: created }, { status: 201 });
}
