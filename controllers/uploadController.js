const User = require("../models/userModel");

// Handles a single image upload and links it to the logged-in user's profile
const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file provided" });
    }

    // req.file is added by multer middleware, e.g.:
    // { filename: '1699999999-photo.png', path: '.../uploads/1699999999-photo.png', ... }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { profileImage: req.file.filename },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

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
