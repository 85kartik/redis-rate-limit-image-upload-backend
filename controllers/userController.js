const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const { redisClient } = require("../config/redis");

const PROFILE_CACHE_TTL = 300; // 5 minutes

const profileCacheKey = (userId) => `user:profile:${userId}`;

// Register User
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login User
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET PROFILE
// Protected route - Redis read-through cache

const getProfile = async (req, res, next) => {
  try {
    // Get user ID from JWT middleware
    const userId = req.userId;

    // Create Redis key
    const key = `user:profile:${userId}`;

    // 1. Check Redis
    const cachedUser = await redisClient.get(key);

    if (cachedUser) {
      // User found in Redis
      return res.status(200).json({
        success: true,
        user: JSON.parse(cachedUser),
        fromCache: true,
      });
    }

    // 2. User not found in Redis
    // Get user from MongoDB
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 3. Save user in Redis for 5 minutes
    await redisClient.setEx(
      key,
      300,
      JSON.stringify(user)
    );

    // 4. Send user to client
    return res.status(200).json({
      success: true,
      user: user,
      fromCache: false,
    });

  } catch (error) {
    next(error);
  }
};


module.exports = {
  registerUser,
  loginUser,
  getProfile,
};
