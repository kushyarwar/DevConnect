import User from '../models/User.js';
import { generateTokenPair, verifyRefreshToken } from '../config/jwt.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { cacheSession, invalidateSession } from '../utils/cache.js';

export const register = asyncHandler(async (req, res) => {
  const { username, email, password, name } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    const field = existingUser.email === email ? 'Email' : 'Username';
    throw new AppError(`${field} already exists`, 400);
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password,
    name: name || username
  });

  // Generate tokens
  const tokens = generateTokenPair(user._id);

  // Save refresh token
  user.refreshToken = tokens.refreshToken;
  await user.save();

  // Cache session
  await cacheSession(user._id.toString(), { userId: user._id, username: user.username });

  res.status(201).json({
    user: user.toPublicProfile(),
    ...tokens
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and verify password
  const user = await User.findByCredentials(email, password);

  // Generate tokens
  const tokens = generateTokenPair(user._id);

  // Save refresh token
  user.refreshToken = tokens.refreshToken;
  await user.save();

  // Cache session
  await cacheSession(user._id.toString(), { userId: user._id, username: user.username });

  res.json({
    user: user.toPublicProfile(),
    ...tokens
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token required', 400);
  }

  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    throw new AppError('Invalid refresh token', 401);
  }

  // Find user with matching refresh token
  const user = await User.findById(decoded.userId).select('+refreshToken');
  if (!user || user.refreshToken !== refreshToken) {
    throw new AppError('Invalid refresh token', 401);
  }

  // Generate new tokens
  const tokens = generateTokenPair(user._id);

  // Update refresh token
  user.refreshToken = tokens.refreshToken;
  await user.save();

  res.json(tokens);
});

export const logout = asyncHandler(async (req, res) => {
  // Clear refresh token
  req.user.refreshToken = undefined;
  await req.user.save();

  // Invalidate session cache
  await invalidateSession(req.userId.toString());

  res.json({ message: 'Logged out successfully' });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId)
    .populate('followers', 'username name avatar')
    .populate('following', 'username name avatar');

  res.json({ user: user.toPublicProfile() });
});

export default { register, login, refreshToken, logout, getMe };
