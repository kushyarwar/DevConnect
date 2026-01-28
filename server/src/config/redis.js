import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient = null;

// Default Cache TTLs (Time To Live)
export const CACHE_TTL = {
  USER_PROFILE: 3600, // 1 hour
  USER_FOLLOWERS: 3600,
  USER_FOLLOWING: 3600,
  TRENDING_POSTS: 300, // 5 minutes
  SESSION: 86400 // 24 hours
};

// Cache Key Generators
export const cacheKeys = {
  user: (id) => `user:${id}`,
  userFollowers: (id) => `user:${id}:followers`,
  userFollowing: (id) => `user:${id}:following`,
  trendingPosts: () => 'posts:trending',
  trendingPostsData: () => 'posts:trending:data',
  session: (id) => `session:${id}`
};

export const connectRedis = async () => {
  if (redisClient) return redisClient;

  // Use the Cloud URL or fallback to null (to prevent crashes)
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.warn('⚠️ Redis URL not found in .env. Caching will be disabled.');
    return null;
  }

  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 1, 
      connectTimeout: 5000, // Give up after 5 seconds
      retryStrategy: (times) => {
        // If it fails more than 3 times, stop trying for a while
        if (times > 3) {
          console.warn('⚠️ Redis connection retries exhausted. Disabling cache temporarily.');
          return null; 
        }
        return Math.min(times * 50, 2000);
      }
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    redisClient.on('error', (err) => {
      // Silence the "ECONNREFUSED" spam, just log once
      if (err.message.includes('ECONNREFUSED')) {
        // console.warn('⚠️ Redis connection failed (is it running?)');
      } else {
        console.error('❌ Redis Client Error:', err.message);
      }
    });

    return redisClient;

  } catch (error) {
    console.error('❌ Failed to initialize Redis:', error.message);
    return null;
  }
};

// Initialize connection immediately (Optional, but safe)
connectRedis();

// Export a safe getter
export const getRedisClient = () => {
  // If the client isn't ready or failed, return null so the app continues without cache
  if (!redisClient || redisClient.status !== 'ready') {
    return null;
  }
  return redisClient;
};

export default redisClient;