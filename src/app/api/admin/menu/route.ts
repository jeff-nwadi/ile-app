import { db } from "@/db";
import { menuItem } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  await requireAdmin();

  const items = await db
    .select()
    .from(menuItem)
    .orderBy(asc(menuItem.sortOrder), asc(menuItem.name));

  return NextResponse.json({ items });
}
