require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");

const PORT = process.env.PORT || 3000;

// Everything that depends on Redis (rateLimiter -> RedisStore) must only be
// required AFTER the Redis client has finished connecting, otherwise the
// RedisStore tries to load its Lua script on a closed client and crashes.
async function startServer() {
  await connectDB();
  await connectRedis();

  // Safe to require these now that Redis is connected
  const userRoutes = require("./routes/userRoutes");
  const uploadRoutes = require("./routes/uploadRoutes");
  const errorHandler = require("./middlewares/errorHandler");
  const { generalLimiter } = require("./middlewares/rateLimiter");

  const app = express();

  // Core middleware
  app.use(cors());
  app.use(morgan("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Apply general rate limiting to all requests
  app.use(generalLimiter);

  // Serve uploaded images statically, e.g. http://localhost:3000/uploads/photo.png
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  // Health check (useful for load balancer / uptime checks)
  app.get("/", (req, res) => {
    res.json({ success: true, message: "Server is running", pid: process.pid });
  });

  // Routes
  app.use("/api/users", userRoutes);
  app.use("/api/upload", uploadRoutes);

  // 404 handler for unmatched routes
  app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
  });

  // Centralized error handler (must be last)
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (pid: ${process.pid})`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});