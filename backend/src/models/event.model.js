const pool = require('../config/db');

async function create({ title, description, location, startTime, endTime, requiredVolunteers, createdBy, coordinatorId }) {
  const { rows } = await pool.query(
    `INSERT INTO events (title, description, location, start_time, end_time, required_volunteers, created_by, coordinator_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [title, description, location, startTime, endTime, requiredVolunteers, createdBy, coordinatorId || null]
  );
  return rows[0];
}

const WITH_REGISTERED_COUNT = `
  SELECT e.*,
         COALESCE(r.registered_count, 0)::int AS registered_count
  FROM events e
  LEFT JOIN (
    SELECT event_id, COUNT(*) AS registered_count
    FROM registrations
    WHERE status = 'REGISTERED'
    GROUP BY event_id
  ) r ON r.event_id = e.id
`;

async function findById(id) {
  const { rows } = await pool.query(`${WITH_REGISTERED_COUNT} WHERE e.id = $1`, [id]);
  return rows[0] || null;
}

async function findAll({ status } = {}) {
  if (status) {
    const { rows } = await pool.query(`${WITH_REGISTERED_COUNT} WHERE e.status = $1 ORDER BY e.start_time`, [status]);
    return rows;
  }
  const { rows } = await pool.query(`${WITH_REGISTERED_COUNT} ORDER BY e.start_time`);
  return rows;
}

async function update(id, fields) {
  const allowed = ['title', 'description', 'location', 'start_time', 'end_time', 'required_volunteers'];
  const keys = Object.keys(fields).filter((key) => allowed.includes(key));

  if (keys.length === 0) {
    return findById(id);
  }

  const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
  const values = keys.map((key) => fields[key]);

  const { rows } = await pool.query(
    `UPDATE events SET ${setClause}, updated_at = now() WHERE id = $1 RETURNING *`,
    [id, ...values]
  );
  return rows[0] || null;
}

async function assignCoordinator(id, coordinatorId) {
  const { rows } = await pool.query(
    `UPDATE events SET coordinator_id = $2, updated_at = now() WHERE id = $1 RETURNING *`,
    [id, coordinatorId]
  );
  return rows[0] || null;
}

async function updateStatus(id, status) {
  const { rows } = await pool.query(
    `UPDATE events SET status = $2, updated_at = now() WHERE id = $1 RETURNING *`,
    [id, status]
  );
  return rows[0] || null;
}

async function lockForUpdate(client, id) {
  const { rows } = await client.query('SELECT * FROM events WHERE id = $1 FOR UPDATE', [id]);
  return rows[0] || null;
}

module.exports = { create, findById, findAll, update, assignCoordinator, updateStatus, lockForUpdate };
