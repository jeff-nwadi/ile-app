import "server-only";
import { db } from "@/db";
import { reservation } from "@/db/schema";
import { getCurrentUser, mustAdmin } from "@/lib/session";
import { protect, isDenied } from "@/lib/arcjet";
import { safeError } from "@/lib/errors";
import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(254),
  phone: z.string().min(7).max(32),
  partySize: z.number().int().min(1).max(20),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM"),
  specialRequests: z.string().max(2000).optional(),
});

// POST /api/reservations — anyone (logged in or not) can request a table
export async function POST(req: NextRequest) {
  try {
    const decision = await protect(req, "reservation");
    if (isDenied(decision)) {
      return safeError(429, "Too many requests. Try again later.");
    }
  } catch {
    // Fail open on Arcjet errors.
  }

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
  await mustAdmin();
  const all = await db
    .select()
    .from(reservation)
    .orderBy(desc(reservation.createdAt));
  return NextResponse.json({ reservations: all });
}
