import Notification from "../Models/NotificationModel.js";
import { getIO, getOnlineUsers } from "../socket.js";

export const createNotificationService = async ({ recipientId, senderId, message, postId }) => {
  const notification = await Notification.create({
    recipient: recipientId,
    sender: senderId,
    message,
    postId,
  });

  const io = getIO();
  const onlineUsers = getOnlineUsers();
  const sockets = onlineUsers.get(recipientId.toString());

  if (sockets && io) {
    for (const socketId of sockets) {
      io.to(socketId).emit("new_notification", notification);
    }
    console.log(`Notification sent to user ${recipientId} on ${sockets.size} sockets`);
  } else {
    console.log(`User ${recipientId} is not online, notification saved`);
  }

  return notification;
};
