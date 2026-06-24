/**
 * Allowlist for image URL fields. Relative paths under our own tree are
 * always fine; remote URLs must use HTTPS and resolve to a host we've
 * explicitly approved. This blocks both SSRF (e.g. http://169.254.169.254)
 * and credential-stuffing via unexpected third-party hosts.
 */
const ALLOWED_HOSTS = new Set<string>([
  "res.cloudinary.com",
  // Add the production CDN host here once known, e.g. "cdn.ile.example.com".
]);

const RELATIVE_PREFIXES = ["/uploads/", "/api/uploads/"];

export function isAllowedImageUrl(value: string): boolean {
  if (typeof value !== "string" || value.length === 0) return false;
  if (RELATIVE_PREFIXES.some((p) => value.startsWith(p))) return true;
  try {
    const u = new URL(value);
    if (u.protocol !== "https:") return false;
    if (ALLOWED_HOSTS.has(u.hostname)) return true;
    return false;
  } catch {
    return false;
  }
}
