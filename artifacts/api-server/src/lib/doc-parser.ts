/**
 * Document text extraction helpers.
 *
 * Supported formats:
 *   - PDF  — via pdf-parse v1.1.1 (lazy-loaded to avoid startup cost)
 *   - DOCX — via mammoth (lazy-loaded)
 *   - TXT / CSV / MD / plain text — direct UTF-8 decode
 *
 * All functions return a plain string.  The caller is responsible for
 * trimming / truncating to the desired length.
 */

/** Maximum characters retained after parsing (≈ 75 k tokens) */
const MAX_CHARS = 100_000;

/** Collapse excessive whitespace and clip to MAX_CHARS */
function normalise(raw: string): string {
  return raw.replace(/\s{3,}/g, "\n\n").trim().slice(0, MAX_CHARS);
}

/**
 * Extract plain text from a PDF buffer using pdf-parse v1.1.1.
 *
 * Import note: pdf-parse is CommonJS.  esbuild wraps CJS exports so that
 * the callable function lives on `.default` in the bundled ESM output.
 * We fall back to the module itself in case the caller uses the package
 * via `createRequire` or a different bundler.
 */
async function extractPdf(buffer: Buffer): Promise<string> {
  const mod = await import("pdf-parse");
  // esbuild CJS interop: module.exports function is exposed as .default
  const parse = (mod as any).default ?? mod;
  if (typeof parse !== "function") {
    throw new Error("pdf-parse did not export a callable function — check package version");
  }
  const result = await (parse as (buf: Buffer) => Promise<{ text: string }>)(buffer);
  return result.text ?? "";
}

/**
 * Extract plain text from a DOCX/DOC buffer using mammoth.
 */
async function extractDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value ?? "";
}

/** Returns true when the MIME type or filename indicates a PDF */
export function isPdf(mimeType: string, filename: string): boolean {
  return mimeType.includes("pdf") || filename.toLowerCase().endsWith(".pdf");
}

/** Returns true when the MIME type or filename indicates a DOCX/DOC */
export function isDocx(mimeType: string, filename: string): boolean {
  const lower = filename.toLowerCase();
  return (
    mimeType.includes("officedocument.wordprocessingml") ||
    mimeType.includes("msword") ||
    lower.endsWith(".docx") ||
    lower.endsWith(".doc")
  );
}

/**
 * Parse a base64-encoded document and return extracted plain text.
 *
 * @param content   Base64-encoded file content (no data-URL prefix)
 * @param mimeType  MIME type string (may be empty / "application/octet-stream")
 * @param filename  Original filename, used as fallback format detection
 */
export async function parseDocumentBuffer(
  content: string,
  mimeType: string,
  filename: string,
): Promise<string> {
  const buffer = Buffer.from(content, "base64");
  const mime = (mimeType || "").toLowerCase();
  const name = filename || "";

  let raw: string;
  if (isPdf(mime, name)) {
    raw = await extractPdf(buffer);
  } else if (isDocx(mime, name)) {
    raw = await extractDocx(buffer);
  } else {
    // TXT, CSV, MD, JSON, XML, and any other text-based format
    raw = buffer.toString("utf-8");
  }

  return normalise(raw);
}
