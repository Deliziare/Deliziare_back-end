import cloudinary from "../config/cloudinary.js";
import ChefPost from "../Models/chefPostModel.js";
import { createChefPost, deleteChefPostById, getPostsByChefId, updateChefPostById ,getAllChefPosts} from "../Service/chefPostService.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

export const createPost = async (req, res) => {
  try {
    const { title, description } = req.body;
    const files = req.files;

    if (!title || !description || !files || files.length === 0) {
      return res.status(400).json({ message: 'Missing required fields or images' });
    }

    const tags = req.body.tags?.split(',').map(tag => tag.trim()) || [];

    const images = files.map(file => ({
      data: file.buffer,
      altText: file.originalname,
    }));

    const chefId = req.user.id;
    const newPost = await createChefPost({ chefId, title, description, images, tags });

    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating chef post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};




export const getMyChefPosts = async (req, res) => {
  try {
    const chefId = req.user.id;

    if (!chefId) {
      return res.status(400).json({ message: 'Chef ID not found in token' });
    }

    const posts = await getPostsByChefId(chefId);
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching chef posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// export const updatePost = async (req, res) => {
//   try {
//     const postId = req.params.id;
//     const { title, description, tags } = req.body;
//     const files = req.files;

//     // 👇 Safely parse removed image IDs
//     let removedImageIds = [];
//     try {
//       removedImageIds = req.body.removedImages
//         ? JSON.parse(req.body.removedImages)
//         : [];
//     } catch (err) {
//       console.error("❌ Failed to parse removedImages:", err);
//       return res.status(400).json({ message: "Invalid removedImages format" });
//     }

//     // 👇 Find the original post
//     const post = await ChefPost.findOne({ _id: postId, chefId: req.user.id });
//     if (!post) {
//       return res.status(404).json({ message: "Post not found or not authorized" });
//     }

//     // 👇 Filter out removed images
//     const existingImages = Array.isArray(post.images) ? post.images : [];
//     const filteredImages = existingImages.filter(
//       (img) => !removedImageIds.includes(img._id?.toString?.())
//     );

//     // 👇 Add new images from form-data
//     const newImages = files?.length
//       ? files.map((file) => ({
//           data: file.buffer,
//           altText: file.originalname,
//         }))
//       : [];

//     const finalImages = [...filteredImages, ...newImages];

//     // 👇 Final update
//     const updated = await updateChefPostById(req.user.id, postId, {
//       title,
//       description,
//       tags,
//       images: finalImages,
//     });

//     if (!updated) {
//       return res.status(404).json({ message: "Failed to update post" });
//     }

//     return res.status(200).json(updated);
//   } catch (error) {
//     console.error("🔥 Server error in updatePost:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };



export const updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { title, description} = req.body;
    const files = req.files;


    const tags = req.body.tags?.split(',').map(tag => tag.trim()) || [];

    // Parse removedImages
    let removedImageIds = [];
    try {
      removedImageIds = req.body.removedImages ? JSON.parse(req.body.removedImages) : [];
    } catch (err) {
      console.error('Invalid removedImages format:', err);
      return res.status(400).json({ message: 'Invalid removedImages format' });
    }

    // Find existing post
    const post = await ChefPost.findOne({ _id: postId, chefId: req.user.id });
    if (!post) {
      return res.status(404).json({ message: 'Post not found or not authorized' });
    }

    // Keep images that are not in removedImages
    const existingImages = post.images || [];
    const keptImages = existingImages.filter(
      (img) => !removedImageIds.includes(img._id?.toString?.())
    );

    // Process new uploaded images
    const newImages = [];

if (files?.length) {
  for (const file of files) {
    const uploaded = await uploadToCloudinary(file.buffer); // your helper
    console.log(' Uploading file:', file.originalname, file.mimetype, file.size);
    console.log(' Uploaded to Cloudinary:', uploaded.secure_url);

    newImages.push({
      url: uploaded.secure_url,
      altText: file.originalname,
    });
  }
}

    const finalImages = [...keptImages, ...newImages];

    // Update the post
    const updated = await updateChefPostById(req.user.id, postId, {
      title,
      description,
      tags,
      images: finalImages,
    });

    if (!updated) {
      return res.status(404).json({ message: 'Failed to update post' });
    }

    return res.status(200).json(updated);
  } catch (error) {
    console.error('🔥 Server error in updatePost:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};




export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const deleted = await deleteChefPostById(req.user.id, postId);

    if (!deleted) {
      return res.status(404).json({ message: "Post not found or not authorized" });
    }

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting chef post:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getAllPosts = async (req, res) => {
  try {
    const posts = await getAllChefPosts();
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching all chef posts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// export const updateChefPost = asyncHandler(async (req, res) => {
//   const postId = req.params.id;
//   const post = await ChefPost.findById(postId);

//   if (!post) {
//     return res.status(404).json({ message: 'Post not found' });
//   }

//   const { title, description, tags } = req.body;

//   // Update basic fields
//   if (title) post.title = title;
//   if (description) post.description = description;
//   if (tags) post.tags = tags.split(',').map((tag) => tag.trim());

//   // Handle new images
//   if (req.files && req.files.length > 0) {
//     // OPTIONAL: Delete previous images from Cloudinary
//     for (const image of post.images) {
//       if (image.public_id) {
//         await cloudinary.uploader.destroy(image.public_id);
//       }
//     }

//     const uploadedImages = await Promise.all(
//       req.files.map(async (file) => {
//         const result = await cloudinary.uploader.upload(file.path, {
//           folder: 'chef-posts',
//         });
//         return {
//           url: result.secure_url,
//           public_id: result.public_id,
//         };
//       })
//     );

//     post.images = uploadedImages;
//   }

//   const updatedPost = await post.save();

//   res.status(200).json({
//     message: 'Post updated successfully',
//     post: updatedPost,
//   });
// });