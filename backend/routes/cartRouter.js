const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const { upload } = require("../middlewares/multer");
const router = express.Router();

router.get('/get-cart-items',authMiddleware,roleMiddleware(["user"]))
router.post('/add-to-cart')