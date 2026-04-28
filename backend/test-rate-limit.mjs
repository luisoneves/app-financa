class RateLimiter {
  constructor(windowMs = 60000, maxRequests = 5) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.store = new Map();
  }

  check(ip, identifier) {
    const key = `${ip}:${identifier}`;
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

const rateLimiter = new RateLimiter(60000, 5);
const TEST_IP = '192.168.1.1';

console.log('Testing Rate Limiter\n');
console.log('Config: 5 requests per 60 seconds\n');

for (let i = 1; i <= 7; i++) {
  const result = rateLimiter.check(TEST_IP, 'login');
  const status = result.allowed ? 'ALLOWED' : 'BLOCKED';
  console.log(`Attempt ${i}: ${status} | Remaining: ${result.remaining}`);
}

console.log('\nRate limiting working!');