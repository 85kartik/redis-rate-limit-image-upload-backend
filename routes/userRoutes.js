const express = require("express");
const { registerUser, loginUser, getProfile } = require("../controllers/userController");
const protect = require("../middlewares/authMiddleware");
const { authLimiter } = require("../middlewares/rateLimiter");

const router = express.Router();

// authLimiter applied only to sensitive routes (stricter than the global limiter)
router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);

// protected route - requires valid JWT
router.get("/profile", protect, getProfile);

module.exports = router;
