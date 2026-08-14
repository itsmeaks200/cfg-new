const { Router } = require('express');

const eventController = require('../controllers/event.controller');
const registrationController = require('../controllers/registration.controller');
const { stubAuthenticate, stubRequireRole } = require('../middleware/devStubAuth.middleware');

const router = Router();

router.get('/', eventController.list);
router.get('/:id', eventController.getOne);

router.post('/', stubAuthenticate, stubRequireRole('ADMIN'), eventController.create);
router.patch('/:id', stubAuthenticate, stubRequireRole('ADMIN', 'COORDINATOR'), eventController.update);
router.patch('/:id/coordinator', stubAuthenticate, stubRequireRole('ADMIN'), eventController.assignCoordinator);

router.post('/:id/open-registration', stubAuthenticate, stubRequireRole('ADMIN', 'COORDINATOR'), eventController.openRegistration);
router.post('/:id/close-registration', stubAuthenticate, stubRequireRole('ADMIN', 'COORDINATOR'), eventController.closeRegistration);

router.get('/:id/registrations', stubAuthenticate, stubRequireRole('ADMIN', 'COORDINATOR'), eventController.listRegistrations);
router.get('/:id/analytics', stubAuthenticate, stubRequireRole('ADMIN', 'COORDINATOR'), eventController.analytics);

router.post('/:id/register', stubAuthenticate, stubRequireRole('VOLUNTEER'), registrationController.registerForEvent);
router.delete('/:id/register', stubAuthenticate, stubRequireRole('VOLUNTEER'), registrationController.unregisterFromEvent);

module.exports = router;
