const express = require('express');
const cors = require('cors');

const eventRoutes = require('./routes/event.routes');
const registrationRoutes = require('./routes/registration.routes');
const authRoutes = require('./routes/auth.routes');
const coordinatorRoutes = require('./routes/coordinator.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/coordinators', coordinatorRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api', registrationRoutes);
  app.use('/api/analytics', analyticsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
