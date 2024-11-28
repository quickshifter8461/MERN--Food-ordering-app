const express = require("express");
const roleMiddleware = require("../middlewares/roleMiddleware");
const { addItemToCart, removeItemFromCart, updateItemQuantity, getCart, deleteCart} = require("../controllers/cartController");
const router = express.Router();

router.get('/get-cart',roleMiddleware(["user"]), getCart)
router.post('/add',roleMiddleware(["user"]), addItemToCart)
router.post('/update-item-quantity',roleMiddleware(["user"]),updateItemQuantity)
router.delete('/remove',roleMiddleware(["user"]),removeItemFromCart)
router.delete('/delete-cart',roleMiddleware(["user"]),deleteCart)
module.exports = router;