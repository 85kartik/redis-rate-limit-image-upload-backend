const express = require("express");
const upload = require("../middlewares/upload");
const { uploadImage } = require("../controllers/uploadController"); // adjust path to match your project

const router = express.Router();

router.post("/upload", upload.single("image"), uploadImage);

module.exports = router;