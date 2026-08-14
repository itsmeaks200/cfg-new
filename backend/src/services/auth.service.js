const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userModel = require('../models/user.model');
const coordinatorInviteModel = require('../models/coordinatorInvite.model');
const { hashToken } = require('../utils/token');
const { ApiError } = require('../middleware/error.middleware');

const SALT_ROUNDS = 10;

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

  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );

  return {
    accessToken,
    user: { id: user.id, name: user.name, role: user.role },
  };
}

module.exports = { signupVolunteer, coordinatorSignup, login };
