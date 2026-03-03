const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.get('/me', isAuthenticated, authController.getCurrentAdmin);

module.exports = router;