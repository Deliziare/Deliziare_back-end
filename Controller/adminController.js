import Chef from "../Models/chefModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import { fetchAllUsers } from "../Service/adminService.js";
import { updateUserBlockStatus } from "../Service/adminService.js";

export const getAllChefsForAdmin = asyncHandler(async (req, res) => {
  const chefs = await Chef.find().populate('userId');

  const formattedChefs = chefs.map((chef) => ({
    id: chef._id,
    name: chef.userId.name,
    email: chef.userId.email,
    experience: chef.experience || "",
    location: chef.location,
    state: chef.state || "",
    district: chef.district || "",
    isBlocked: chef.userId.isBlock,
    specialisations: chef.specialize || [],
    certificate: chef.certificate || "",
  }));

  res.status(200).json(formattedChefs);
});

export const handleTogleBlock=asyncHandler(async(req,res)=>{
 try {
   
    
    const chef = await Chef.findById(req.params.id);
    if (!chef) return res.status(404).json({ message: 'Chef not found' });

    chef.isBlocked = !chef.isBlocked;
    await chef.save();

    res.status(200).json({ isBlocked: chef.isBlocked });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
})




export const getUsersByAdmin = async (req, res) => {
  try {
    const users = await fetchAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error("Admin fetch error:", error);
    res.status(500).json({ message: error.message });
  }
};

import User from "../Models/userModel.js";

export const toggleUserBlockStatus = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== 'host') {
      return res.status(400).json({ message: "User is not a host" });
    }

    user.isBlock = !user.isBlock;
    await user.save();

    res.status(200).json({
      message: `User has been ${user.isBlock ? "blocked" : "unblocked"} successfully.`,
      user,
    });
  } catch (error) {
    console.error("Error toggling user block status:", error);
    res.status(500).json({ message: "Server error" });
  }
};
