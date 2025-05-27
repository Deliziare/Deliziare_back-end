import { createChefPost, deleteChefPostById, getPostsByChefId, updateChefPostById ,getAllChefPosts} from "../Service/chefPostService.js";

export const createPost = async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const files = req.files; 

    if ( !title || !description || !files || files.length === 0) {
      return res.status(400).json({ message: 'Missing required fields or images' });
    }

    const images = files.map(file => ({
      data: file.buffer,
      altText: file.originalname, 
    }));

     const chefId=req.user.id;
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



export const updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { title, description, tags } = req.body;
    const files = req.files;

    const images = files?.length
      ? files.map(file => ({
          data: file.buffer,
          altText: file.originalname,
        }))
      : undefined; 

    const updated = await updateChefPostById(req.user.id, postId, {
      title,
      description,
      tags,
      images,
    });

    if (!updated) {
      return res.status(404).json({ message: "Post not found or not authorized" });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating chef post:", error);
    res.status(500).json({ message: "Server error" });
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