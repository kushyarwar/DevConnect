import { Router } from 'express';
import {
  createPost,
  updatePost, 
  getFeedPosts,
  getExplorePosts,
  getPost,
  getUserPosts,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  deleteComment,
  savePost,
  unsavePost,
  getSavedPosts
} from '../controllers/post.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { uploadPostImage } from '../config/cloudinary.js';
import {
  validateCreatePost,
  validateComment,
  validateObjectId,
  validatePagination
} from '../middleware/validation.js';

const router = Router();

// Public routes (with optional auth for user-specific data)
router.get('/explore', optionalAuth, validatePagination, getExplorePosts);
router.get('/user/:userId', validateObjectId('userId'), validatePagination, getUserPosts);
router.get('/:id', optionalAuth, validateObjectId('id'), getPost);

// Protected routes
router.get('/', authenticate, validatePagination, getFeedPosts);
router.post('/', authenticate, uploadPostImage.single('image'), validateCreatePost, createPost);

router.put('/:id', authenticate, validateObjectId('id'), uploadPostImage.single('image'), updatePost);

router.delete('/:id', authenticate, validateObjectId('id'), deletePost);

// Like routes
router.post('/:id/like', authenticate, validateObjectId('id'), likePost);
router.delete('/:id/like', authenticate, validateObjectId('id'), unlikePost);

// Comment routes
router.post('/:id/comments', authenticate, validateObjectId('id'), validateComment, addComment);
router.delete('/:postId/comments/:commentId', authenticate, deleteComment);

// Save routes
router.get('/saved', authenticate, validatePagination, getSavedPosts);
router.post('/:id/save', authenticate, validateObjectId('id'), savePost);
router.delete('/:id/save', authenticate, validateObjectId('id'), unsavePost);

export default router;