/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
const up = (pgm) => {
  pgm.createType('event_status', ['DRAFT', 'OPEN', 'CLOSED', 'COMPLETED', 'CANCELLED']);

  pgm.createTable('events', {
    id: 'id',
    title: { type: 'text', notNull: true },
    description: { type: 'text', notNull: false },
    location: { type: 'text', notNull: true },
    start_time: { type: 'timestamptz', notNull: true },
    end_time: { type: 'timestamptz', notNull: true },
    required_volunteers: { type: 'integer', notNull: true },
    status: { type: 'event_status', notNull: true, default: 'DRAFT' },
    coordinator_id: {
      type: 'integer',
      notNull: false,
      references: 'users',
      onDelete: 'SET NULL',
    },
    created_by: {
      type: 'integer',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.addConstraint('events', 'events_required_volunteers_positive', {
    check: 'required_volunteers > 0',
  });
  pgm.addConstraint('events', 'events_end_after_start', {
    check: 'end_time > start_time',
  });

  pgm.createIndex('events', 'status');
  pgm.createIndex('events', 'coordinator_id');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
const down = (pgm) => {
  pgm.dropTable('events');
  pgm.dropType('event_status');
};

module.exports = { up, down };
