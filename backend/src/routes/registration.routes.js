const { Router } = require('express');

const registrationController = require('../controllers/registration.controller');
const authenticate = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

const router = Router();

router.get('/me/registrations', authenticate, requireRole('VOLUNTEER'), registrationController.myRegistrations);
router.get('/me/attendance', authenticate, requireRole('VOLUNTEER'), registrationController.myAttendance);
router.post(
  '/registrations/:id/attendance',
  authenticate,
  requireRole('ADMIN', 'COORDINATOR'),
  registrationController.markAttendance
);

module.exports = router;
