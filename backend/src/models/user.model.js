// Minimal stand-in for Dev A's user.model.js — only what event.service.js
// needs to validate a coordinator assignment. Dev A owns the full version
// (findByEmail, create, findByRole, etc.) which will replace this on merge.
const pool = require('../config/db');

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] || null;
}

module.exports = { findById };
