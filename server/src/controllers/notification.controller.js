import Notification from '../models/Notification.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const notifications = await Notification.getUserNotifications(
    req.userId,
    page,
    limit
  );

  const total = await Notification.countDocuments({ recipient: req.userId });
  const unreadCount = await Notification.getUnreadCount(req.userId);

  res.json({
    notifications,
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.getUnreadCount(req.userId);
  res.json({ count });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.userId },
    { read: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  res.json({ notification });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.markAllAsRead(req.userId);
  res.json({ message: 'All notifications marked as read' });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.userId
  });

  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  res.json({ message: 'Notification deleted' });
});

export const deleteAllNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ recipient: req.userId });
  res.json({ message: 'All notifications deleted' });
});

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
};
