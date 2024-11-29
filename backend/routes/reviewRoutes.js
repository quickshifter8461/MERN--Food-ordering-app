const express = require('express')
const roleMiddleware = require('../middlewares/roleMiddleware')
const { addReview } = require('../controllers/reviewController')
const router = express.Router()

router.post('/add-review',roleMiddleware(["user"]),addReview)

module.exports = router