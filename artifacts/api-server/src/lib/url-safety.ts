import { lookup } from "node:dns/promises";

/** Returns true if the given IP is a private, loopback, link-local, or metadata address */
export function isPrivateIp(ip: string): boolean {
  // IPv4 private / special-purpose ranges
  if (/^127\./.test(ip)) return true;                              // Loopback
  if (/^10\./.test(ip)) return true;                              // RFC1918
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return true;        // RFC1918
  if (/^192\.168\./.test(ip)) return true;                        // RFC1918
  if (/^169\.254\./.test(ip)) return true;                        // Link-local / AWS metadata
  if (/^0\.0?\.0?\./.test(ip)) return true;                      // This network
  if (/^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(ip)) return true; // CGNAT (RFC6598)
  if (/^192\.0\.0\./.test(ip)) return true;                       // IETF protocol assignments
  if (/^192\.0\.2\./.test(ip)) return true;                       // TEST-NET-1
  if (/^198\.51\.100\./.test(ip)) return true;                    // TEST-NET-2
  if (/^203\.0\.113\./.test(ip)) return true;                     // TEST-NET-3
  if (/^(224|225|226|227|228|229|230|231|232|233|234|235|236|237|238|239)\./.test(ip)) return true; // Multicast
  if (/^(24[0-9]|25[0-5])\./.test(ip)) return true;              // Reserved / broadcast

  // IPv6 private / special-purpose
  if (ip === "::1") return true;                                   // Loopback
  if (/^::.+/i.test(ip) && ip !== "::") return true;             // Mapped IPv4
  if (/^fe80:/i.test(ip)) return true;                            // Link-local
  if (/^f[cd][0-9a-f]{2}:/i.test(ip)) return true;              // Unique local (fc00::/7)
  if (/^ff/i.test(ip)) return true;                               // Multicast

  return false;
}

/**
 * Validates that a URL is safe to fetch from a server-side context.
 * Throws descriptive errors for:
 *   - Non-http(s) protocols (prevents file://, ftp://, gopher://, etc.)
 *   - Hostnames that resolve to private/loopback/link-local IPs (SSRF)
 *   - Unresolvable hostnames
 *
 * @returns The parsed URL object for safe subsequent use
 */
export async function assertPublicUrl(rawUrl: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("Invalid URL format");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`Unsupported protocol "${parsed.protocol}". Only http and https are allowed.`);
  }

  // Reject IP literals directly (bypass DNS step but still validate)
  const isIpLiteral = /^(\d{1,3}\.){3}\d{1,3}$/.test(parsed.hostname) || parsed.hostname.includes(":");
  if (isIpLiteral && isPrivateIp(parsed.hostname.replace(/^\[|\]$/g, ""))) {
    throw new Error("URL points to a private or restricted IP address");
  }

  // Resolve DNS and check all returned addresses
  try {
    const ips = await lookup(parsed.hostname, { all: true });
    for (const { address } of ips) {
      if (isPrivateIp(address)) {
        throw new Error("URL resolves to a private or restricted network address");
      }
    }
  } catch (err: any) {
    if (err.message.startsWith("URL resolves")) throw err;
    if (err.code === "ENOTFOUND" || err.code === "EAI_NONAME" || err.code === "EAI_AGAIN") {
      throw new Error(`Could not resolve hostname: ${parsed.hostname}`);
    }
    throw err;
  }

  return parsed;
}

/** HTTP redirect status codes */
const REDIRECT_CODES = new Set([301, 302, 303, 307, 308]);

/**
 * A drop-in replacement for `fetch()` that is safe against SSRF via redirects.
 *
 * Every redirect hop is:
 *   1. Validated with `assertPublicUrl` before being fetched.
 *   2. Limited to `maxRedirects` total hops (default 5).
 *
 * Use this instead of `fetch()` for any user-supplied URL.
 */
export async function safeFetch(
  url: URL,
  options: Omit<RequestInit, "redirect"> & { maxRedirects?: number } = {},
): Promise<Response> {
  const { maxRedirects = 5, ...fetchOptions } = options;
  let current = url;
  let hopsLeft = maxRedirects;

  for (;;) {
    const response = await fetch(current.href, {
      ...fetchOptions,
      redirect: "manual", // Never let fetch auto-follow — we validate each hop
    });

    // Non-redirect: return as-is
    if (!REDIRECT_CODES.has(response.status)) {
      return response;
    }

    if (hopsLeft <= 0) {
      throw new Error(`Too many redirects (max ${maxRedirects})`);
    }

    const location = response.headers.get("location");
    if (!location) {
      throw new Error("Redirect response missing Location header");
    }

    // Resolve relative Location against the current URL, then validate
    const next = new URL(location, current);
    await assertPublicUrl(next.href);

    current = next;
    hopsLeft--;
  }
}
