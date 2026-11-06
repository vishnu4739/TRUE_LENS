const express = require('express');
const router = express.Router();
const { register, login, getProfile, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimit');

// POST /api/auth/register
router.post('/register', authLimiter, registerValidation, register);

// POST /api/auth/login
router.post('/login', authLimiter, loginValidation, login);

// GET /api/auth/profile (protected)
router.get('/profile', protect, getProfile);

// POST /api/auth/logout (protected)
router.post('/logout', protect, logout);

module.exports = router;
