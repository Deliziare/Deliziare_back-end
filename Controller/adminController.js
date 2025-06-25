import Chef from "../Models/chefModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import { fetchAllUsers, fetchDeliveryBoy } from "../Service/adminService.js";
import Bid from'../Models/bidModel.js';
import User from "../Models/userModel.js";

export const getAllChefsForAdmin = asyncHandler(async (req, res) => {
  const chefs = await Chef.find().populate('userId');

const formattedChefs = chefs
  .filter(chef => chef.userId) 
  .map((chef) => ({
    id: chef._id,
    userId:chef.userId._id,
    name: chef.userId.name,
    email: chef.userId.email,
    profileImage:chef.userId.profileImage,
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

export const handleTogleBlock = asyncHandler(async (req, res) => {
  try {
    const chef = await User.findById(req.params.id)
    if (!chef) return res.status(404).json({ message: 'Chef not found' });

    chef.isBlock = !chef.isBlock;

   

    await chef.save();

    res.status(200).json({ isBlocked: chef.isBlock });
  } catch (err) {
    console.error("Toggle block error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});





export const getUsersByAdmin = async (req, res) => {
  try {
    const users = await fetchAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error("Admin fetch error:", error);
    res.status(500).json({ message: error.message });
  }
};



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




export const getDeliveryBoyAdmin = async (req, res) => {
  try {
    const users = await fetchDeliveryBoy();
    res.status(200).json(users);
  } catch (error) {
    console.error("Admin fetch error:", error);
    res.status(500).json({ message: error.message });
  }
};


export const toggleDeliveryBlockStatus = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role !== 'deliveryBoy') {
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


export const countUsersController =async(req,res)=>{
  try {
    const [hostCount,chefCount,deliveryCount]=await Promise.all([
      User.countDocuments({role:'host'}),
      User.countDocuments({role:'chef'}),
      User.countDocuments({role:'deliveryBoy'})
    ])

    res.status(200).json({
      message:'count got successfully',
       host:hostCount,
      chef:chefCount,
      deliveryBoy:deliveryCount
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({message:'server error'})
  }
}

export const getPopularChefs = async (req, res) => {
  try {
    const popularChefs = await Bid.aggregate([
      { $match: { status: "accepted" } },
      { $group: { _id: "$chefId", acceptedBids: { $sum: 1 } } },
      { $sort: { acceptedBids: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "chef",
        },
      },
      { $unwind: "$chef" },
      {
        $project: {
          _id: 0,
          chefId: "$_id",
          name: "$chef.name",
          email: "$chef.email",
          profileImage:"$chef.profileImage",
          acceptedBids: 1,
        },
      },
    ]);

    res.status(200).json(popularChefs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch popular chefs", error: err });
  }
};
