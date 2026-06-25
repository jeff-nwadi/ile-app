import { db } from "@/db";
import { menuCategory } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const categories = await db
    .select()
    .from(menuCategory)
    .orderBy(asc(menuCategory.sortOrder));

  return NextResponse.json({ categories });
}
