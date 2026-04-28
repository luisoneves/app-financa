interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();

  constructor(
    private windowMs: number = 60 * 1000,
    private maxRequests: number = 5
  ) {}

  private getKey(ip: string, identifier: string): string {
    return `${ip}:${identifier}`;
  }

  private cleanExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetAt <= now) {
        this.store.delete(key);
      }
    }
  }

  check(ip: string, identifier: string): { allowed: boolean; remaining: number; resetAt: number } {
    this.cleanExpired();

    const key = this.getKey(ip, identifier);
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || entry.resetAt <= now) {
      this.store.set(key, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true, remaining: this.maxRequests - 1, resetAt: now + this.windowMs };
    }

    if (entry.count >= this.maxRequests) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    entry.count++;
    return { allowed: true, remaining: this.maxRequests - entry.count, resetAt: entry.resetAt };
  }
}

export const authRateLimiter = new RateLimiter(60 * 1000, 5);

export function getClientIp(c: { req: { headers: { get: (h: string) => string | null } } }): string {
  const forwarded = c.req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return c.req.headers.get('x-real-ip') || '127.0.0.1';
}