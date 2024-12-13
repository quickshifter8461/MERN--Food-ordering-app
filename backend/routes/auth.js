const express = require('express');
const { signup, login, getProfile, changePassword, updateProfile, deleteProfile, logout } = require('../controllers/authController');
const { addAddress, getAddresses,getAddressById,updateAddress,deleteAddress } = require('../controllers/addressController')
const authMiddleware = require('../middlewares/authMiddleware');
const {upload} = require('../middlewares/multer');
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/add-address',authMiddleware, addAddress)

router.get('/profile', authMiddleware, getProfile);
router.get('/addresses', authMiddleware, getAddresses)
router.get('/address/:addressId',authMiddleware,getAddressById)

router.put('/change-password', authMiddleware, changePassword);
router.put('/update-profile', authMiddleware,upload.single("profilePic"),updateProfile);
router.put('/address/:addressId/update',authMiddleware,updateAddress)
router.put('/logout',authMiddleware,logout);

router.delete('/delete-profile', authMiddleware, deleteProfile);
router.delete('/address/:addressId', authMiddleware, deleteAddress)
module.exports = router;
