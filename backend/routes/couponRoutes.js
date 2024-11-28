const express = require('express')
const roleMiddleware = require('../middlewares/roleMiddleware')
const { createCoupon,getCoupons, deleteCoupon,updateCoupon } = require('../controllers/couponController');
const router = express.Router();

router.get('/get-coupons',getCoupons)
router.post('/create-coupon',roleMiddleware(["admin"]), createCoupon)
router.put('/update-coupon/:id',roleMiddleware(["admin"]), updateCoupon)
router.delete('/delete-coupon/:id',roleMiddleware(["admin"]), deleteCoupon)

module.exports = router;