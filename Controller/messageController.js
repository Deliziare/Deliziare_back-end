//messagecontroller
import mongoose from "mongoose";
import Message from "../Models/messageModel.js";
import { findUserById } from "../Service/userService.js";
import User from "../Models/userModel.js";
import { rejectRequstMessageService, saveRequstMessage, sendMessageService } from "../Service/messageService.js";
import { getIO } from "../socket.js";
import chatRequestModel from "../Models/chatRequestModel.js";
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
    .populate([
    { path: 'postId', select: 'title images' },
    { path: 'requstId' }
   ])
    .lean(); 
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content, postId ,RequestChef} = req.body;

    if (!senderId || !receiverId ) {
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
    let requstMessage=null
    if(RequestChef){
      if(req.user.role !== 'chef' || senderId.toString() !== req.user._id.toString()){
       return res.status(400).json({ message: 'only send in chef' });
      }
      requstMessage=await saveRequstMessage({receiverId,RequestChef,senderId})
    }
    const messages = await sendMessageService({ content: content !== undefined ? content : null,receiverId,senderId,validPostId,requstMessage})
    res.status(201).json(messages);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

export const findUserForChat = async (req, res) => {
  const { id } = req.params;
  
  try {
    const user = await findUserById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

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
          timestamp: 1,
          isRead: 1,
          sentToCurrentUser: {
            $eq: ['$receiverId', objectUserId]
          }
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: '$otherUserId',
          lastMessageAt: { $first: '$timestamp' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$isRead', false] }, { $eq: ['$sentToCurrentUser', true] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { lastMessageAt: -1 }
      }
    ]);

    const ids = chatUserIds.map(doc => doc._id);

    const users = await User.find({ _id: { $in: ids } })
      .select('_id name profileImage');

    // Map the users back with unread counts and sort order
    const sortedUsers = chatUserIds.map(doc => {
      const user = users.find(u => u._id.toString() === doc._id.toString());
      return {
        ...user.toObject(),
        unreadCount: doc.unreadCount || 0
      };
    });

    res.status(200).json(sortedUsers);
  } catch (error) {
    console.error('Error fetching chat users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { userId, senderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId) || 
        !mongoose.Types.ObjectId.isValid(senderId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const updated = await Message.updateMany(
      { 
        senderId: senderId,
        receiverId: userId,
        isRead: false
      },
      { $set: { isRead: true } }
    );
    console.log(`📖 API: Updated ${updated.modifiedCount} messages as read for userId: ${userId}, senderId: ${senderId}`);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error marking messages as read:', err);
    res.status(500).json({ message: 'Failed to mark messages as read' });
  }
};

export const rejectRequstMessage=async (req,res)=>{
    try {
         const {chatRequstId}=req.body
       const updated=await rejectRequstMessageService({chatRequstId})
       if (!updated) return res.status(404).json({ message: 'Request not found' });
       const io = getIO();
       const message = await Message.findOne({ requstId: chatRequstId })
     .populate([
    { path: 'postId', select: 'title images' },
    { path: 'requstId' }
   ])
      .lean();
     if (!message) {
      console.warn(`⚠️ No message found for requstId: ${chatRequstId}`);
      return res.status(404).json({ message: "No associated message found" });
      }
  
      const { senderId, receiverId } = message;
      console.log(`📤 Emitting request_rejected to senderId: ${senderId}, receiverId: ${receiverId}`);
      io.to(senderId.toString()).emit("request_rejected", {
        messageId: message._id,
        requstId: updated,
      });
      io.to(receiverId.toString()).emit("request_rejected", {
        messageId: message._id,
        requstId: updated,
      });
      console.log(`📤 Emitted request_rejected event for chatRequstId: ${chatRequstId}`);
    
      res.status(200).json(updated);
    } catch (error) {
      console.error('Error ', error);
      res.status(500).json({ message: 'Failed ' ,error});
    }

}

export const addAddressToChatRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { district, location, date, time } = req.body;

    const request = await chatRequestModel.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found',success:false });
    }

  
    request.district = district;
    request.location = location;
    request.date = date;
    request.time = time;
    request.isAddressAdd = true;

    await request.save();

    res.status(200).json({ message: 'Address added successfully', value:request,success:true });
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ message: 'Internal Server Error' ,success:false});
  }
};
