const express = require('express')
const roleMiddleware = require('../middlewares/roleMiddleware')
const { addReview, deleteReview, getAllReviewMenuItem, getAllRestaurantReview } = require('../controllers/reviewController')
const router = express.Router()

router.post('/add-review',roleMiddleware(["user"]),addReview)
router.delete('/:reviewId/delete-review',roleMiddleware(["user"]),deleteReview)
router.get('/:menuId/all-review',roleMiddleware(["user"]),getAllReviewMenuItem)
router.get('/:restaurantId/restaurant-reviews', roleMiddleware(["user"]),getAllRestaurantReview)
module.exports = router