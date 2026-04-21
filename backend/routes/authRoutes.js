const express = require('express');
const { register, login, verify2FA, forgotPassword, resetPassword, getProfile, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-2fa', verify2FA);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

module.exports = router;
