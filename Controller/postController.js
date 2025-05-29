import Post from "../Models/postModel.js";


export const createPost = async (req, res) => {
  try {
    const {
      eventName,
      location,
      date,
      time,
      district,
      quantity,
      menu,
      description
    } = req.body;

    const userId = req.user.id;
   
    const newPost = new Post({
      userId,
      eventName,
      location,
      date,
      time,
      district,
      quantity,
      menu,
      description,
      
    });

    await newPost.save();

    res.status(201).json({ message: 'Post created successfully', post: newPost });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const viewPost = async (req,res) =>{
try {
    const posts=await Post.find({userId:req.user.id})
  res.status(200).json({posts})
} catch (error) {
    res.status(500).json({message:'Server Error'})
}
}

export const updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const updatedData = req.body;
    const updatedPost = await Post.findByIdAndUpdate(postId, updatedData, {
      new: true,
    });

    if (!updatedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Server error while updating post' });
  }
};