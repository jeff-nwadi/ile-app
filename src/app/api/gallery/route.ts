import { db } from "@/db";
import { gallery } from "@/db/schema";
import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const items = await db.select().from(gallery).orderBy(asc(gallery.sortOrder));

  return NextResponse.json({ items });
}
