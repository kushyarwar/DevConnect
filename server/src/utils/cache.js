import { getRedisClient, CACHE_TTL, cacheKeys } from '../config/redis.js';

/**
 * Get data from cache
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} - Cached data or null
 */
export const getCache = async (key) => {
  const redis = getRedisClient();
  if (!redis) return null;

  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

/**
 * Set data in cache
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<boolean>} - Success status
 */
export const setCache = async (key, data, ttl) => {
  const redis = getRedisClient();
  if (!redis) return false;

  try {
    await redis.setex(key, ttl, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
};

/**
 * Delete cache by key
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} - Success status
 */
export const deleteCache = async (key) => {
  const redis = getRedisClient();
  if (!redis) return false;

  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error('Cache delete error:', error);
    return false;
  }
};

/**
 * Delete multiple cache keys by pattern
 * @param {string} pattern - Key pattern (e.g., 'user:123:*')
 * @returns {Promise<boolean>} - Success status
 */
export const deleteCachePattern = async (pattern) => {
  const redis = getRedisClient();
  if (!redis) return false;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    return true;
  } catch (error) {
    console.error('Cache pattern delete error:', error);
    return false;
  }
};

/**
 * Get cached user profile
 * @param {string} userId - User ID
 * @returns {Promise<object|null>}
 */
export const getCachedUser = async (userId) => {
  return getCache(cacheKeys.user(userId));
};

/**
 * Cache user profile
 * @param {string} userId - User ID
 * @param {object} userData - User data to cache
 * @returns {Promise<boolean>}
 */
export const cacheUser = async (userId, userData) => {
  return setCache(cacheKeys.user(userId), userData, CACHE_TTL.USER_PROFILE);
};

/**
 * Invalidate user cache
 * @param {string} userId - User ID
 * @returns {Promise<boolean>}
 */
export const invalidateUserCache = async (userId) => {
  return deleteCachePattern(`user:${userId}*`);
};

/**
 * Get cached user followers
 * @param {string} userId - User ID
 * @returns {Promise<string[]|null>}
 */
export const getCachedFollowers = async (userId) => {
  return getCache(cacheKeys.userFollowers(userId));
};

/**
 * Cache user followers
 * @param {string} userId - User ID
 * @param {string[]} followerIds - Array of follower IDs
 * @returns {Promise<boolean>}
 */
export const cacheFollowers = async (userId, followerIds) => {
  return setCache(cacheKeys.userFollowers(userId), followerIds, CACHE_TTL.USER_FOLLOWERS);
};

/**
 * Get cached user following
 * @param {string} userId - User ID
 * @returns {Promise<string[]|null>}
 */
export const getCachedFollowing = async (userId) => {
  return getCache(cacheKeys.userFollowing(userId));
};

/**
 * Cache user following
 * @param {string} userId - User ID
 * @param {string[]} followingIds - Array of following IDs
 * @returns {Promise<boolean>}
 */
export const cacheFollowing = async (userId, followingIds) => {
  return setCache(cacheKeys.userFollowing(userId), followingIds, CACHE_TTL.USER_FOLLOWING);
};

/**
 * Get cached trending posts
 * @returns {Promise<object[]|null>}
 */
export const getCachedTrendingPosts = async () => {
  return getCache(cacheKeys.trendingPostsData());
};

/**
 * Cache trending posts
 * @param {object[]} posts - Array of trending posts
 * @returns {Promise<boolean>}
 */
export const cacheTrendingPosts = async (posts) => {
  return setCache(cacheKeys.trendingPostsData(), posts, CACHE_TTL.TRENDING_POSTS);
};

/**
 * Invalidate trending posts cache
 * @returns {Promise<boolean>}
 */
export const invalidateTrendingCache = async () => {
  const redis = getRedisClient();
  if (!redis) return false;

  try {
    await redis.del(cacheKeys.trendingPosts(), cacheKeys.trendingPostsData());
    return true;
  } catch (error) {
    console.error('Trending cache invalidation error:', error);
    return false;
  }
};

/**
 * Cache user session
 * @param {string} userId - User ID
 * @param {object} sessionData - Session data
 * @returns {Promise<boolean>}
 */
export const cacheSession = async (userId, sessionData) => {
  return setCache(cacheKeys.session(userId), sessionData, CACHE_TTL.SESSION);
};

/**
 * Get cached session
 * @param {string} userId - User ID
 * @returns {Promise<object|null>}
 */
export const getCachedSession = async (userId) => {
  return getCache(cacheKeys.session(userId));
};

/**
 * Invalidate session cache
 * @param {string} userId - User ID
 * @returns {Promise<boolean>}
 */
export const invalidateSession = async (userId) => {
  return deleteCache(cacheKeys.session(userId));
};

export default {
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
  getCachedUser,
  cacheUser,
  invalidateUserCache,
  getCachedFollowers,
  cacheFollowers,
  getCachedFollowing,
  cacheFollowing,
  getCachedTrendingPosts,
  cacheTrendingPosts,
  invalidateTrendingCache,
  cacheSession,
  getCachedSession,
  invalidateSession
};
