const { Router } = require('express');

const analyticsController = require('../controllers/analytics.controller');
const authenticate = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

const router = Router();

router.get('/', authenticate, requireRole('ADMIN'), analyticsController.adminAnalytics);

module.exports = router;
