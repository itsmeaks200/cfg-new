const userModel = require('../models/user.model');
const coordinatorInviteModel = require('../models/coordinatorInvite.model');
const { generateInviteToken, hashToken } = require('../utils/token');
const { ApiError } = require('../middleware/error.middleware');

const INVITE_EXPIRES_HOURS = Number(process.env.COORDINATOR_INVITE_EXPIRES_HOURS || 72);

async function createInvite({ email, createdBy }) {
  if (!email) {
    throw new ApiError(400, 'email is required');
  }

  const existingUser = await userModel.findByEmail(email);
  if (existingUser) {
    throw new ApiError(409, 'A user with this email already exists');
  }

  const inviteCode = generateInviteToken();
  const tokenHash = hashToken(inviteCode);
  const expiresAt = new Date(Date.now() + INVITE_EXPIRES_HOURS * 60 * 60 * 1000);

  await coordinatorInviteModel.create({ email, tokenHash, expiresAt, createdBy });

  return { inviteCode, expiresAt };
}

async function listCoordinators() {
  return userModel.findByRole('COORDINATOR');
}

module.exports = { createInvite, listCoordinators };
