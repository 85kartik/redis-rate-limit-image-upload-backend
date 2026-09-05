const express = require("express");
const upload = require("../middlewares/upload");
const protect = require("../middlewares/authMiddleware");
const { uploadProfileImage } = require("../controllers/uploadController");

const router = express.Router();

// "image" must match the form-data field name the client sends
router.post("/profile-image", protect, upload.single("image"), uploadProfileImage);

module.exports = router;
