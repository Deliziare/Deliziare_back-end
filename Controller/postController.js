import Post from "../Models/postModel.js";
import User from "../Models/userModel.js";
import Notification from "../Models/NotificationModel.js";
import Chef from "../Models/chefModel.js";

import { getIO, getOnlineUsers } from "../socket.js";


export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const createPost = async (req, res) => {
  try {
    const {
      eventName,
      location, // { lat, lng }
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

    
    const chefProfiles = await Chef.find({ location: { $exists: true } }).populate('userId');

   
    const radiusKm = 30;
    const nearbyChefs = chefProfiles.filter(chef => {
      if (!chef.location?.lat || !chef.location?.lng || !chef.userId) return false;

      const distance = calculateDistanceKm(
        chef.location.lat,
        chef.location.lng,
        location.lat,
        location.lng
      );
      return distance <= radiusKm;
    });

    
    const io = getIO();
    const onlineUsers = getOnlineUsers();

    for (const chef of nearbyChefs) {
      const chefId = chef.userId._id.toString();

      const notification = await Notification.create({
        recipient: chefId,
        sender: userId,
        message: `New event "${eventName}" is available near you.`,
        postId: newPost._id
      });

      const chefSockets = onlineUsers.get(chefId);
      if (chefSockets && chefSockets.size > 0) {
        io.to([...chefSockets]).emit("new_notification", {
          ...notification.toObject(),
          createdAt: notification.createdAt.toISOString(),
          updatedAt: notification.updatedAt.toISOString()
        });
      }
    }

    res.status(201).json({ message: 'Post created and nearby chefs notified', post: newPost });

  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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