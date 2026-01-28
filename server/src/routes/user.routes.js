import express from 'express';
import {
  getUserProfile,
  updateProfile,
  updateAvatar,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  searchUsers,
  getSuggestedUsers
} from '../controllers/user.controller.js';

import { authenticate as protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js'; // Check if you have this for images

const router = express.Router();

// Public routes
router.get('/search', searchUsers); // Must be before /:id
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

// Protected routes (Require Login)
router.use(protect);

router.get('/suggestions', getSuggestedUsers);
router.put('/profile', updateProfile);
router.put('/avatar', upload.single('avatar'), updateAvatar);
router.post('/:id/follow', followUser);
router.delete('/:id/follow', unfollowUser);

router.get('/:id', getUserProfile);

export default router;