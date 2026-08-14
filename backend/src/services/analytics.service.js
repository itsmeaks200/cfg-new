const pool = require('../config/db');

async function adminAnalytics() {
  const { rows } = await pool.query(`
    SELECT
      (SELECT COUNT(*)::int FROM events) AS total_events,
      (SELECT COUNT(*)::int FROM events WHERE status = 'OPEN') AS open_events,
      (SELECT COUNT(*)::int FROM events WHERE status = 'COMPLETED') AS completed_events,
      (SELECT COUNT(*)::int FROM users WHERE role = 'VOLUNTEER') AS total_volunteers,
      (SELECT COUNT(*)::int FROM registrations) AS total_registrations,
      (SELECT COUNT(*)::int FROM attendance WHERE status = 'PRESENT') AS attendance_count
  `);

  return rows[0];
}

module.exports = { adminAnalytics };
