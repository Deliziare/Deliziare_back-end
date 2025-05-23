import Chef from "../Models/chefModel.js";
import User from "../Models/userModel.js";
import { updateUserProfileValidation } from "../validation/updateUserProfileValidation.js";


export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { name, phone } = req.body;
    const fieldsToUpdate=updateUserProfileValidation(name, phone) 
   if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided for update' });
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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