let redisInstance: unknown = null;
let redisChecked = false;
const memory = new Map<string, { data: unknown; expires: number }>();

async function getRedis(): Promise<unknown> {
  if (redisChecked) return redisInstance;
  redisChecked = true;
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const mod = await import('@upstash/redis');
      redisInstance = new mod.Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
    } catch {
      redisInstance = null;
    }
  }
  return redisInstance;
}

function memoryGet<T>(key: string): T | null {
  const entry = memory.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) { memory.delete(key); return null; }
  return entry.data as T;
}

function memorySet(key: string, data: unknown, ttlMs: number): void {
  memory.set(key, { data, expires: Date.now() + ttlMs });
}

export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  const r = await getRedis() as { get: <T>(k: string) => Promise<T | null>; set: (k: string, v: unknown, opts: { ex: number }) => Promise<void> } | null;
  if (r) {
    try {
      const cached = await r.get<T>(key);
      if (cached !== null) return cached;
    } catch {
      const mem = memoryGet<T>(key);
      if (mem !== null) return mem;
    }
  } else {
    const mem = memoryGet<T>(key);
    if (mem !== null) return mem;
  }

  const data = await fetcher();

  if (r) {
    try { await r.set(key, data, { ex: ttlSeconds }); } catch { memorySet(key, data, ttlSeconds * 1000); }
  } else {
    memorySet(key, data, ttlSeconds * 1000);
  }
  return data;
}

export function getCacheKey(prefix: string, ...parts: (string | number | undefined)[]): string {
  return `${prefix}:${parts.map(p => p ?? '').join(':')}`;
}
