// messageController.js
import mongoose from "mongoose";
import Message from "../Models/messageModel.js";
import { findUserById } from "../Service/userService.js";
import User from "../Models/userModel.js";

export const getMessage = async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;
    

    if (!mongoose.Types.ObjectId.isValid(userId) || 
        !mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    })
    .sort({ timestamp: 1 })
     .populate({
        path: 'postId',
        select: 'title images',
      })
    .lean(); 
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
}

export const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content ,postId} = req.body;

    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ message: 'Missing required fields' });
    }


    if (!mongoose.Types.ObjectId.isValid(senderId) || 
        !mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
     
      let validPostId = null;
    
    if (postId) {
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({ message: 'Invalid post ID format' });
      }
      validPostId = postId;
    }
    const newMessage = new Message({
      senderId,
      receiverId,
      content,
      postId:validPostId,
      isRead: false,
    });

    const savedMessage = await newMessage.save();
    
    res.status(201).json(savedMessage);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: 'Failed to send message' });
  }
}

export const findUserForChat=async(req,res)=>{
   const { id } = req.params;
  
  try {
    const user = await findUserById(id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export const getChatUsers = async (req, res) => {
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    const objectUserId = new mongoose.Types.ObjectId(userId);

    const chatUserIds = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: objectUserId },
            { receiverId: objectUserId }
          ]
        }
      },
      {
        $project: {
          otherUserId: {
            $cond: [
              { $eq: ['$senderId', objectUserId] },
              '$receiverId',
              '$senderId'
            ]
          },
          timestamp: 1
        }
      },
      {
        $sort: { timestamp: -1 } // Sort messages by latest first
      },
      {
        $group: {
          _id: '$otherUserId',
          lastMessageAt: { $first: '$timestamp' }
        }
      },
      {
        $sort: { lastMessageAt: -1 }
      }
    ]);

    const ids = chatUserIds.map(doc => doc._id);

  
    const users = await User.find({ _id: { $in: ids } })
      .select('_id name profileImage');

    
    const sortedUsers = ids.map(id => users.find(u => u._id.toString() === id.toString()));

    res.status(200).json(sortedUsers);
  } catch (error) {
    console.error('Error fetching chat users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const markMessagesAsRead = async (req, res) => {
  try {
    const receiverId = req.user.id;
    const { senderId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(receiverId) || !mongoose.Types.ObjectId.isValid(senderId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    await Message.updateMany(
      {
        senderId,
        receiverId,
        isRead: false,
      },
      { $set: { isRead: true } }
    );

    res.status(200).json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUnreadMessageCount = async (req, res) => {
  const receiverId = req.user.id;
  try {
    const count = await Message.countDocuments({ receiverId, isRead: false });
    res.status(200).json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Failed to fetch count' });
  }
};
