import User from '../models/User.js';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { deleteImage } from '../config/cloudinary.js';
import {
  getCachedUser,
  cacheUser,
  invalidateUserCache,
  getCachedFollowers,
  cacheFollowers,
  getCachedFollowing,
  cacheFollowing
} from '../utils/cache.js';

export const getUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let user;

  // 1. SAFE REDIS RETRIEVAL
  try {
    user = await getCachedUser(id);
    if (user) {
      console.log(`✅ Cache HIT for user: ${id}`);
    }
  } catch (error) {
    console.error("⚠️ Redis Cache Error (Skipping cache):", error.message);
    user = null; // Force DB fetch
  }

  // 2. DATABASE FALLBACK
  if (!user) {
    console.log(`⚠️ Cache MISS - Fetching from DB for: ${id}`);
    
    user = await User.findById(id)
      .select('-savedPosts')
      .lean();

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Add counts
    user.followerCount = user.followers?.length || 0;
    user.followingCount = user.following?.length || 0;
    user.postCount = await Post.countDocuments({ author: id });

    // 3. SAFE REDIS SAVING
    try {
        await cacheUser(id, user);
    } catch (error) {
        console.error("⚠️ Redis Save Error (Ignoring):", error.message);
    }
  }

  // 4. CHECK FOLLOWING STATUS
  let isFollowing = false;
  if (req.userId) {
    if (user.followers && Array.isArray(user.followers)) {
      isFollowing = user.followers.some(
        followerId => followerId.toString() === req.userId.toString()
      );
    }
  }

  res.json({
    user: {
      ...user,
      isFollowing
    }
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const allowedUpdates = ['name', 'bio', 'location', 'website', 'github', 'twitter', 'linkedin', 'skills'];
  const updates = {};

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.userId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  // Invalidate cache
  await invalidateUserCache(req.userId.toString());

  res.json({ user: user.toPublicProfile() });
});

export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('Please upload an image', 400);
  }

  const user = await User.findById(req.userId);

  // Delete old avatar if exists
  if (user.avatar?.publicId) {
    await deleteImage(user.avatar.publicId);
  }

  // Update avatar
  user.avatar = {
    url: req.file.path,
    publicId: req.file.filename
  };
  await user.save();

  // Invalidate cache
  await invalidateUserCache(req.userId.toString());

  res.json({
    avatar: user.avatar,
    message: 'Avatar updated successfully'
  });
});

export const followUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (id === req.userId.toString()) {
    throw new AppError('Cannot follow yourself', 400);
  }

  const userToFollow = await User.findById(id);
  if (!userToFollow) {
    throw new AppError('User not found', 404);
  }

  const currentUser = await User.findById(req.userId);

  // Check if already following
  if (currentUser.following.includes(id)) {
    throw new AppError('Already following this user', 400);
  }

  // Update both users
  currentUser.following.push(id);
  userToFollow.followers.push(req.userId);

  await Promise.all([currentUser.save(), userToFollow.save()]);

  // Create notification
  const notification = await Notification.createNotification({
    recipient: id,
    sender: req.userId,
    type: 'follow'
  });

  // Emit socket event
  const io = req.app.get('io');
  io.to(`user:${id}`).emit('notification', notification);

  // Invalidate caches for both users
  await Promise.all([
    invalidateUserCache(req.userId.toString()),
    invalidateUserCache(id)
  ]);

  res.json({ message: 'User followed successfully' });
});

export const unfollowUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (id === req.userId.toString()) {
    throw new AppError('Cannot unfollow yourself', 400);
  }

  const userToUnfollow = await User.findById(id);
  if (!userToUnfollow) {
    throw new AppError('User not found', 404);
  }

  const currentUser = await User.findById(req.userId);

  // Check if following
  if (!currentUser.following.includes(id)) {
    throw new AppError('Not following this user', 400);
  }

  // Update both users
  currentUser.following = currentUser.following.filter(
    userId => userId.toString() !== id
  );
  userToUnfollow.followers = userToUnfollow.followers.filter(
    userId => userId.toString() !== req.userId.toString()
  );

  await Promise.all([currentUser.save(), userToUnfollow.save()]);

  // Invalidate caches for both users
  await Promise.all([
    invalidateUserCache(req.userId.toString()),
    invalidateUserCache(id)
  ]);

  res.json({ message: 'User unfollowed successfully' });
});

export const getFollowers = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Try cache for follower IDs
  let followerIds = await getCachedFollowers(id);

  if (!followerIds) {
    followerIds = user.followers.map(f => f.toString());
    await cacheFollowers(id, followerIds);
  }

  // Paginate and populate
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedIds = followerIds.slice(startIndex, endIndex);

  const followers = await User.find({ _id: { $in: paginatedIds } })
    .select('username name avatar bio')
    .lean();

  res.json({
    followers,
    pagination: {
      page,
      limit,
      total: followerIds.length,
      pages: Math.ceil(followerIds.length / limit)
    }
  });
});

export const getFollowing = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Try cache for following IDs
  let followingIds = await getCachedFollowing(id);

  if (!followingIds) {
    followingIds = user.following.map(f => f.toString());
    await cacheFollowing(id, followingIds);
  }

  // Paginate and populate
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedIds = followingIds.slice(startIndex, endIndex);

  const following = await User.find({ _id: { $in: paginatedIds } })
    .select('username name avatar bio')
    .lean();

  res.json({
    following,
    pagination: {
      page,
      limit,
      total: followingIds.length,
      pages: Math.ceil(followingIds.length / limit)
    }
  });
});

export const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  if (!q || q.length < 2) {
    throw new AppError('Search query must be at least 2 characters', 400);
  }

  const skip = (page - 1) * limit;

  const users = await User.find({
    $or: [
      { username: { $regex: q, $options: 'i' } },
      { name: { $regex: q, $options: 'i' } },
      { skills: { $regex: q, $options: 'i' } }
    ]
  })
    .select('username name avatar bio skills')
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await User.countDocuments({
    $or: [
      { username: { $regex: q, $options: 'i' } },
      { name: { $regex: q, $options: 'i' } },
      { skills: { $regex: q, $options: 'i' } }
    ]
  });

  res.json({
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

export const getSuggestedUsers = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.userId);

  const suggestions = await User.aggregate([
    {
      $match: {
        _id: { 
          $nin: [...currentUser.following, currentUser._id] // Exclude self & already followed
        }
      }
    },
    { 
      $sample: { size: 6 } // Randomly pick 6
    }, 
    {
      $project: { // Only return necessary fields
        name: 1,
        username: 1,
        avatar: 1,
        bio: 1,
        skills: 1
      }
    }
  ]);

  res.json({ suggestions });
});

export default {
  getUserProfile,
  updateProfile,
  updateAvatar,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  searchUsers,
  getSuggestedUsers
};