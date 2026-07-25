const express = require('express');
const router = express.Router();

const { login, me, changePassword } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/login', login);
router.get('/me', protect, me);
router.put('/change-password', protect, changePassword);

module.exports = router;
