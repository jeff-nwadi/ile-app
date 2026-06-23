import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvFile } from "node:process";

/** Load `.env` for standalone scripts (tsx, drizzle-kit, etc.). Next.js does this automatically. */
export function loadEnv() {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;
  try {
    loadEnvFile(envPath);
  } catch {
    // Already loaded or unreadable — ignore
  }
}

loadEnv();
