require('dotenv').config();

const createApp = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 5000;

async function start() {
  await pool.query('SELECT 1');

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
