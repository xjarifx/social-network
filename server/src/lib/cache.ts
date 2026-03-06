import { createClient, type RedisClientType } from "redis";

type CacheValue = Record<string, unknown> | Array<unknown> | string | number | null;

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
let cacheEnabled = process.env.CACHE_ENABLED !== "false";
let client: RedisClientType | null = null;
let clientReady = false;

export const buildCacheKey = (...parts: unknown[]): string =>
  parts.map(p => String(p ?? "").trim()).filter(Boolean).join(":");

// Parse Redis URL to avoid deprecation warning and handle SSL
const parseRedisUrl = (urlString: string) => {
  try {
    const url = new URL(urlString);
    const isSecure = url.protocol === 'rediss:';
    
    return {
      socket: {
        host: url.hostname,
        port: parseInt(url.port) || 6379,
        ...(isSecure && {
          tls: true,
          rejectUnauthorized: false, // For self-signed certificates
        }),
      },
      password: url.password || undefined,
      username: url.username || undefined,
    };
  } catch {
    // Fallback to default
    return {
      socket: {
        host: 'localhost',
        port: 6379,
      },
    };
  }
};

export const initRedis = async (): Promise<void> => {
  if (!cacheEnabled || client) return;

  const config = parseRedisUrl(redisUrl);
  client = createClient(config);

  client.on("error", (err) => {
    clientReady = false;
    console.warn("Redis error:", err);
  });

  client.on("ready", () => {
    clientReady = true;
    console.log("✅ Redis connected");
  });

  client.on("end", () => {
    clientReady = false;
  });

  try {
    await client.connect();
  } catch (err) {
    clientReady = false;
    console.warn("Redis connection failed, caching disabled:", err);
  }
};

const isCacheReady = (): boolean => cacheEnabled && clientReady && !!client;

export const setCacheEnabled = (enabled: boolean): void => {
  cacheEnabled = enabled;
  if (!enabled) clientReady = false;
};

export const getCacheEnabled = (): boolean => cacheEnabled;

export const cacheGet = async <T = CacheValue>(key: string): Promise<T | null> => {
  if (!isCacheReady()) return null;

  try {
    const raw = await client!.get(key);
    return raw ? JSON.parse(raw) as T : null;
  } catch (err) {
    console.warn("Cache get failed:", err);
    return null;
  }
};

export const cacheSet = async (
  key: string,
  value: CacheValue,
  ttlSeconds: number,
): Promise<void> => {
  if (!isCacheReady()) return;

  try {
    await client!.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (err) {
    console.warn("Cache set failed:", err);
  }
};

export const cacheDel = async (key: string | string[]): Promise<void> => {
  if (!isCacheReady()) return;

  try {
    const keys = Array.isArray(key) ? key : [key];
    if (keys.length > 0) await client!.del(keys);
  } catch (err) {
    console.warn("Cache delete failed:", err);
  }
};

// Simple pattern-based invalidation (e.g., "user:*", "post:123")
export const invalidatePattern = async (pattern: string): Promise<void> => {
  if (!isCacheReady()) return;

  try {
    const keys = await client!.keys(pattern);
    if (keys.length > 0) await client!.del(keys);
  } catch (err) {
    console.warn("Cache invalidate failed:", err);
  }
};
