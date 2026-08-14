const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userModel = require('../models/user.model');
const coordinatorInviteModel = require('../models/coordinatorInvite.model');
const refreshTokenModel = require('../models/refreshToken.model');
const { generateOpaqueToken, hashToken } = require('../utils/token');
const { ApiError } = require('../middleware/error.middleware');

const SALT_ROUNDS = 10;
const REFRESH_TOKEN_EXPIRES_DAYS = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30);

function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
}

async function issueRefreshToken(userId) {
  const refreshToken = generateOpaqueToken();
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

  await refreshTokenModel.create({ userId, tokenHash, expiresAt });

  return refreshToken;
}

async function issueTokenPair(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = await issueRefreshToken(user.id);
  return { accessToken, refreshToken };
}

async function signupVolunteer({ name, email, password }) {
  if (!name || !email || !password) {
    throw new ApiError(400, 'name, email and password are required');
  }
  if (password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters');
  }

  const existing = await userModel.findByEmail(email);
  if (existing) {
    throw new ApiError(409, 'Email is already registered');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await userModel.create({ name, email, passwordHash, role: 'VOLUNTEER' });
}

async function coordinatorSignup({ inviteCode, name, email, password }) {
  if (!inviteCode || !name || !email || !password) {
    throw new ApiError(400, 'inviteCode, name, email and password are required');
  }
  if (password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters');
  }

  const tokenHash = hashToken(inviteCode);
  const invite = await coordinatorInviteModel.findByTokenHash(tokenHash);

  if (!invite) {
    throw new ApiError(400, 'Invalid invitation');
  }
  if (invite.used_at) {
    throw new ApiError(400, 'Invitation has already been used');
  }
  if (new Date(invite.expires_at) < new Date()) {
    throw new ApiError(400, 'Invitation has expired');
  }
  if (invite.email.toLowerCase() !== email.toLowerCase()) {
    throw new ApiError(400, 'Email does not match the invited email');
  }

  const existing = await userModel.findByEmail(email);
  if (existing) {
    throw new ApiError(409, 'Email is already registered');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await userModel.create({ name, email, passwordHash, role: 'COORDINATOR' });
  await coordinatorInviteModel.markUsed(invite.id);
}

async function login({ email, password }) {
  if (!email || !password) {
    throw new ApiError(400, 'email and password are required');
  }

  const user = await userModel.findByEmail(email);
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const { accessToken, refreshToken } = await issueTokenPair(user);

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, role: user.role },
  };
}

async function refresh({ refreshToken }) {
  if (!refreshToken) {
    throw new ApiError(400, 'refreshToken is required');
  }

  const tokenHash = hashToken(refreshToken);
  const stored = await refreshTokenModel.findByTokenHash(tokenHash);

  if (!stored) {
    throw new ApiError(401, 'Invalid refresh token');
  }
  if (stored.revoked_at) {
    // Token reuse after revocation/rotation: treat as compromised and
    // revoke every outstanding token for this user.
    await refreshTokenModel.revokeAllForUser(stored.user_id);
    throw new ApiError(401, 'Refresh token has been revoked');
  }
  if (new Date(stored.expires_at) < new Date()) {
    throw new ApiError(401, 'Refresh token has expired');
  }

  const user = await userModel.findById(stored.user_id);
  if (!user) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  // Rotate: the presented token is single-use.
  await refreshTokenModel.revoke(stored.id);
  const { accessToken, refreshToken: newRefreshToken } = await issueTokenPair(user);

  return { accessToken, refreshToken: newRefreshToken };
}

async function logout({ refreshToken }) {
  if (!refreshToken) {
    throw new ApiError(400, 'refreshToken is required');
  }

  const tokenHash = hashToken(refreshToken);
  const stored = await refreshTokenModel.findByTokenHash(tokenHash);

  if (stored && !stored.revoked_at) {
    await refreshTokenModel.revoke(stored.id);
  }
}

module.exports = { signupVolunteer, coordinatorSignup, login, refresh, logout };
