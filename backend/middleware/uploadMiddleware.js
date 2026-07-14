const multer = require("multer");

/**
 * Files are stored in memory (not written to disk on our server) and
 * streamed directly to Cloudinary. This avoids leaving temporary files
 * sitting on the server, which is both a security and a cleanup concern.
 */
const storage = multer.memoryStorage();

/**
 * Only allow specific file types depending on the field name,
 * so a malicious file can't be disguised with a fake extension.
 */
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
  const allowedPdfTypes = ["application/pdf"];

  if ((file.fieldname === "coverImage" || file.fieldname === "image") && allowedImageTypes.includes(file.mimetype)){
    return cb(null, true);
  }

  
  if (file.fieldname === "pdf" && allowedPdfTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  cb(new Error("نوع الملف غير مسموح به"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 10MB max per file
  },
});

module.exports = upload;