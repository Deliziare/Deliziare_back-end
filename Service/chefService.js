import Chef from "../Models/chefModel.js";
import User from "../Models/userModel.js"
export const getChefByUserId = async (userId) => {
  console.log('chef id',userId)
  const chef = await Chef.findOne({ userId }).populate('userId', '-password');
  return chef;
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
