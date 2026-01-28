import Post from '../models/Post.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { deleteImage } from '../config/cloudinary.js';
import {
  getCachedTrendingPosts,
  cacheTrendingPosts,
  invalidateTrendingCache
} from '../utils/cache.js';

export const createPost = asyncHandler(async (req, res) => {
  const { content, codeSnippet } = req.body;

  const postData = {
    author: req.userId,
    content
  };

  // Add image if uploaded
  if (req.file) {
    postData.image = {
      url: req.file.path,
      publicId: req.file.filename
    };
  }

  // Add code snippet if provided
  if (codeSnippet?.code) {
    postData.codeSnippet = codeSnippet;
  }

  const post = await Post.create(postData);
  await post.populate('author', 'username name avatar');

  // SAFE INVALIDATION
  try {
    await invalidateTrendingCache();
  } catch (error) {
    console.error('⚠️ Cache invalidation failed (ignoring):', error.message);
  }

  res.status(201).json({ post });
});

export const updatePost = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  if (post.author.toString() !== req.userId.toString()) {
    throw new AppError('Not authorized to update this post', 403);
  }

  // Update content
  post.content = content || post.content;

  // Handle Code Snippet (Empty check)
  const flatCode = req.body['codeSnippet[code]'];
  const nestedCode = req.body.codeSnippet?.code;
  const submittedCode = flatCode !== undefined ? flatCode : nestedCode;

  if (submittedCode !== undefined) {
      if (String(submittedCode).trim() === '') {
          post.codeSnippet = null; 
      } else {
          const flatLang = req.body['codeSnippet[language]'];
          const nestedLang = req.body.codeSnippet?.language;
          post.codeSnippet = {
              code: submittedCode,
              language: flatLang || nestedLang || 'javascript'
          };
      }
  }

  // Case 1: Uploading a NEW image (Replace old)
  if (req.file) {
    if (post.image?.publicId) {
      await deleteImage(post.image.publicId);
    }
    post.image = {
      url: req.file.path,
      publicId: req.file.filename
    };
  } 
  // Case 2: User clicked "X" (Delete old, no new image)
  else if (req.body.deleteImage === 'true') {
    if (post.image?.publicId) {
      await deleteImage(post.image.publicId);
    }
    post.image = null; // Remove from DB
  }

  await post.save();
  await post.populate('author', 'username name avatar');

  try {
    await invalidateTrendingCache();
  } catch (error) {
    console.error('⚠️ Cache invalidation failed');
  }

  res.json({ post });
});

export const getFeedPosts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const user = await User.findById(req.userId);
  const following = user.following || [];

  const posts = await Post.getFeed(req.userId, following, page, limit);

  // Get total for pagination
  const total = await Post.countDocuments({
    author: { $in: [req.userId, ...following] }
  });

  // Add isLiked and isSaved for current user
  const postsWithUserData = posts.map(post => ({
    ...post,
    isLiked: post.likes?.some(id => id.toString() === req.userId.toString()),
    isSaved: user.savedPosts?.some(id => id.toString() === post._id.toString())
  }));

  res.json({
    posts: postsWithUserData,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasMore: page * limit < total
    }
  });
});

export const getExplorePosts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const timeRange = req.query.timeRange || '24h'; // Default to 24 hours

  // 1. Calculate Date Range
  const now = new Date();
  let startDate = new Date();

  switch (timeRange) {
    case '24h':
      startDate.setHours(now.getHours() - 24);
      break;
    case '2d':
      startDate.setDate(now.getDate() - 2);
      break;
    case '7d':
      startDate.setDate(now.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(now.getDate() - 30);
      break;
    case 'all':
      startDate = new Date(0); // Beginning of time
      break;
    default:
      startDate.setHours(now.getHours() - 24);
  }

  // 2. Fetch from DB with Date Filter & Sorting
  // We sort by Likes first, then Comments to determine "Trending"
  const posts = await Post.find({ 
    createdAt: { $gte: startDate } 
  })

  .sort({ createdAt: -1 }) 
  .skip((page - 1) * limit)
  .limit(limit)
  .populate('author', 'username name avatar')
  .lean();

  const total = await Post.countDocuments({ createdAt: { $gte: startDate } });

  // 3. Add User Interaction Data (if logged in)
  let postsWithUserData = posts;
  if (req.userId) {
    const user = await User.findById(req.userId);
    postsWithUserData = posts.map(post => ({
      ...post,
      isLiked: post.likes?.some(id => id.toString() === req.userId.toString()),
      isSaved: user.savedPosts?.some(id => id.toString() === post._id.toString())
    }));
  }

  res.json({
    posts: postsWithUserData,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasMore: page * limit < total
    }
  });
});

export const getPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'username name avatar')
    .populate('comments.user', 'username name avatar')
    .lean();

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  // Add user interaction data if authenticated
  let postWithUserData = post;
  if (req.userId) {
    const user = await User.findById(req.userId);
    postWithUserData = {
      ...post,
      isLiked: post.likes?.some(id => id.toString() === req.userId.toString()),
      isSaved: user.savedPosts?.some(id => id.toString() === post._id.toString())
    };
  }

  res.json({ post: postWithUserData });
});

