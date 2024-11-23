const express = require('express');
const {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
} = require('../controllers/restaurantController');
const {
  createMenuItem,
  getMenuItemsByRestaurant,
} = require('../controllers/menuController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// Only 'admin' and 'restaurant manager' can create a restaurant
router.post('/', authMiddleware, roleMiddleware(['admin', 'restaurant manager']), createRestaurant);

// Only 'restaurant manager' can add menu items to a restaurant
router.post('/:restaurantId/addMenu', authMiddleware, roleMiddleware(['admin','restaurant manager']), createMenuItem);

// Anyone can view restaurants
router.get('/', getRestaurants);
router.get('/:restaurantId', getRestaurantById);


// Only 'restaurant manager' can update a restaurant
router.patch('/:restaurantId', authMiddleware, roleMiddleware(['admin','restaurant manager']), updateRestaurant);

// Only 'admin' can delete a restaurant
router.delete('/:restaurantId', authMiddleware, roleMiddleware(['admin']), deleteRestaurant);

module.exports = router;
