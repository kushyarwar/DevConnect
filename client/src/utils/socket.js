import { io } from 'socket.io-client';
import { addNotification, incrementUnreadCount } from '../features/notifications/notificationsSlice';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;
let store = null; // We will store the Redux store here manually

export const injectStore = (_store) => {
  store = _store;
};

export const connectSocket = (token) => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  // Handle notifications
  socket.on('notification', (notification) => {
    // Only dispatch if store has been injected
    if (store) {
      store.dispatch(addNotification(notification));
      store.dispatch(incrementUnreadCount());
    }
  });

  // Handle online users
  socket.on('userOnline', ({ userId }) => {
    console.log('User online:', userId);
  });

  socket.on('userOffline', ({ userId }) => {
    console.log('User offline:', userId);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

// Socket event helpers
export const joinPostRoom = (postId) => {
  if (socket?.connected) {
    socket.emit('joinPost', postId);
  }
};

export const leavePostRoom = (postId) => {
  if (socket?.connected) {
    socket.emit('leavePost', postId);
  }
};

export const emitTyping = (postId, isTyping) => {
  if (socket?.connected) {
    socket.emit('typing', { postId, isTyping });
  }
};

export default {
  connectSocket,
  disconnectSocket,
  getSocket,
  joinPostRoom,
  leavePostRoom,
  emitTyping,
  injectStore,
};