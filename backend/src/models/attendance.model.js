const pool = require('../config/db');

async function markAttendance(registrationId, status) {
  const { rows } = await pool.query(
    `INSERT INTO attendance (registration_id, status)
     VALUES ($1, $2)
     ON CONFLICT (registration_id)
     DO UPDATE SET status = EXCLUDED.status, marked_at = now()
     RETURNING *`,
    [registrationId, status]
  );
  return rows[0];
}

async function findByVolunteer(volunteerId) {
  const { rows } = await pool.query(
    `SELECT a.id, e.id AS event_id, e.title AS event_title, a.status, a.marked_at
     FROM attendance a
     JOIN registrations r ON r.id = a.registration_id
     JOIN events e ON e.id = r.event_id
     WHERE r.volunteer_id = $1
     ORDER BY a.marked_at DESC`,
    [volunteerId]
  );
  return rows;
}

async function countByEventAndStatus(eventId, status) {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM attendance a
     JOIN registrations r ON r.id = a.registration_id
     WHERE r.event_id = $1 AND a.status = $2`,
    [eventId, status]
  );
  return rows[0].count;
}

module.exports = { markAttendance, findByVolunteer, countByEventAndStatus };
