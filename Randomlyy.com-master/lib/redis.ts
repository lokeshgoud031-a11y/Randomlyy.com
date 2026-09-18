import { Redis } from "@upstash/redis";

const redisUrl =
  process.env.UPSTASH_REDIS_REST_URL?.trim();

const redisToken =
  process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

if (!redisUrl) {
  throw new Error(
    "UPSTASH_REDIS_REST_URL is missing.",
  );
}

if (!redisToken) {
  throw new Error(
    "UPSTASH_REDIS_REST_TOKEN is missing.",
  );
}

if (!redisUrl.startsWith("https://")) {
  throw new Error(
    "UPSTASH_REDIS_REST_URL must start with https://",
  );
}

export const redis = new Redis({
  url: redisUrl,
  token: redisToken,
});