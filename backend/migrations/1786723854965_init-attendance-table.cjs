/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
const up = (pgm) => {
  pgm.createType('attendance_status', ['PRESENT', 'ABSENT']);

  pgm.createTable('attendance', {
    id: 'id',
    registration_id: {
      type: 'integer',
      notNull: true,
      unique: true,
      references: 'registrations',
      onDelete: 'CASCADE',
    },
    status: { type: 'attendance_status', notNull: true },
    marked_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
const down = (pgm) => {
  pgm.dropTable('attendance');
  pgm.dropType('attendance_status');
};

module.exports = { up, down };
