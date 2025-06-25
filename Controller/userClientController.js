import Chef from "../Models/chefModel.js";
import ChefPost from "../Models/chefPostModel.js";
import User from "../Models/userModel.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import { updateUserProfileValidation } from "../validation/updateUserProfileValidation.js";

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone } = req.body;

   
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

z
    if (user.isGoogleUser && !phone) {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { name },
        { new: true, runValidators: true }
      );
      return res.status(200).json({
        message: 'Profile updated successfully',
        user: updatedUser
      });
    }

 
    const fieldsToUpdate = updateUserProfileValidation(name, phone);
    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided for update' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      
      errors: error.errors ? Object.values(error.errors).map(e => e.message) : undefined
    });
  }
};


export const getAllChefs=async(req,res)=>{
  try{
    const chefs=await Chef.find().populate('userId','name email');
    res.status(200).json(chefs)
  }catch(error){
    res.status(500).json({message:'Failed to fetch chefs',error})
  }
}
export const uploadProfileImage = async (req, res) => {
  try {
 
    const userId = req.user.id; 
      if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const buffer = req.file.buffer;

    const result = await uploadToCloudinary(buffer, {
      folder: 'user_profiles',
      resource_type: 'image',
    });

   
    await User.findByIdAndUpdate(userId, { profileImage: result.secure_url });

    res.status(200).json({ imageUrl: result.secure_url });
  } catch (error) {
    console.error('Profile Upload Error:', error);
    res.status(500).json({ error: 'Image upload failed' });
  }
};

//==================================================SavedJob=========================================
export const savedPost=async(req,res)=>{
  const userId=req.user.id
  const postId=req.params.id 

  try{
    if(!mongoose.Types.isValid(postId)){
      return res 
      .status(400).json({success:false,message:'Invalid post'})
    }
    const post=await ChefPost.findById(postId)
    if(!post){
      return res 
      .status(400)
      .json({success:false,message:'Post not found'})
    }
    const user=await User.findById(userId)
    const alreadySaved=user.savedPost?.some(id=>id.toString()===postId.toString())
    if(alreadySaved){
      return res 
      .status(200)
      .json({success:true,message:'Job already saved'})
    }
    user.savedPost.push(postId)
    await user.save()
    return res 
    .status(200).json({success:true,message:'Job saved successfully'})
  }catch(err){
    return res 
    .status(500).json({success:false,message:'Internal server error'})
  }
}