const express = require('express');
const { signup, login, getProfile, changePassword, updateProfile, deleteProfile } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.put('/change-password', authMiddleware, changePassword);
router.get('/profile', authMiddleware, getProfile);
router.put('/update-profile', authMiddleware,updateProfile);
router.delete('/delete-profile', authMiddleware, deleteProfile);

module.exports = router;
