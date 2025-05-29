import Post from "../Models/postModel.js";
import User from "../Models/userModel.js";
import Notification from "../Models/NotificationModel.js";
import Chef from "../Models/chefModel.js";

import { getIO, getOnlineUsers } from "../socket.js";


// postController.js
export const createPost = async (req, res) => {
  try {
    const {
      eventName,
      location,
      date,
      time,
      district,
      quantity,
      menu,
      description
    } = req.body;

    const userId = req.user.id;

    const newPost = new Post({
      userId,
      eventName,
      location,
      date,
      time,
      district,
      quantity,
      menu,
      description
    });

    await newPost.save();

    // Find chefs in the same district
    const chefs = await User.find({ role: "chef" });
    const chefIds = chefs.map(chef => chef._id);

    const matchingChefProfiles = await Chef.find({
      userId: { $in: chefIds },
      district: { $regex: new RegExp(`^${district}$`, "i") }
    });

    const filteredChefUsers = chefs.filter(chef =>
      matchingChefProfiles.some(profile => profile.userId.toString() === chef._id.toString())
    );

    // Create and send notifications
    const io = getIO();
    const onlineUsers = getOnlineUsers();
    
    console.log("Current online users:", [...onlineUsers.entries()]);

    for (const chef of filteredChefUsers) {
      const chefId = chef._id.toString();
      
      const notification = await Notification.create({
        recipient: chefId,
        sender: userId,
        message: `New post available in ${district}: ${eventName}`,
        postId: newPost._id
      });

      const chefSockets = onlineUsers.get(chefId);
      
      if (chefSockets) {
        console.log(`Sending to chef ${chefId} on sockets:`, [...chefSockets]);
        io.to([...chefSockets]).emit("new_notification", {
          ...notification.toObject(),
          // Ensure dates are strings
          createdAt: notification.createdAt.toISOString(),
          updatedAt: notification.updatedAt.toISOString()
        });
      } else {
        console.log(`Chef ${chefId} is offline`);
      }
    }

    res.status(201).json({ message: 'Post created', post: newPost });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};




export const viewPost = async (req,res) =>{
try {
    const posts=await Post.find({userId:req.user.id})
  res.status(200).json({posts})
} catch (error) {
    res.status(500).json({message:'Server Error'})
}
}

export const updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const updatedData = req.body;
    const updatedPost = await Post.findByIdAndUpdate(postId, updatedData, {
      new: true,
    });

    if (!updatedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Server error while updating post' });
  }
};