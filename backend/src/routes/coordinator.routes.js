const { Router } = require('express');

const coordinatorController = require('../controllers/coordinator.controller');
const authenticate = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

const router = Router();

router.post('/invite', authenticate, requireRole('ADMIN'), coordinatorController.invite);
router.get('/', authenticate, requireRole('ADMIN'), coordinatorController.list);

module.exports = router;
