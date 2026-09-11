const rateLimit = require("express-rate-limit");

// NOTE: In-memory store means each cluster worker/instance keeps its own
// separate counter. A user could get up to `max` attempts PER worker instead
// of `max` total across the app. Fine for basic abuse protection on a single
// machine with a few workers; if you need strict shared limits across
// instances later, you'd need a shared store like Redis again.

// General limiter: applies to all routes
// Allows 100 requests per 15 minutes per IP (per worker)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true, // return rate limit info in RateLimit-* headers
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
});

// Stricter limiter for sensitive routes like login/register
// Allows only 5 requests per 10 minutes per IP (per worker) — helps prevent brute force
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login/register attempts, please try again after 10 minutes",
  },
});

module.exports = { generalLimiter, authLimiter };