const express = require('express');
const { createRestaurant, getRestaurants, getRestaurantById, updateRestaurant, deleteRestaurant } = require('../controllers/restaurantController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// Only 'admin' and 'seller' can create a restaurant
router.post('/', authMiddleware, roleMiddleware(['admin', 'restaurant manager']), createRestaurant);

// Anyone can view restaurants
router.get('/', getRestaurants);

// Specific routes for admin and restaurant managers
router.get('/:restaurantId', getRestaurantById);
router.patch('/:restaurantId', authMiddleware, roleMiddleware(['restaurant manager']), updateRestaurant);
router.delete('/:restaurantId', authMiddleware, roleMiddleware(['admin']), deleteRestaurant);

module.exports = router;
