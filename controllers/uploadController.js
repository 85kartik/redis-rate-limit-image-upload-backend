const uploadImage = async (req, res, next) => {
  try {
    console.log("REQ.FILE:", req.file);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      file: req.file,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadImage,
};
