const { createClient } = require("redis");
// Single shared Redis client used for:
// 1. Rate limiting store (so all load-balanced instances share the same counters)
// 2. Caching (e.g. user profile lookups)
const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});

redisClient.on("error", (err) => console.error("Redis Client Error:", err.message));
redisClient.on("connect", () => console.log("Redis connected"));

// Redis v4+ client requires an explicit connect() call
const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};
module.exports = { redisClient, connectRedis };