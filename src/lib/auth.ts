import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

/**
 * Boot-time guard for the auth secret. Better-auth already warns at length
 * < 32 and low entropy, but we escalate those warnings to hard failures
 * in production: a weak default secret in prod is a deploy-time disaster.
 */
function validateAuthSecret(): void {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "BETTER_AUTH_SECRET is not set. Generate one with `openssl rand -base64 32` and put it in .env.",
    );
  }
  if (secret.length < 32) {
    const msg = `BETTER_AUTH_SECRET is only ${secret.length} characters; need at least 32. Generate a new one with \`openssl rand -base64 32\`.`;
    if (process.env.NODE_ENV === "production") {
      throw new Error(msg);
    }
    console.warn(`[auth] ${msg}`);
  }
  // Cheap entropy check: count distinct characters. A truly random 32+ char
  // secret should have at least 10 distinct chars.
  const distinct = new Set(secret).size;
  if (distinct < 10) {
    const msg = `BETTER_AUTH_SECRET looks low-entropy (only ${distinct} distinct characters). Use a randomly generated secret.`;
    if (process.env.NODE_ENV === "production") {
      throw new Error(msg);
    }
    console.warn(`[auth] ${msg}`);
  }
}

validateAuthSecret();

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    // Cache session (incl. role) in a signed cookie so middleware avoids a DB hit every request.
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  // Auth event auditing is wired in src/app/api/auth/[...all]/route.ts so we
  // can react to the resolved HTTP response (success vs. failure) and run
  // the audit only on real sign-in / sign-up / sign-out.
  // Add social providers here later, e.g.:
  // socialProviders: {
  //   google: {
  //     clientId: process.env.GOOGLE_CLIENT_ID!,
  //     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  //   },
  // },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "customer",
        input: false, // never settable by the client
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
