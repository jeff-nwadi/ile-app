import { db } from "@/db";
import { reservation } from "@/db/schema";
import { getCurrentUser, requireAdmin } from "@/lib/session";
import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7),
  partySize: z.number().int().min(1).max(20),
  date: z.string(), // "2026-06-21"
  time: z.string(), // "19:30"
  specialRequests: z.string().optional(),
});

// POST /api/reservations — anyone (logged in or not) can request a table
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const user = await getCurrentUser();

  const [created] = await db
    .insert(reservation)
    .values({ ...parsed.data, userId: user?.id ?? null })
    .returning();

  // TODO: send confirmation email (Resend/Postmark) here.

  return NextResponse.json({ reservation: created }, { status: 201 });
}

// GET /api/reservations — admin only, list all requests newest first
export async function GET() {
  await requireAdmin();
  const all = await db
    .select()
    .from(reservation)
    .orderBy(desc(reservation.createdAt));
  return NextResponse.json({ reservations: all });
}
