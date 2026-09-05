const multer = require("multer");

// Catches errors from anywhere in the app (routes/controllers must call next(err))
// Also specifically handles Multer errors (e.g. file too large, wrong file type)
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Multer-specific errors (file size limit, etc.)
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }

  // Custom file-type errors thrown from upload.js's fileFilter
  if (err.message && err.message.includes("Only image files")) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Fallback: generic server error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;
