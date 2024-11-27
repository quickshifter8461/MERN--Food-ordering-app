const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const { upload } = require("../middlewares/multer");
const { addItemToCart, removeItemFromCart, decrementItemQuantity, getCart, deleteCart, incrementItemQuantity } = require("../controllers/cartController");
const router = express.Router();

router.get('/get-cart',roleMiddleware(["user"]), getCart)
router.post('/add',roleMiddleware(["user"]), addItemToCart)
router.post('/decrement-item',roleMiddleware(["user"]),decrementItemQuantity)
router.post('/increment-item',roleMiddleware(["user"]),incrementItemQuantity)
router.delete('/remove',roleMiddleware(["user"]),removeItemFromCart)
router.delete('/delete-cart',roleMiddleware(["user"]),deleteCart)
module.exports = router;