const crypto = require('crypto');

function generateOpaqueToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}

function generateInviteToken() {
  return generateOpaqueToken(24);
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = { generateOpaqueToken, generateInviteToken, hashToken };
