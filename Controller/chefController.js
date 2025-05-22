import { getChefByUserId, updateChefProfileService } from "../Service/chefService.js";
import Post from "../Models/postModel.js";
import Chef from "../Models/chefModel.js";

export const getLoggedInChef = async (req, res) => {
  const userId = req.user.id || req.user.userId; 
  const chef = await getChefByUserId(userId);
   //console.log(chef)
  if (!chef) {
    return res.status(404).json({ message: 'Chef profile not found' });
  }

  res.status(200).json(chef);
};


export const updateChefProfile = async (req, res) => {
  try {
    const chefId = req.user.id; 

    const updatedChef = await updateChefProfileService(chefId, req.body);

    res.status(200).json({
      success: true,
      message: 'Chef profile updated successfully',
      data: updatedChef,
    });
  } catch (error) {
    console.error('Error updating chef profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update chef profile',
      error: error.message,
    });
  }
};


// view post



export const getPostsForChefDistrict = async (req, res) => {
  try {
    const userId = req.user.id; 
    const chef = await Chef.findOne({ userId });

    if (!chef) {
      return res.status(404).json({ message: 'Chef not found' });
    }

    const posts = await Post.find({ district: chef.district }).populate('userId', 'name email');
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching posts', error: err.message });
  }
};


export const viewPostDetail=async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('userId', 'name email');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }

}
