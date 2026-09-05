const mongoose = require("mongoose");

// Connects to MongoDB using the URI from .env
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1); // stop the app if DB connection fails
  }
};

module.exports = connectDB;
