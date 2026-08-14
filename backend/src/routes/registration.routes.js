const { Router } = require('express');

const registrationController = require('../controllers/registration.controller');
const { stubAuthenticate, stubRequireRole } = require('../middleware/devStubAuth.middleware');

const router = Router();

router.get('/me/registrations', stubAuthenticate, stubRequireRole('VOLUNTEER'), registrationController.myRegistrations);
router.get('/me/attendance', stubAuthenticate, stubRequireRole('VOLUNTEER'), registrationController.myAttendance);
router.post(
  '/registrations/:id/attendance',
  stubAuthenticate,
  stubRequireRole('ADMIN', 'COORDINATOR'),
  registrationController.markAttendance
);

module.exports = router;
