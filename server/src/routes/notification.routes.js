import { Router } from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
} from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateObjectId, validatePagination } from '../middleware/validation.js';

const router = Router();

// All notification routes are protected
router.use(authenticate);

router.get('/', validatePagination, getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', validateObjectId('id'), markAsRead);
router.delete('/:id', validateObjectId('id'), deleteNotification);
router.delete('/', deleteAllNotifications);

export default router;
