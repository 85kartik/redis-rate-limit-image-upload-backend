const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Saving file to uploads folder...");
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    console.log("File name:", file.originalname);

    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

  const extension = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(extension)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, PNG, and WebP files are allowed"));
  }
};

const upload = multer({
  storage: storage,

  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },

  fileFilter: fileFilter,
});

module.exports = upload;
