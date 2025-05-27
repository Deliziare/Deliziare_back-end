import Chef from "../Models/chefModel.js";
import User from "../Models/userModel.js"


export const getChefByUserId = async (userId) => {
  console.log('chef id',userId)
  try {
    // First try to find chef profile
    let chef = await Chef.findOne({ userId }).populate('userId', '-password');
    
    // If no chef profile exists but user is a chef, create one
    if (!chef) {
      const user = await User.findById(userId);
      if (user?.role === 'chef') {
        chef = await Chef.create({
          userId: user._id,
          profilePhoto: user.profileImage || '',
          location: { lat: 0, lng: 0 },
          district: 'Unknown',
          experience: 'Not specified'
        }).populate('userId', '-password');
      }
    }
    
    if (!chef) throw new Error('Chef profile not found');
    return chef;
  } catch (error) {
    console.error('Error fetching chef profile:', error);
    throw error;
  }
};

export const updateChefProfileService = async (chefId, data) => {
  const {
    bio,
    specialize,
    qualifications,
    experience,
    district,
    instagram,
    youtube,
    facebook,
    linkedin,
  } = data;

  const updatedChef = await Chef.findOneAndUpdate(
    { userId: chefId },
    {
      bio,
      specialize,
      qualifications,
      experience,
      district,
      socialLinks: {
        instagram,
        youtube,
        facebook,
        linkedin,
      },
      
    },
    { new: true, upsert: true } 
  );

   await User.findByIdAndUpdate(
    chefId, 
    { isProfileCompleted: true },
    { new: true }
  );

  return updatedChef;
};
