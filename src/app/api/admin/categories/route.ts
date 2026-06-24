import { db } from "@/db";
import { menuCategory } from "@/db/schema";
import { mustAdmin } from "@/lib/session";
import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  await mustAdmin();

  const categories = await db
    .select()
    .from(menuCategory)
    .orderBy(asc(menuCategory.sortOrder));

  return NextResponse.json({ categories });
}
