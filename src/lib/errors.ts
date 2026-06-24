import { NextResponse } from "next/server";

/**
 * Build a JSON error response.
 *
 * In production, only the public message is returned to the client. The full
 * `internal` payload (e.g. a Zod flatten with field paths) is logged
 * server-side for debugging without leaking schema information to callers.
 *
 * In development, the internal payload is included so the dev console shows
 * the full validation result.
 */
export function safeError(
  status: number,
  publicMsg: string,
  internal?: unknown,
): NextResponse {
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.json(
      { error: publicMsg, ...(internal !== undefined ? { dev: internal } : {}) },
      { status },
    );
  }
  if (internal !== undefined) {
    console.error("[error]", status, publicMsg, internal);
  }
  return NextResponse.json({ error: publicMsg }, { status });
}
