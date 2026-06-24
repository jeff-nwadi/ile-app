import "server-only";
import { randomUUID } from "crypto";
import { mkdir, writeFile, stat } from "fs/promises";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";
import { mustAdmin } from "@/lib/session";
import { audit } from "@/lib/audit";
import { protect, isDenied } from "@/lib/arcjet";
import { safeError } from "@/lib/errors";

const UPLOAD_DIR = join(process.cwd(), "uploads");
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES: Record<string, { ext: string; magic: number[]; webpTag?: string }> = {
  "image/png": { ext: "png", magic: [0x89, 0x50, 0x4e, 0x47] },
  "image/jpeg": { ext: "jpg", magic: [0xff, 0xd8, 0xff] },
  "image/webp": {
    ext: "webp",
    magic: [0x52, 0x49, 0x46, 0x46], // "RIFF"
    webpTag: "WEBP",
  },
  "image/gif": { ext: "gif", magic: [0x47, 0x49, 0x46, 0x38] }, // "GIF8"
};

function detectType(buf: Buffer): keyof typeof ALLOWED_TYPES | null {
  for (const [type, def] of Object.entries(ALLOWED_TYPES)) {
    if (!def.magic.every((b, i) => buf[i] === b)) continue;
    if (def.webpTag) {
      const tag = buf.subarray(8, 12).toString("ascii");
      if (tag !== def.webpTag) continue;
    }
    return type as keyof typeof ALLOWED_TYPES;
  }
  return null;
}

export async function POST(req: NextRequest) {
  const user = await mustAdmin();

  try {
    const decision = await protect(req, "upload");
    if (isDenied(decision)) {
      return safeError(429, "Too many uploads. Try again later.");
    }
  } catch {
    // Fail open on Arcjet errors.
  }

  // Cheap pre-check: reject obviously-oversized requests via Content-Length
  // before we even allocate the form-data buffer. Some runtimes don't
  // enforce a body limit on their own.
  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > MAX_BYTES) {
    return safeError(413, "File too large (max 5MB)", { len });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch (err) {
    return safeError(400, "Could not parse upload", err);
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return safeError(400, "No file provided");
  }

  if (file.size > MAX_BYTES) {
    return safeError(400, "File too large (max 5MB)", { size: file.size });
  }
  if (file.size === 0) {
    return safeError(400, "File is empty");
  }

  // Reject SVG and HTML up front even if the client claims a different type.
  // SVG can carry <script> and is a classic XSS vector when served from our
  // origin.
  if (
    file.type === "image/svg+xml" ||
    file.name.toLowerCase().endsWith(".svg")
  ) {
    return safeError(400, "SVG uploads are not allowed");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Magic-byte detection. We don't trust the client-reported `file.type`.
  const detected = detectType(buffer);
  if (!detected) {
    return safeError(400, "Unsupported file type", { declared: file.type });
  }

  // Filename is a UUID + extension — drop the client-supplied name entirely.
  const ext = ALLOWED_TYPES[detected].ext;
  const filename = `${randomUUID()}.${ext}`;

  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
    const filepath = join(UPLOAD_DIR, filename);
    await writeFile(filepath, buffer);
    // Verify the file was actually written at the expected size.
    const s = await stat(filepath);
    if (s.size !== file.size) {
      return safeError(500, "Upload verification failed");
    }
  } catch (err) {
    return safeError(500, "Upload failed", err);
  }

  await audit({
    userId: user.id,
    action: "upload.create",
    targetType: "upload",
    targetId: filename,
    meta: { size: file.size, type: detected },
  });

  return NextResponse.json(
    { url: `/api/uploads/${filename}`, type: detected },
    { status: 201 },
  );
}
