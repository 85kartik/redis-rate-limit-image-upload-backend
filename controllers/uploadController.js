const User = require("../models/userModel");
const { redisClient } = require("../config/redis");

// Handles a single image upload and links it to the logged-in user's profile
const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file provided" });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { profileImage: req.file.filename },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Invalidate the cached profile so the next GET /profile reflects the new image
    // instead of serving stale cached data for up to PROFILE_CACHE_TTL seconds.
    await redisClient.del(`user:profile:${req.userId}`);

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl: `/uploads/${req.file.filename}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadProfileImage };