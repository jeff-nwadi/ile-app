import { db } from "@/db";
import { user } from "@/db/schema";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Update all users to admin for local development
    await db.update(user).set({ role: "admin" });
    return NextResponse.json({ success: true, message: "Successfully updated your account to Admin! Please try logging out and logging back in if the Admin link doesn't appear immediately." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
