// import { Server } from "socket.io";
// import Message from "./Models/messageModel.js";

// let io;
// const onlineUsers = new Map();

// export const initSocket = (httpServer, clientURL) => {
//   io = new Server(httpServer, {
//     cors: {
//       origin: clientURL,
//       credentials: true,
//     },
//     transports: ["websocket"],
//   });

//   io.on("connection", (socket) => {
//     console.log("⚡ Socket connected:", socket.id);

//     socket.on("register", (userId) => {
//       if (!userId) {
//         console.warn("⚠️ Received register with no userId");
//         return;
//       }

//       const userSockets = onlineUsers.get(userId.toString()) || new Set();
//       userSockets.add(socket.id);
//       onlineUsers.set(userId.toString(), userSockets);
//   io.emit("online_users_update", Array.from(onlineUsers.keys()));
//       console.log(`✅ Registered user ${userId} with socket ${socket.id}`);
//       console.log("📋 Online users now:", [...onlineUsers.entries()].map(([id, sockets]) => [id, [...sockets]]));
//     });

//     socket.on("locationUpdate", ({ deliveryId, coords }) => {
//   if (!deliveryId || !coords) {
//     console.warn("⚠️ Missing deliveryId or coords in locationUpdate");
//     return;
//   }

//   console.log(`📍 Location update for delivery ${deliveryId}:`, coords);

//   // Send to all clients in that delivery room
//   io.to(`delivery_${deliveryId}`).emit("newLocation", {
//     deliveryId,
//     coords,
//     timestamp: new Date(),
//   });
// });


//     socket.on("join_delivery", (deliveryId) => {
//   if (deliveryId) {
//     socket.join(`delivery_${deliveryId}`);
//     console.log(`🚚 Socket ${socket.id} joined delivery room: delivery_${deliveryId}`);
//   }
// });

//     socket.on("disconnect", () => {
//       for (const [userId, sockets] of onlineUsers.entries()) {
//         if (sockets.has(socket.id)) {
//           sockets.delete(socket.id);
//           if (sockets.size === 0) {
//             onlineUsers.delete(userId);
//             console.log(`🚪 User ${userId} fully disconnected`);
//           } else {
//             onlineUsers.set(userId, sockets);
//             console.log(`🔌 Socket ${socket.id} disconnected for user ${userId}`);
//           }
//           break;
//         }
//       }
//         io.emit("online_users_update", Array.from(onlineUsers.keys()));
//       console.log("📋 Online users after disconnect:", [...onlineUsers.entries()].map(([id, sockets]) => [id, [...sockets]]));
//     });
//     socket.on("request_online_users", () => {
//   socket.emit("online_users_update", Array.from(onlineUsers.keys()));
// });
// socket.on('reconnect', (attempt) => {
//   console.log(`Reconnected after ${attempt} attempts`);
//   socket.emit('register', userId);
// });
//     socket.on("connect", () => {
//   console.log("Socket connected");
//   // Emit current online users to the newly connected client
//   socket.emit("online_users", Array.from(onlineUsers.keys()));
// });
//     socket.on("send_message", async (message) => {
//       try {
//         // Message is already saved in database via HTTP request
//         // Just broadcast it to the recipient
        
//         // Emit to receiver if online
//         const receiverSockets = onlineUsers.get(message.receiverId.toString());
//         if (receiverSockets && receiverSockets.size > 0) {
//           for (const socketId of receiverSockets) {
//             io.to(socketId).emit("receive_message", message);
//           }
//         }

//         // Also emit to sender for real-time update
//         const senderSockets = onlineUsers.get(message.senderId.toString());
//         if (senderSockets) {
//           for (const socketId of senderSockets) {
//             io.to(socketId).emit("receive_message", message);
//           }
//         }
//       } catch (err) {
//         console.error("❌ Error handling send_message:", err);
//       }
//     });
//   });

//   return io;
// };

// export const getIO = () => io;
// export const getOnlineUsers = () => onlineUsers;

// export const sendNotification = (recipientId, notificationData) => {
//   const sockets = onlineUsers.get(recipientId.toString());

//   if (sockets && sockets.size > 0) {
//     for (const socketId of sockets) {
//       io.to(socketId).emit("new_notification", notificationData);
//     }
//     console.log(`📨 Notification sent to user ${recipientId} on ${sockets.size} socket(s)`);
//   } else {
//     console.log(`📪 User ${recipientId} is offline — notification saved only`);
//   }
// };


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

     
    socket.on("locationUpdate", ({ deliveryId, coords }) => {
  if (!deliveryId || !coords) {
    console.warn("⚠️ Missing deliveryId or coords in locationUpdate");
    return;
  }

  console.log(`📍 Location update for delivery ${deliveryId}:`, coords);

  // Send to all clients in that delivery room
  io.to(`delivery_${deliveryId}`).emit("newLocation", {
    deliveryId,
    coords,
    timestamp: new Date(),
  });
});


    socket.on("join_delivery", (deliveryId) => {
  if (deliveryId) {
    socket.join(`delivery_${deliveryId}`);
    console.log(`🚚 Socket ${socket.id} joined delivery room: delivery_${deliveryId}`);
  }
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