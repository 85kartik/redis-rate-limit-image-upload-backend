const rateLimit = require("express-rate-limit");

// General limiter: applies to all routes
// Allows 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true, // return rate limit info in RateLimit-* headers
  legacyHeaders: false,
});

// Stricter limiter for sensitive routes like login/register
// Allows only 5 requests per 10 minutes per IP (helps prevent brute force)
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: {
    success: false,
    message: "Too many login/register attempts, please try again after 10 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { generalLimiter, authLimiter };
