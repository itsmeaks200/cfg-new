const { Router } = require('express');

const eventController = require('../controllers/event.controller');
const registrationController = require('../controllers/registration.controller');
const authenticate = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

const router = Router();

router.get('/', eventController.list);
router.get('/:id', eventController.getOne);

router.post('/', authenticate, requireRole('ADMIN'), eventController.create);
router.patch('/:id', authenticate, requireRole('ADMIN', 'COORDINATOR'), eventController.update);
router.patch('/:id/coordinator', authenticate, requireRole('ADMIN'), eventController.assignCoordinator);

router.post('/:id/open-registration', authenticate, requireRole('ADMIN', 'COORDINATOR'), eventController.openRegistration);
router.post('/:id/close-registration', authenticate, requireRole('ADMIN', 'COORDINATOR'), eventController.closeRegistration);

router.get('/:id/registrations', authenticate, requireRole('ADMIN', 'COORDINATOR'), eventController.listRegistrations);
router.get('/:id/analytics', authenticate, requireRole('ADMIN', 'COORDINATOR'), eventController.analytics);

router.post('/:id/register', authenticate, requireRole('VOLUNTEER'), registrationController.registerForEvent);
router.delete('/:id/register', authenticate, requireRole('VOLUNTEER'), registrationController.unregisterFromEvent);

module.exports = router;
