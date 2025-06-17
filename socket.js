import { Server } from "socket.io";
import Message from "./Models/messageModel.js";
import mongoose from "mongoose";
import chatRequestModel from "./Models/chatRequestModel.js";

let io;
const onlineUsers = new Map();

export const initSocket = (httpServer, clientURL) => {
  io = new Server(httpServer, {
    cors: {
      origin: clientURL,
      credentials: true,
    },
    transports: ["websocket"],
  });

  io.on("connection", (socket) => {
    console.log("⚡ Socket connected:", socket.id);

    socket.on("register", (userId) => {
      if (!userId) {
        console.warn("⚠️ Received register with no userId");
        return;
      }

      const userSockets = onlineUsers.get(userId.toString()) || new Set();
      userSockets.add(socket.id);
      onlineUsers.set(userId.toString(), userSockets);
      socket.join(userId.toString());
      io.emit("online_users_update", Array.from(onlineUsers.keys()));
      console.log(`✅ Registered user ${userId} with socket ${socket.id}`);
    });

     socket.on("locationUpdate", (coords) => {
      console.log("📍 Location received:", coords);

      socket.broadcast.emit("newLocation", coords);
    });

    socket.on("disconnect", () => {
      for (const [userId, sockets] of onlineUsers.entries()) {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            onlineUsers.delete(userId);
          }
          break;
        }
      }
      io.emit("online_users_update", Array.from(onlineUsers.keys()));
    });

    socket.on("send_message", async (message) => {
      try {
        // Emit the message to both sender and receiver
        const receiverSockets = onlineUsers.get(message.receiverId.toString());
        const senderSockets = onlineUsers.get(message.senderId.toString());

        // Calculate unread counts for both users
        const [receiverUnreadCounts, senderUnreadCounts] = await Promise.all([
          getUnreadCounts(message.receiverId),
          getUnreadCounts(message.senderId),
        ]);

        // Emit message and unread counts to receiver
        if (receiverSockets) {
          for (const socketId of receiverSockets) {
            io.to(socketId).emit("receive_message", message);
            io.to(socketId).emit("unread_counts_update", receiverUnreadCounts);
          }
        }

        // Emit message and unread counts to sender
        if (senderSockets) {
          for (const socketId of senderSockets) {
            io.to(socketId).emit("receive_message", message);
            io.to(socketId).emit("unread_counts_update", senderUnreadCounts);
          }
        }
      } catch (err) {
        console.error("❌ Error handling send_message:", err);
      }
    });

    socket.on("mark_messages_as_read", async ({ userId, senderId }) => {
      console.log(`📖 Received mark_messages_as_read for userId: ${userId}, senderId: ${senderId}`);
      try {
        // Update messages as read
        const updated = await Message.updateMany(
          {
            senderId: senderId,
            receiverId: userId,
            isRead: false,
          },
          { $set: { isRead: true } }
        );
        console.log(`📖 Updated ${updated.modifiedCount} messages as read`);

        // Fetch updated unread counts for both users
        const [senderUnreadCounts, receiverUnreadCounts] = await Promise.all([
          getUnreadCounts(senderId),
          getUnreadCounts(userId),
        ]);

        // Notify sender
        const senderSockets = onlineUsers.get(senderId.toString());
        if (senderSockets) {
          for (const socketId of senderSockets) {
            io.to(socketId).emit("messages_read", { userId, senderId });
            io.to(socketId).emit("unread_counts_update", senderUnreadCounts);
            console.log(`📤 Emitted messages_read and unread_counts_update to sender socket: ${socketId}`);
          }
        }

        // Notify receiver
        const receiverSockets = onlineUsers.get(userId.toString());
        if (receiverSockets) {
          for (const socketId of receiverSockets) {
            io.to(socketId).emit("messages_read", { userId, senderId });
            io.to(socketId).emit("unread_counts_update", receiverUnreadCounts);
            console.log(`📤 Emitted messages_read and unread_counts_update to receiver socket: ${socketId}`);
          }
        }
      } catch (err) {
        console.error("❌ Error in mark_messages_as_read:", err);
      }
    });
   
    socket.on("request_online_users", () => {
      socket.emit("online_users_update", Array.from(onlineUsers.keys()));
    });
    socket.on("request_unread_counts", async (userId) => {
  if (!userId) {
    console.warn("⚠️ Received request_unread_counts with no userId");
    return;
  }

  try {
    const unreadCounts = await getUnreadCounts(userId);
    socket.emit("unread_counts_update", unreadCounts);
    console.log(`📤 Sent unread_counts_update to user ${userId}:`, unreadCounts);
  } catch (err) {
    console.error("❌ Error fetching unread counts:", err);
  }
});
  });

  async function getUnreadCounts(userId) {
    const counts = await Message.aggregate([
      {
        $match: {
          receiverId: new mongoose.Types.ObjectId(userId),
          isRead: false,
        },
      },
      {
        $group: {
          _id: "$senderId",
          count: { $sum: 1 },
        },
      },
    ]);
    return counts.reduce((acc, { _id, count }) => {
      acc[_id.toString()] = count;
      return acc;
    }, {});
  }

  return io;
};

export const getIO = () => io;
export const getOnlineUsers = () => onlineUsers;

export const sendNotification = (recipientId, notificationData) => {
  const sockets = onlineUsers.get(recipientId.toString());
  if (sockets) {
    for (const socketId of sockets) {
      io.to(socketId).emit("new_notification", notificationData);
    }
    console.log(`📨 Notification sent to user ${recipientId}`);
  }
};