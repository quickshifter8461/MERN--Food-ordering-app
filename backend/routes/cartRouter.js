const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const { upload } = require("../middlewares/multer");
const { addItemToCart, removeItemFromCart, decrementItemQuantity } = require("../controllers/cartController");
const router = express.Router();


router.post('/add',roleMiddleware(["user"]), addItemToCart)
router.post('/decrement-item',roleMiddleware(["user"]),decrementItemQuantity)
router.delete('/remove',removeItemFromCart)
module.exports = router;