import { db } from "@/db";
import { menuItem, menuCategory } from "@/db/schema";
import { mustAdmin } from "@/lib/session";
import { audit } from "@/lib/audit";
import { isAllowedImageUrl } from "@/lib/cdn";
import { safeError } from "@/lib/errors";
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
  name: z.string().min(1).max(120),
  description: z.string().max(2000).default(""),
  priceKobo: z.number().int().positive().max(100_000_000),
  imageUrl: z
    .string()
    .refine(isAllowedImageUrl, "Image URL must be HTTPS or /uploads/")
    .nullable()
    .optional(),
  sortOrder: z.number().int().min(0).max(100_000).default(0),
});

// POST /api/menu — admin only, create a menu item
export async function POST(req: NextRequest) {
  const user = await mustAdmin();

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

  const [created] = await db.insert(menuItem).values(parsed.data).returning();

  await audit({
    userId: user.id,
    action: "menu.create",
    targetType: "menu_item",
    targetId: created.id,
    meta: { name: created.name },
  });

  return NextResponse.json({ item: created }, { status: 201 });
}
