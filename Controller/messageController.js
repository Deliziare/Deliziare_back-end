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
  const userId = req.user?.id;

  console.log('→ [GET USERS] Authenticated user:', userId);

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.warn('→ [GET USERS] Invalid user ID');
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
          timestamp: 1,
          senderId: 1,
          receiverId: 1,
          isRead: 1
        }
      },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$otherUserId',
          lastMessageAt: { $first: '$timestamp' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiverId', objectUserId] }, { $eq: ['$isRead', false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { lastMessageAt: -1 } }
    ]);

    console.log('→ [GET USERS] Aggregated chat users with unread counts:', chatUserIds);

    const ids = chatUserIds.map(doc => doc._id);
    const users = await User.find({ _id: { $in: ids } }).select('_id name profileImage');

    const sortedUsers = ids.map(id => {
      const user = users.find(u => u._id.toString() === id.toString());
      const chatInfo = chatUserIds.find(u => u._id.toString() === id.toString());
      return {
        _id: user?._id,
        name: user?.name,
        profileImage: user?.profileImage,
        unreadCount: chatInfo?.unreadCount || 0
      };
    });

    res.status(200).json(sortedUsers);
  } catch (error) {
    console.error('→ [GET USERS ERROR]:', error);
    res.status(500).json({ message: 'Server error' });
  }
};




export const getUnreadCount = async (req, res) => {
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID format' });
  }

  try {
    const count = await Message.countDocuments({
      receiverId: userId,
      isRead: false
    });

    res.status(200).json({ count });
  } catch (err) {
    console.error('Error fetching unread count:', err);
    res.status(500).json({ message: 'Failed to fetch unread count' });
  }
};

export const markMessagesAsRead = async (req, res) => {
  const userId = req.user?.id;
  const { senderId } = req.body;

  console.log('→ [MARK READ] Sender:', senderId, '| Receiver (logged-in user):', userId);

  try {
    const result = await Message.updateMany(
      { senderId, receiverId: userId, isRead: false },
      { isRead: true }
    );

    console.log('→ [MARK READ] Matched:', result.matchedCount, '| Modified:', result.modifiedCount);

    res.status(200).json({ message: 'Marked as read' });
  } catch (err) {
    console.error('→ [MARK READ ERROR]:', err);
    res.status(500).json({ message: 'Failed to mark messages as read' });
  }
};

