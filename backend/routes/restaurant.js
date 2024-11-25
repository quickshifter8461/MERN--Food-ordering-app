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
  getMenuItemsByName,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem
} = require('../controllers/menuController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const {upload} = require('../middlewares/multer');
const router = express.Router();


router.post('/', authMiddleware, roleMiddleware(['admin', 'restaurant manager']),upload.single("image"), createRestaurant);
router.post('/:restaurantId/addMenu', authMiddleware, roleMiddleware(['admin','restaurant manager']), upload.single("image"), createMenuItem);

router.get('/all-restaurants', getRestaurants);
router.get('/:restaurantId', getRestaurantById);
router.get('/:restaurantId/menu',getMenuItemsByRestaurant)
router.get('/menu/:name',getMenuItemsByName)
router.get('/:restaurantId/:menuItemId',getMenuItemById)


router.put('/:restaurantId', authMiddleware, roleMiddleware(['admin','restaurant manager']),upload.single("image"), updateRestaurant);
router.put('/menuitems/:restaurantId/:menuItemId',authMiddleware, roleMiddleware(["admin","restaurant manager"]),upload.single("image"), updateMenuItem);

router.delete('/:restaurantId', authMiddleware, roleMiddleware(['admin']), deleteRestaurant);
router.delete('/menuitems/:restaurantId/:menuItemId', authMiddleware, roleMiddleware(['admin','restaurant manager']), deleteMenuItem)
module.exports = router;
