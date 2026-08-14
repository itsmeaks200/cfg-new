const { Router } = require('express');

const authController = require('../controllers/auth.controller');
const authenticate = require('../middleware/auth.middleware');

const router = Router();

router.post('/signup', authController.signup);
router.post('/coordinator-signup', authController.coordinatorSignup);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);

module.exports = router;
