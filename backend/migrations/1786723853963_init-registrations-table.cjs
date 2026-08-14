/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
const up = (pgm) => {
  pgm.createType('registration_status', ['REGISTERED', 'CANCELLED']);

  pgm.createTable('registrations', {
    id: 'id',
    event_id: {
      type: 'integer',
      notNull: true,
      references: 'events',
      onDelete: 'CASCADE',
    },
    volunteer_id: {
      type: 'integer',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    status: { type: 'registration_status', notNull: true, default: 'REGISTERED' },
    registered_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    cancelled_at: { type: 'timestamptz', notNull: false },
  });

  // Only one active (REGISTERED) registration per volunteer per event.
  // Cancelled registrations are excluded so a volunteer can re-register later.
  pgm.createIndex('registrations', ['event_id', 'volunteer_id'], {
    unique: true,
    where: "status = 'REGISTERED'",
    name: 'registrations_active_unique',
  });

  pgm.createIndex('registrations', 'event_id');
  pgm.createIndex('registrations', 'volunteer_id');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
const down = (pgm) => {
  pgm.dropTable('registrations');
  pgm.dropType('registration_status');
};

module.exports = { up, down };
