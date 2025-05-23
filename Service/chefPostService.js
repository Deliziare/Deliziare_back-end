import ChefPost from "../Models/chefPostModel.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

export const createChefPost = async ({ chefId, title, description, images, tags }) => {
  const uploadedImages = [];

  for (const img of images) {
    // Use your helper that uploads a buffer and returns upload result
    const result = await uploadToCloudinary(img.data, {
      folder: 'chefPosts',
      resource_type: 'image',
    });

    console.log('Cloudinary upload result:', result);

    uploadedImages.push({
      url: result.secure_url,   // this will now be defined
      altText: img.altText || '',
    });
  }

  const post = new ChefPost({
    chefId,
    title,
    description,
    images: uploadedImages,
    tags,
  });

  return await post.save();
};




export const getPostsByChefId = async (chefId) => {
  const posts = await ChefPost.find({ chefId }).sort({ createdAt: -1 }); // newest first
  return posts;
};
