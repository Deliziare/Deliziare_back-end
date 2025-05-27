import ChefPost from "../Models/chefPostModel.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

export const createChefPost = async ({ chefId, title, description, images, tags }) => {
  const uploadedImages = [];

  for (const img of images) {
    const result = await uploadToCloudinary(img.data, {
      folder: 'chefPosts',
      resource_type: 'image',
    });

    console.log('Cloudinary upload result:', result);

    uploadedImages.push({
      url: result.secure_url,  
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
  const posts = await ChefPost.find({ chefId }).sort({ createdAt: -1 }); 
  return posts;
};



export const updateChefPostById = async (chefId, postId, updateData) => {
  const updateFields = {
    ...(updateData.title && { title: updateData.title }),
    ...(updateData.description && { description: updateData.description }),
    ...(updateData.tags && { tags: updateData.tags }),
    ...(updateData.images && { images: updateData.images }),
  };

  const updatedPost = await ChefPost.findOneAndUpdate(
    { _id: postId, chefId },
    { $set: updateFields },
    { new: true }
  );

  return updatedPost;
};

export const deleteChefPostById = async (chefId, postId) => {
  const result = await ChefPost.findOneAndDelete({ _id: postId, chefId });
  return result;
};

export const getAllChefPosts = async () => {
  return await ChefPost.find().populate('chefId', 'name');
};