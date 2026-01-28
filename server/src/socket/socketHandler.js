import { verifyAccessToken } from '../config/jwt.js';

// Store online users
const onlineUsers = new Map();

export const initializeSocket = (io) => {
  // Authentication middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication required'));
    }
    
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return next(new Error('Invalid token'));
    }
    
    socket.userId = decoded.userId;
    next();
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`User connected: ${userId}`);

    // Join user's personal room for notifications
    socket.join(`user:${userId}`);

    // Track online status
    onlineUsers.set(userId, socket.id);
    io.emit('userOnline', { userId });

    // Handle joining post rooms (for real-time comments/likes)
    socket.on('joinPost', (postId) => {
      socket.join(`post:${postId}`);
    });

    socket.on('leavePost', (postId) => {
      socket.leave(`post:${postId}`);
    });

    // Handle real-time typing indicators
    socket.on('typing', ({ postId, isTyping }) => {
      socket.to(`post:${postId}`).emit('userTyping', {
        userId,
        isTyping
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
      onlineUsers.delete(userId);
      io.emit('userOffline', { userId });
    });
  });

  // Helper function to emit to specific user
  io.emitToUser = (userId, event, data) => {
    io.to(`user:${userId}`).emit(event, data);
  };

  // Helper function to emit to post room
  io.emitToPost = (postId, event, data) => {
    io.to(`post:${postId}`).emit(event, data);
  };

  // Helper function to check if user is online
  io.isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  // Helper function to get online users
  io.getOnlineUsers = () => {
    return Array.from(onlineUsers.keys());
  };
};

export default { initializeSocket };
