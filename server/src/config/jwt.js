import jwt from 'jsonwebtoken';
// This records the exact second the server started.
const SERVER_START_TIME = Math.floor(Date.now() / 1000);

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your-access-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRES_IN
  });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN
  });
};

export const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);

    if (decoded.iat < SERVER_START_TIME) {
        console.log('⚠️ Access Token invalidated due to server restart');
        return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);

    if (decoded.iat < SERVER_START_TIME) {
        console.log('⚠️ Refresh Token invalidated due to server restart');
        return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
};

export const generateTokenPair = (userId) => {
  return {
    accessToken: generateAccessToken(userId),
    refreshToken: generateRefreshToken(userId)
  };
};