export const getUserPosts = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const posts = await Post.find({ author: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('author', 'username name avatar')
    .lean();

  const total = await Post.countDocuments({ author: userId });

  res.json({
    posts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  if (post.author.toString() !== req.userId.toString()) {
    throw new AppError('Not authorized to delete this post', 403);
  }

  // Delete image from Cloudinary if exists
  if (post.image?.publicId) {
    await deleteImage(post.image.publicId);
  }

  await post.deleteOne();

  // SAFE INVALIDATION
  try {
    await invalidateTrendingCache();
  } catch (error) {
    console.error('⚠️ Cache invalidation failed');
  }

  res.json({ message: 'Post deleted successfully' });
});

export const likePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  // Check if already liked
  if (post.likes.includes(req.userId)) {
    throw new AppError('Post already liked', 400);
  }

  post.likes.push(req.userId);
  await post.save();

  if (post.author.toString() !== req.userId.toString()) {
      const notification = await Notification.createNotification({
        recipient: post.author, 
        sender: req.userId,
        type: 'like',
        post: post._id
      });

      if (notification) {
        const io = req.app.get('io');
        io.to(`user:${post.author}`).emit('notification', notification);
      }
  }

  // SAFE INVALIDATION
  try {
    await invalidateTrendingCache();
  } catch (error) {
    console.error('⚠️ Cache invalidation failed');
  }

  res.json({
    message: 'Post liked',
    likeCount: post.likes.length
  });
});

export const unlikePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  // Check if liked
  if (!post.likes.includes(req.userId)) {
    throw new AppError('Post not liked', 400);
  }

  post.likes = post.likes.filter(
    id => id.toString() !== req.userId.toString()
  );
  await post.save();

  // SAFE INVALIDATION
  try {
    await invalidateTrendingCache();
  } catch (error) {
    console.error('⚠️ Cache invalidation failed');
  }

  res.json({
    message: 'Post unliked',
    likeCount: post.likes.length
  });
});

export const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const comment = {
    user: req.userId,
    content
  };

  post.comments.push(comment);
  await post.save();

  // Get the populated comment
  const updatedPost = await Post.findById(req.params.id)
    .populate('comments.user', 'username name avatar');

  const newComment = updatedPost.comments[updatedPost.comments.length - 1];

  if (post.author.toString() !== req.userId.toString()) {
      const notification = await Notification.createNotification({
        recipient: post.author, 
        sender: req.userId,
        type: 'comment',
        post: post._id,
        content: content.substring(0, 100)
      });

      if (notification) {
        const io = req.app.get('io');
        io.to(`user:${post.author}`).emit('notification', notification);
      }
  }

  // SAFE INVALIDATION
  try {
    await invalidateTrendingCache();
  } catch (error) {
    console.error('⚠️ Cache invalidation failed');
  }

  res.status(201).json({
    comment: newComment,
    commentCount: post.comments.length
  });
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { postId, commentId } = req.params;
  const post = await Post.findById(postId);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const comment = post.comments.id(commentId);

  if (!comment) {
    throw new AppError('Comment not found', 404);
  }

  // Check authorization (comment author or post author can delete)
  if (
    comment.user.toString() !== req.userId.toString() &&
    post.author.toString() !== req.userId.toString()
  ) {
    throw new AppError('Not authorized to delete this comment', 403);
  }

  post.comments.pull(commentId);
  await post.save();

  // SAFE INVALIDATION
  try {
    await invalidateTrendingCache();
  } catch (error) {
    console.error('⚠️ Cache invalidation failed');
  }

  res.json({
    message: 'Comment deleted',
    commentCount: post.comments.length
  });
});

export const savePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const user = await User.findById(req.userId);

  if (!user.savedPosts) {
      user.savedPosts = [];
  }

  const isSaved = user.savedPosts.some(id => id.toString() === post._id.toString());
  
  if (isSaved) {
    throw new AppError('Post already saved', 400);
  }

  user.savedPosts.push(post._id);
  await user.save();

  res.json({ message: 'Post saved' });
});

export const unsavePost = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);

  if (!user.savedPosts) {
      user.savedPosts = [];
  }

  user.savedPosts = user.savedPosts.filter(
    id => id.toString() !== req.params.id
  );
  await user.save();

  res.json({ message: 'Post unsaved' });
});

export const getSavedPosts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const user = await User.findById(req.userId);
  const savedIds = user.savedPosts || [];

  const skip = (page - 1) * limit;
  const paginatedIds = savedIds.slice(skip, skip + limit);

  const posts = await Post.find({ _id: { $in: paginatedIds } })
    .populate('author', 'username name avatar')
    .lean();

  const postsWithSaved = posts.map(post => ({
    ...post,
    isSaved: true,
    isLiked: post.likes?.some(id => id.toString() === req.userId.toString())
  }));

  res.json({
    posts: postsWithSaved,
    pagination: {
      page,
      limit,
      total: savedIds.length,
      pages: Math.ceil(savedIds.length / limit)
    }
  });
});

export default {
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
};