import User from "../Models/userModel.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
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