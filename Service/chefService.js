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
    name,
    bio,
    specialize,
    qualifications,
    experience,
    certificate,
    district,
    instagram,
    youtube,
    facebook,
    linkedin,
    location
  } = data;

  const updatedChef = await Chef.findOneAndUpdate(
    { userId: chefId },
    {
    name,
      bio,
      specialize,
      qualifications,
      experience,
      certificate,
      district,
      location,
      socialLinks: {
        instagram,
        youtube,
        facebook,
        linkedin,
      },
        certificate,
    },
    { new: true, upsert: true } 
  );

   await User.findByIdAndUpdate(
    chefId, 
    { isProfileCompleted: true ,
      name},
    { new: true }
  );

  return updatedChef;
};



