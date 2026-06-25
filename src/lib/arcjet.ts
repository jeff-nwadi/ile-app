import "server-only";
import arcjet, { tokenBucket, shield, detectBot } from "@arcjet/next";

const key = process.env.ARCJET_KEY;

if (!key && process.env.NODE_ENV === "production") {
  throw new Error(
    "ARCJET_KEY is not set. Rate limiting will not work in production.",
  );
}

const mode: "LIVE" | "DRY_RUN" = key ? "LIVE" : "DRY_RUN";

/**
 * Base instance with always-on Shield WAF and a "no bots" policy.
 * Per-bucket rate limits are added with `withRule(...)`.
 */
const base = arcjet({
  key: key ?? "dry-run-placeholder",
  characteristics: ["ip.src"],
  rules: [
    shield({ mode }),
    detectBot({ mode, allow: [] }),
  ],
});

/**
 * One Arcjet instance per bucket. Each carries its own token bucket rule
 * in addition to the base shield + detectBot rules.
 */
const instances = {
  // auth: 10 / 10 min
  auth: base.withRule(
    tokenBucket({ mode, refillRate: 10, interval: "10m", capacity: 10 }),
  ),
  // reservation: 5 / hour
  reservation: base.withRule(
    tokenBucket({ mode, refillRate: 5, interval: "1h", capacity: 5 }),
  ),
  // order: 10 / hour
  order: base.withRule(
    tokenBucket({ mode, refillRate: 10, interval: "1h", capacity: 10 }),
  ),
  // upload: 20 / hour (admin)
  upload: base.withRule(
    tokenBucket({ mode, refillRate: 20, interval: "1h", capacity: 20 }),
  ),
};

export type Bucket = keyof typeof instances;

export async function protect(req: Request, bucket: Bucket) {
  // Each request consumes 1 token from its bucket.
  return instances[bucket].protect(req, { requested: 1 });
}

export function isDenied(decision: { isDenied: () => boolean }): boolean {
  return decision.isDenied();
}
