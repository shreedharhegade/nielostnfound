// Simple in-memory rate limiter (resets on server restart)
// For production, replace with Redis-backed limiter

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
  windowMs: number; // time window in ms
  max: number;      // max requests per window
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions = { windowMs: 60_000, max: 10 }
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    const newEntry: RateLimitEntry = { count: 1, resetAt: now + options.windowMs };
    store.set(key, newEntry);
    return { allowed: true, remaining: options.max - 1, resetAt: newEntry.resetAt };
  }

  if (entry.count >= options.max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: options.max - entry.count, resetAt: entry.resetAt };
}

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 5 * 60_000);
