const pool = require('../config/db');

async function findActiveByEventAndVolunteer(client, eventId, volunteerId) {
  const { rows } = await client.query(
    `SELECT * FROM registrations
     WHERE event_id = $1 AND volunteer_id = $2 AND status = 'REGISTERED'`,
    [eventId, volunteerId]
  );
  return rows[0] || null;
}

async function countActiveByEvent(client, eventId) {
  const { rows } = await client.query(
    `SELECT COUNT(*)::int AS count FROM registrations
     WHERE event_id = $1 AND status = 'REGISTERED'`,
    [eventId]
  );
  return rows[0].count;
}

async function create(client, { eventId, volunteerId }) {
  const { rows } = await client.query(
    `INSERT INTO registrations (event_id, volunteer_id)
     VALUES ($1, $2)
     RETURNING *`,
    [eventId, volunteerId]
  );
  return rows[0];
}

async function cancel(id) {
  const { rows } = await pool.query(
    `UPDATE registrations
     SET status = 'CANCELLED', cancelled_at = now()
     WHERE id = $1 AND status = 'REGISTERED'
     RETURNING *`,
    [id]
  );
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM registrations WHERE id = $1', [id]);
  return rows[0] || null;
}

async function findByVolunteer(volunteerId) {
  const { rows } = await pool.query(
    `SELECT r.id AS registration_id, r.event_id, e.title AS event_title, r.status
     FROM registrations r
     JOIN events e ON e.id = r.event_id
     WHERE r.volunteer_id = $1
     ORDER BY r.registered_at DESC`,
    [volunteerId]
  );
  return rows;
}

async function findByEvent(eventId) {
  const { rows } = await pool.query(
    `SELECT r.id AS registration_id, r.volunteer_id, u.name AS volunteer_name, r.status
     FROM registrations r
     JOIN users u ON u.id = r.volunteer_id
     WHERE r.event_id = $1
     ORDER BY r.registered_at`,
    [eventId]
  );
  return rows;
}

module.exports = {
  findActiveByEventAndVolunteer,
  countActiveByEvent,
  create,
  cancel,
  findById,
  findByVolunteer,
  findByEvent,
};
