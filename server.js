require("dotenv").config();
const cluster = require("cluster");
const os = require("os");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 3000;
const numCPUs = os.cpus().length;

async function startServer() {
  await connectDB();

  const userRoutes = require("./routes/userRoutes");
  const uploadRoutes = require("./routes/uploadRoutes");
  const errorHandler = require("./middlewares/errorHandler");

  const app = express();

  // Simple in-memory rate limiter (per worker process)
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again later." }
  });

  // Core middleware
  app.use(cors());
  app.use(morgan("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(generalLimiter);
  app.use(helmet());

  // Serve uploaded images statically
  app.use("/uploads", express.static("uploads"));

  // Health check
  app.get("/", (req, res) => {
    res.json({ success: true, message: "Server is running", pid: process.pid });
  });

  // Routes
  app.use("/api/users", userRoutes);
  app.use("/api", uploadRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
  });

  // Centralized error handler
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Worker running on port ${PORT} (pid: ${process.pid})`);
  });
}
//startServer()
// ---- Cluster setup ----
if (cluster.isPrimary) {
   cluster.schedulingPolicy = cluster.SCHED_RR;
  console.log(`Master process ${process.pid} is running`);
  console.log(`Forking ${numCPUs} workers...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("online", (worker) => {
    console.log(`Worker ${worker.process.pid} is online`);
  });

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died (code: ${code}, signal: ${signal}). Restarting...`);
    cluster.fork();
  });

} else {
  startServer().catch((err) => {
    console.error(`Worker ${process.pid} failed to start:`, err.message);
    process.exit(1);
  });
}