/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
const up = (pgm) => {
  pgm.createTable('refresh_tokens', {
    id: 'id',
    user_id: {
      type: 'integer',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    token_hash: { type: 'text', notNull: true, unique: true },
    expires_at: { type: 'timestamptz', notNull: true },
    revoked_at: { type: 'timestamptz', notNull: false },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('refresh_tokens', 'user_id');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
const down = (pgm) => {
  pgm.dropTable('refresh_tokens');
};

module.exports = { up, down };
