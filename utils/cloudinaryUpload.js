import cloudinary from '../config/cloudinary.js';

// export const uploadToCloudinary = (buffer, options = { resource_type: 'auto' }) => {
//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
//       if (error) reject(error);
//       else resolve(result);
//     });
//     stream.end(buffer);
//   });
// };

export const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: 'auto', // default fallback
      ...options, // override if passed
    };

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });

    stream.end(buffer);
  });
};
