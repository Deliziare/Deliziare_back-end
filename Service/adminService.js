import User from "../Models/userModel.js";

export const fetchAllUsers = async () => {
  try {
    const users = await User.find({role: 'host'}, '-__v');
    return users;
  } catch (error) {
    throw new Error('Failed to fetch users');
  }
};



export const updateUserBlockStatus = async (userId, isBlock) => {
  if (typeof isBlock !== 'boolean') {
    throw new Error("isBlock must be a boolean");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  user.isBlock = isBlock;
  await user.save();

  return user;
};
