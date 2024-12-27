const express = require('express')
const roleMiddleware = require('../middlewares/roleMiddleware')
const { addReview, deleteReview, getAllReviewMenuItem, getAllRestaurantReview, getAllReviewsOfUser } = require('../controllers/reviewController')
const router = express.Router()

router.post('/add-review',roleMiddleware(["user"]),addReview)
router.delete('/:reviewId/delete-review',roleMiddleware(["user"]),deleteReview)
router.get('/:menuId/all-review',roleMiddleware(["user"]),getAllReviewMenuItem)
router.get('/:restaurantId/restaurant-reviews', roleMiddleware(["user"]),getAllRestaurantReview)
router.get('/all-reviews', roleMiddleware(["user"]),getAllReviewsOfUser)
module.exports = router