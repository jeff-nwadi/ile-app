import { db } from "@/db";
import { menuCategory } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  await requireAdmin();

  const categories = await db
    .select()
    .from(menuCategory)
    .orderBy(asc(menuCategory.sortOrder));

  return NextResponse.json({ categories });
}
