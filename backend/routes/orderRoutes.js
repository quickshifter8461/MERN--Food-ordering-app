const express = require("express")
const roleMiddleware = require("../middlewares/roleMiddleware");
const { createOrder, updateOrderUser, updateOrderStatus, getAllOrders, getAllRestaurantOrders, getOrderById } = require("../controllers/orderController");
const { createPayment, verifyPayment, getAllPayments, getPaymentsOfAllUsers } = require("../controllers/paymentController");
const router = express.Router();


router.post('/place-order',roleMiddleware(["user"]),createOrder)
router.get('/get-all-orders',roleMiddleware(["user"]),getAllOrders)
router.get('/get-order-by-id/:orderId',roleMiddleware(["user"]),getOrderById)
router.get('/get-all-restaurant-orders/:restaurantId',roleMiddleware(["admin", "restaurant manager"]),getAllRestaurantOrders)
router.put('/update-order/:orderId',roleMiddleware(["user"]),updateOrderUser)
router.patch('/update-order-status/:orderId',roleMiddleware(["admin", "restaurant manager"]), updateOrderStatus)

router.post('/:orderId/create-payment',roleMiddleware(["user"]),createPayment)
router.get('/all-payments', getAllPayments)
router.post('/verify-payment',verifyPayment)
router.get('/admin/get-all-payments',roleMiddleware(["admin"]), getPaymentsOfAllUsers)

module.exports = router