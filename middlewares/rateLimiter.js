const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const { redisClient } = require("../config/redis");

// IMPORTANT: without a shared store, each load-balanced instance (server.js
// running on port 3000, 3001, 3002...) keeps its own separate counter in
// memory. A user could then get 5 free attempts PER instance instead of
// 5 total. Using Redis as the store means all instances share one counter,
// so limits are enforced correctly no matter which server handles the request.

const makeRedisStore = (prefix) =>
  new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix,
  });

// General limiter: applies to all routes
// Allows 100 requests per 15 minutes per IP (shared across all instances)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true, // return rate limit info in RateLimit-* headers
  legacyHeaders: false,
  store: makeRedisStore("rl:general:"),
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
});

// Stricter limiter for sensitive routes like login/register
// Allows only 5 requests per 10 minutes per IP (helps prevent brute force)
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeRedisStore("rl:auth:"),
  message: {
    success: false,
    message: "Too many login/register attempts, please try again after 10 minutes",
  },
});

module.exports = { generalLimiter, authLimiter };