import "server-only";
import { readFile, stat } from "fs/promises";
import { join } from "path";
import { extname } from "path";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";

const UPLOAD_DIR = join(process.cwd(), "uploads");

const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

// Filename must be exactly `${uuid}.${ext}`. We re-validate on read so a
// request like `/api/uploads/../public/uploads/x.png` can't escape the dir.
const SAFE_NAME = /^[0-9a-f-]{36}\.(png|jpg|jpeg|webp|gif)$/i;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ file: string }> },
) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  const { file } = await params;
  if (!SAFE_NAME.test(file)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const filepath = join(UPLOAD_DIR, file);
  // Defense in depth: even after the regex, refuse to serve anything
  // outside UPLOAD_DIR (e.g. symlink escape attempts).
  if (!filepath.startsWith(UPLOAD_DIR + "/") && filepath !== UPLOAD_DIR) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    await stat(filepath);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const data = await readFile(filepath);
  const contentType = MIME_BY_EXT[extname(file).toLowerCase()] ?? "application/octet-stream";
  return new NextResponse(new Uint8Array(data), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
