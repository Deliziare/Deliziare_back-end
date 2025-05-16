import cloudinary from '../config/cloudinary.js';

export const uploadToCloudinary = (buffer, options = { resource_type: 'auto' }) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    stream.end(buffer);
  });
};
