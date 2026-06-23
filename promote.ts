import "./src/lib/load-env";
import { db } from "./src/db";
import { user } from "./src/db/schema";

async function promote() {
  console.log("Updating users to admin...");
  await db.update(user).set({ role: "admin" });
  console.log("Done.");
  process.exit(0);
}

promote().catch(console.error);
