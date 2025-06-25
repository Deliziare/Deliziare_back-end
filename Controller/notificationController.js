import Notification from "../Models/NotificationModel.js";
import { createNotificationService } from "../Service/notificationService.js";
import { sendNotification } from "../socket.js";

export const getNotifications = async (req, res) => {
  const userId = req.user._id;
  const notifications = await Notification.find({ recipient: userId }).sort({ createdAt: -1 });
  res.json(notifications);
};

export const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ message: "Failed to mark all as read" });
  }
};

export const createNotification = async (req, res) => {
    try {
      const { recipientId, senderId, message, postId } = req.body;
  
      const notification = await createNotificationService({
        recipientId,
        senderId,
        message,
        postId,
        type
        
      });
  
     
      sendNotification(recipientId, notification);
  
      res.status(201).json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  };
  