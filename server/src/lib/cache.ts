import { createClient, type RedisClientType } from "redis";

type CacheValue =
  | Record<string, unknown>
  | Array<unknown>
  | string
  | number
  | null;

type CacheSetOptions = {
  ttlSeconds: number;
  tags?: string[];
};

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
let cacheEnabled = process.env.CACHE_ENABLED !== "false";

let client: RedisClientType | null = null;
let clientReady = false;

const tagKey = (tag: string) => `tag:${tag}`;

const sanitizePart = (value: unknown): string =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/:/g, "_");

export const buildCacheKey = (...parts: unknown[]): string =>
  parts.map(sanitizePart).filter(Boolean).join(":");

export const initRedis = async (): Promise<void> => {
  if (!cacheEnabled || client) {
    return;
  }

  client = createClient({ url: redisUrl });

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
  // Cache switch
  cacheEnabled = enabled;
  if (!enabled) {
    clientReady = false;
  }
};

export const getCacheEnabled = (): boolean => cacheEnabled;

export const cacheGet = async <T = CacheValue>(
  key: string,
): Promise<T | null> => {
  if (!isCacheReady()) {
    return null;
  }

  try {
    const raw = await client!.get(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn("Cache get failed:", err);
    return null;
  }
};

export const cacheSet = async (
  key: string,
  value: CacheValue,
  options: CacheSetOptions,
): Promise<void> => {
  if (!isCacheReady()) {
    return;
  }

  try {
    const payload = JSON.stringify(value);
    await client!.set(key, payload, { EX: options.ttlSeconds });

    if (options.tags && options.tags.length > 0) {
      const tagTtl = Math.max(options.ttlSeconds, 300);
      await Promise.all(
        options.tags.map(async (tag) => {
          const keyForTag = tagKey(tag);
          await client!.sAdd(keyForTag, key);
          await client!.expire(keyForTag, tagTtl);
        }),
      );
    }
  } catch (err) {
    console.warn("Cache set failed:", err);
  }
};

export const invalidateTags = async (tags: string[]): Promise<void> => {
  if (!isCacheReady() || tags.length === 0) {
    return;
  }

  for (const tag of tags) {
    const keyForTag = tagKey(tag);
    try {
      const keys = await client!.sMembers(keyForTag);
      if (keys.length > 0) {
        await client!.del(keys);
      }
      await client!.del(keyForTag);
    } catch (err) {
      console.warn("Cache invalidate failed:", err);
    }
  }
};
