const pool = require('../config/db');

async function create({ userId, tokenHash, expiresAt }) {
  const { rows } = await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, tokenHash, expiresAt]
  );
  return rows[0];
}

async function findByTokenHash(tokenHash) {
  const { rows } = await pool.query(
    'SELECT * FROM refresh_tokens WHERE token_hash = $1',
    [tokenHash]
  );
  return rows[0] || null;
}

async function revoke(id) {
  const { rows } = await pool.query(
    `UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1 RETURNING *`,
    [id]
  );
  return rows[0] || null;
}

async function revokeAllForUser(userId) {
  await pool.query(
    `UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL`,
    [userId]
  );
}

module.exports = { create, findByTokenHash, revoke, revokeAllForUser };
