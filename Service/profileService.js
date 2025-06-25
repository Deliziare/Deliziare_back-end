import User from "../Models/userModel.js";
import Chef from '../Models/chefModel.js';
import ChefPost from '../Models/chefPostModel.js'

export const getChefById = async (userId) => {
  try {
    const user = await User.findById(userId).select('-password');
    if (!user) return null;

    const chef = await Chef.findOne({ userId });
    if (!chef) return null;

    return { user, chef }; 
  } catch (error) {
    throw new Error('Failed to fetch chef profile');
  }
};

export const getChefPostId = async (chefId) => {
    console.log('chef Id in post',chefId);
    
  try {
    const post = await ChefPost.find({chefId})
    console.log(post);
    
    if (!post) return null;


    return post; 
  } catch (error) {
    throw new Error('Failed to fetch chef profile');
  }
};
