import { Server } from "socket.io";

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

      console.log(`✅ Registered user ${userId} with socket ${socket.id}`);
      console.log("📋 Online users now:", [...onlineUsers.entries()].map(([id, sockets]) => [id, [...sockets]]));
    });

    socket.on("disconnect", () => {
      for (const [userId, sockets] of onlineUsers.entries()) {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            onlineUsers.delete(userId);
            console.log(`🚪 User ${userId} fully disconnected`);
          } else {
            onlineUsers.set(userId, sockets);
            console.log(`🔌 Socket ${socket.id} disconnected for user ${userId}`);
          }
          break;
        }
      }

      console.log("📋 Online users after disconnect:", [...onlineUsers.entries()].map(([id, sockets]) => [id, [...sockets]]));
    });
  });

  return io;
};

export const getIO = () => io;
export const getOnlineUsers = () => onlineUsers;

export const sendNotification = (recipientId, notificationData) => {
  const sockets = onlineUsers.get(recipientId.toString());

  if (sockets && sockets.size > 0) {
    for (const socketId of sockets) {
      io.to(socketId).emit("new_notification", notificationData);
    }
    console.log(`📨 Notification sent to user ${recipientId} on ${sockets.size} socket(s)`);
  } else {
    console.log(`📪 User ${recipientId} is offline — notification saved only`);
  }
};
