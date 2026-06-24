import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { protect, isDenied } from "@/lib/arcjet";
import { audit } from "@/lib/audit";
import { NextResponse } from "next/server";

const handlers = toNextJsHandler(auth);

const WRITE_ENDPOINTS = [
  "/sign-in/email",
  "/sign-up/email",
  "/sign-out",
  "/forget-password",
  "/reset-password",
] as const;

function classify(pathname: string): (typeof WRITE_ENDPOINTS)[number] | null {
  for (const ep of WRITE_ENDPOINTS) {
    if (pathname.endsWith(ep)) return ep;
  }
  return null;
}

async function rateLimitedPost(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const ep = classify(url.pathname);

  // Only enforce on the credential POSTs that mutate state.
  if (ep) {
    try {
      const decision = await protect(req, "auth");
      if (isDenied(decision)) {
        return NextResponse.json(
          { error: "Too many requests. Try again later." },
          { status: 429 },
        );
      }
    } catch {
      // Fail open on Arcjet errors.
    }
  }

  const res = await handlers.POST(req);

  // Fire-and-forget audit. Only on a real 2xx response.
  if (ep && res.ok) {
    if (ep === "/sign-in/email") {
      // We don't have the user_id from better-auth's response in this shape,
      // so we record a generic signin event with null userId. The audit row
      // still gives us a forensic trail of the request itself.
      void audit({
        userId: null,
        action: "auth.signin",
        targetType: "user",
      });
    } else if (ep === "/sign-up/email") {
      void audit({
        userId: null,
        action: "auth.signup",
        targetType: "user",
      });
    } else if (ep === "/sign-out") {
      void audit({
        userId: null,
        action: "auth.signout",
        targetType: "user",
      });
    }
  }

  return res;
}

export const GET = handlers.GET;
export const POST = rateLimitedPost;
