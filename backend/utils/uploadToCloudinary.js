const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

/**
 * Uploads a file buffer (from Multer's memory storage) directly to
 * Cloudinary using a stream, without ever saving it to our own disk.
 */
const uploadToCloudinary = (fileBuffer, folder, resourceType = "auto") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

module.exports = uploadToCloudinary;