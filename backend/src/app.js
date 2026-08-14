const express = require('express');

const eventRoutes = require('./routes/event.routes');
const registrationRoutes = require('./routes/registration.routes');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

function createApp() {
  const app = express();

  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api/events', eventRoutes);
  app.use('/api', registrationRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
