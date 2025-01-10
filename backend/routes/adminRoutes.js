const express = require('express');
const { getAllUsers, deleteUser, updateUserStatus } = require('../controllers/userController');

const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

router.get('/get-all-users',roleMiddleware(['admin']),  getAllUsers)
router.delete('/delete-user/:id', roleMiddleware(['admin']),deleteUser)
router.patch('/update-user/:id', roleMiddleware(['admin']), updateUserStatus)
module.exports = router;