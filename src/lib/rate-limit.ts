/**
 * In-memory rate limiter with automatic cleanup.
 *
 * Limitations (acceptable for single-instance deployments):
 * - State is lost on server restart
 * - Not shared across multiple server instances
 *
 * For multi-instance production, replace with Redis-based rate limiting
 * (e.g. @upstash/ratelimit).
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateMap = new Map<string, RateLimitEntry>();

// Periodically clean expired entries to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60_000; // 5 minutes
let lastCleanup = Date.now();

function cleanupExpiredEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, entry] of rateMap) {
    if (now > entry.resetTime) {
      rateMap.delete(key);
    }
  }
}

/**
 * Check if a request is within rate limits.
 * Returns true if the request is allowed, false if rate limited.
 *
 * @param identifier - Unique key (e.g. "contact-request:1.2.3.4")
 * @param limit - Max requests per window
 * @param windowMs - Time window in milliseconds
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60_000
): boolean {
  cleanupExpiredEntries();

  const now = Date.now();
  const entry = rateMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    rateMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}
