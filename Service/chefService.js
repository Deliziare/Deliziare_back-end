import Chef from "../Models/chefModel.js";

export const getChefByUserId = async (userId) => {
  const chef = await Chef.findOne({ userId }).populate('userId', '-password');
  return chef;
};


