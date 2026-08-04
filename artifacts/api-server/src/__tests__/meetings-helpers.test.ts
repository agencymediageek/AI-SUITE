/**
 * Unit tests for the meetings route helpers:
 *   - SSRF URL validation (url-safety.ts)
 *   - Document parsing format detection (doc-parser.ts)
 *
 * These tests cover the pure-function logic extracted from the route handlers.
 * Integration tests that require a running server (full HTTP round-trips) are
 * out of scope here; route-level behaviour is validated by the existing
 * end-to-end test suite.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { isPrivateIp } from "../lib/url-safety.js";
import { isPdf, isDocx } from "../lib/doc-parser.js";

// ─── isPrivateIp ─────────────────────────────────────────────────────────────

describe("isPrivateIp", () => {
  describe("loopback", () => {
    it("blocks 127.0.0.1", () => expect(isPrivateIp("127.0.0.1")).toBe(true));
    it("blocks 127.255.255.255", () => expect(isPrivateIp("127.255.255.255")).toBe(true));
    it("blocks IPv6 ::1", () => expect(isPrivateIp("::1")).toBe(true));
  });

  describe("RFC1918 private ranges", () => {
    it("blocks 10.0.0.1", () => expect(isPrivateIp("10.0.0.1")).toBe(true));
    it("blocks 10.255.255.255", () => expect(isPrivateIp("10.255.255.255")).toBe(true));
    it("blocks 172.16.0.1", () => expect(isPrivateIp("172.16.0.1")).toBe(true));
    it("blocks 172.31.255.255", () => expect(isPrivateIp("172.31.255.255")).toBe(true));
    it("allows 172.15.0.1 (just outside RFC1918)", () => expect(isPrivateIp("172.15.0.1")).toBe(false));
    it("allows 172.32.0.1 (just outside RFC1918)", () => expect(isPrivateIp("172.32.0.1")).toBe(false));
    it("blocks 192.168.1.100", () => expect(isPrivateIp("192.168.1.100")).toBe(true));
  });

  describe("link-local / metadata", () => {
    it("blocks 169.254.169.254 (AWS metadata)", () => expect(isPrivateIp("169.254.169.254")).toBe(true));
    it("blocks 169.254.0.1", () => expect(isPrivateIp("169.254.0.1")).toBe(true));
  });

  describe("IPv6 private", () => {
    it("blocks fe80:: (link-local)", () => expect(isPrivateIp("fe80::1")).toBe(true));
    it("blocks fc00:: (unique local)", () => expect(isPrivateIp("fc00::1")).toBe(true));
    it("blocks fd00:: (unique local)", () => expect(isPrivateIp("fd12:3456:789a::1")).toBe(true));
    it("blocks ff02:: (multicast)", () => expect(isPrivateIp("ff02::1")).toBe(true));
  });

  describe("public addresses", () => {
    it("allows 8.8.8.8", () => expect(isPrivateIp("8.8.8.8")).toBe(false));
    it("allows 1.1.1.1", () => expect(isPrivateIp("1.1.1.1")).toBe(false));
    it("allows 93.184.216.34", () => expect(isPrivateIp("93.184.216.34")).toBe(false));
    it("allows 2001:4860:4860::8888", () => expect(isPrivateIp("2001:4860:4860::8888")).toBe(false));
  });
});

// ─── assertPublicUrl ──────────────────────────────────────────────────────────

describe("assertPublicUrl", () => {
  // We mock dns/promises.lookup to avoid actual network calls in unit tests

  beforeEach(() => {
    vi.resetModules();
  });

  it("rejects non-http(s) protocol — file:", async () => {
    const { assertPublicUrl } = await import("../lib/url-safety.js");
    await expect(assertPublicUrl("file:///etc/passwd")).rejects.toThrow(/Unsupported protocol/);
  });

  it("rejects non-http(s) protocol — ftp:", async () => {
    const { assertPublicUrl } = await import("../lib/url-safety.js");
    await expect(assertPublicUrl("ftp://example.com/file")).rejects.toThrow(/Unsupported protocol/);
  });

  it("rejects malformed URL", async () => {
    const { assertPublicUrl } = await import("../lib/url-safety.js");
    await expect(assertPublicUrl("not a url at all")).rejects.toThrow(/Invalid URL/);
  });

  it("rejects direct private IP literal — 127.0.0.1", async () => {
    const { assertPublicUrl } = await import("../lib/url-safety.js");
    await expect(assertPublicUrl("http://127.0.0.1/admin")).rejects.toThrow(/private/i);
  });

  it("rejects direct private IP literal — 10.0.0.1", async () => {
    const { assertPublicUrl } = await import("../lib/url-safety.js");
    await expect(assertPublicUrl("http://10.0.0.1/")).rejects.toThrow(/private/i);
  });

  it("rejects AWS metadata IP — 169.254.169.254", async () => {
    const { assertPublicUrl } = await import("../lib/url-safety.js");
    await expect(assertPublicUrl("http://169.254.169.254/latest/meta-data/")).rejects.toThrow(/private/i);
  });

  it("accepts a public URL (mocked DNS → public IP)", async () => {
    vi.doMock("node:dns/promises", () => ({
      lookup: vi.fn().mockResolvedValue([{ address: "93.184.216.34", family: 4 }]),
    }));
    const { assertPublicUrl } = await import("../lib/url-safety.js");
    const result = await assertPublicUrl("https://example.com/page");
    expect(result).toBeInstanceOf(URL);
    expect(result.hostname).toBe("example.com");
  });

  it("rejects URL whose DNS resolves to a private IP (mocked)", async () => {
    vi.doMock("node:dns/promises", () => ({
      lookup: vi.fn().mockResolvedValue([{ address: "192.168.1.1", family: 4 }]),
    }));
    const { assertPublicUrl } = await import("../lib/url-safety.js");
    await expect(assertPublicUrl("https://internal.corp.example.com/")).rejects.toThrow(
      /resolves to a private/,
    );
  });
});

// ─── safeFetch — redirect bypass prevention ───────────────────────────────────

describe("safeFetch redirect bypass prevention", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("blocks a public-to-private redirect (open redirect → 127.0.0.1)", async () => {
    // Simulate: first request returns 301 → http://127.0.0.1/admin
    vi.doMock("node:dns/promises", () => ({
      lookup: vi.fn().mockResolvedValue([{ address: "93.184.216.34", family: 4 }]),
    }));

    const { safeFetch } = await import("../lib/url-safety.js");

    // Patch global fetch for this test
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValueOnce(
      new Response(null, {
        status: 301,
        headers: { location: "http://127.0.0.1/admin" },
      })
    ) as any;

    const start = new URL("https://public.example.com/");
    await expect(safeFetch(start)).rejects.toThrow(/private/i);

    global.fetch = originalFetch;
  });

  it("blocks a public-to-metadata-service redirect (169.254.169.254)", async () => {
    vi.doMock("node:dns/promises", () => ({
      lookup: vi.fn().mockResolvedValue([{ address: "93.184.216.34", family: 4 }]),
    }));

    const { safeFetch } = await import("../lib/url-safety.js");

    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValueOnce(
      new Response(null, {
        status: 302,
        headers: { location: "http://169.254.169.254/latest/meta-data/" },
      })
    ) as any;

    await expect(safeFetch(new URL("https://public.example.com/"))).rejects.toThrow(/private/i);

    global.fetch = originalFetch;
  });

  it("blocks after exceeding max redirect count", async () => {
    vi.doMock("node:dns/promises", () => ({
      lookup: vi.fn().mockResolvedValue([{ address: "93.184.216.34", family: 4 }]),
    }));

    const { safeFetch } = await import("../lib/url-safety.js");

    const originalFetch = global.fetch;
    // Every request returns a 301 to a public URL (infinite loop)
    global.fetch = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 301,
        headers: { location: "https://public.example.com/loop" },
      })
    ) as any;

    await expect(safeFetch(new URL("https://public.example.com/start"), { maxRedirects: 3 }))
      .rejects.toThrow(/Too many redirects/i);

    global.fetch = originalFetch;
  });

  it("blocks redirect missing Location header", async () => {
    const { safeFetch } = await import("../lib/url-safety.js");

    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValueOnce(
      new Response(null, { status: 301 }) // no Location
    ) as any;

    await expect(safeFetch(new URL("https://public.example.com/"))).rejects.toThrow(/Location/i);

    global.fetch = originalFetch;
  });

  it("follows a valid public-to-public redirect and returns the response", async () => {
    vi.doMock("node:dns/promises", () => ({
      lookup: vi.fn().mockResolvedValue([{ address: "93.184.216.34", family: 4 }]),
    }));

    const { safeFetch } = await import("../lib/url-safety.js");
    const originalFetch = global.fetch;

    // First call: 302 → final URL
    global.fetch = vi.fn()
      .mockResolvedValueOnce(
        new Response(null, { status: 302, headers: { location: "https://final.example.com/page" } })
      )
      .mockResolvedValueOnce(
        new Response("<html><title>OK</title></html>", { status: 200 })
      ) as any;

    const response = await safeFetch(new URL("https://public.example.com/start"));
    expect(response.status).toBe(200);

    global.fetch = originalFetch;
  });
});

// ─── isPdf / isDocx ───────────────────────────────────────────────────────────

describe("isPdf", () => {
  it("detects application/pdf MIME", () => expect(isPdf("application/pdf", "file")).toBe(true));
  it("detects .pdf extension", () => expect(isPdf("application/octet-stream", "report.pdf")).toBe(true));
  it("ignores case-insensitive extension", () => expect(isPdf("application/octet-stream", "REPORT.PDF")).toBe(true));
  it("returns false for docx", () => expect(isPdf("application/vnd.openxmlformats-officedocument.wordprocessingml.document", "doc.docx")).toBe(false));
  it("returns false for txt", () => expect(isPdf("text/plain", "notes.txt")).toBe(false));
});

describe("isDocx", () => {
  it("detects officedocument MIME", () =>
    expect(isDocx("application/vnd.openxmlformats-officedocument.wordprocessingml.document", "doc.docx")).toBe(true));
  it("detects application/msword MIME", () => expect(isDocx("application/msword", "old.doc")).toBe(true));
  it("detects .docx extension", () => expect(isDocx("application/octet-stream", "report.docx")).toBe(true));
  it("detects .doc extension", () => expect(isDocx("application/octet-stream", "legacy.doc")).toBe(true));
  it("returns false for pdf", () => expect(isDocx("application/pdf", "file.pdf")).toBe(false));
  it("returns false for txt", () => expect(isDocx("text/plain", "notes.txt")).toBe(false));
});

// ─── parseDocumentBuffer — TXT/CSV path (no external parser) ─────────────────

describe("parseDocumentBuffer", () => {
  it("decodes plain text from base64", async () => {
    const { parseDocumentBuffer } = await import("../lib/doc-parser.js");
    const content = Buffer.from("Hello, world!").toString("base64");
    const result = await parseDocumentBuffer(content, "text/plain", "notes.txt");
    expect(result).toBe("Hello, world!");
  });

  it("decodes CSV content", async () => {
    const { parseDocumentBuffer } = await import("../lib/doc-parser.js");
    const csv = "name,age\nAlice,30\nBob,25";
    const result = await parseDocumentBuffer(Buffer.from(csv).toString("base64"), "text/csv", "data.csv");
    expect(result).toBe(csv);
  });

  it("collapses excessive whitespace", async () => {
    const { parseDocumentBuffer } = await import("../lib/doc-parser.js");
    const text = "Line 1\n\n\n\n\nLine 2";
    const result = await parseDocumentBuffer(Buffer.from(text).toString("base64"), "text/plain", "x.txt");
    expect(result).toBe("Line 1\n\nLine 2");
  });

  it("clips text to MAX_CHARS (100k)", async () => {
    const { parseDocumentBuffer } = await import("../lib/doc-parser.js");
    const long = "A".repeat(200_000);
    const result = await parseDocumentBuffer(Buffer.from(long).toString("base64"), "text/plain", "big.txt");
    expect(result.length).toBeLessThanOrEqual(100_000);
  });
});
