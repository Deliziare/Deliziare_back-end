import { createChefPost, getPostsByChefId } from "../Service/chefPostService.js";

export const createPost = async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const files = req.files; // multer parsed files

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


