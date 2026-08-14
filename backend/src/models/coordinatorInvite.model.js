const pool = require('../config/db');

async function create({ email, tokenHash, expiresAt, createdBy }) {
  const { rows } = await pool.query(
    `INSERT INTO coordinator_invites (email, token_hash, expires_at, created_by)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [email, tokenHash, expiresAt, createdBy]
  );
  return rows[0];
}

async function findByTokenHash(tokenHash) {
  const { rows } = await pool.query(
    'SELECT * FROM coordinator_invites WHERE token_hash = $1',
    [tokenHash]
  );
  return rows[0] || null;
}

async function markUsed(id) {
  const { rows } = await pool.query(
    `UPDATE coordinator_invites
     SET used_at = now()
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  return rows[0];
}

module.exports = { create, findByTokenHash, markUsed };
