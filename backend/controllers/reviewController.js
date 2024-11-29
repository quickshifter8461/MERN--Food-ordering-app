const Review = require("../models/reviewModel");
const Order = require("../models/orderModel");
const MenuItem = require("../models/menuItemModel");

exports.addReview = async (req, res) => {
  try {
    const { menuId, orderId, rating, comment } = req.body;
    const user = req.user.userId;
    const menuItem = await MenuItem.findById(menuId);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    const order = await Order.findById(orderId).populate("cartId");
    let isMatch;
    order.cartId.items.some((item) => {
      isMatch = item.foodId.toString() === menuId.toString();
      return isMatch;
    });
    if (order.status !== "delivered") {
      return res.status(400).json({
        message:
          "Your order is not delivered, please try once order is delivered",
      });
    }
    const existingReview = await Review.findOne({
      user: user,
      menuId: menuId,
      orderId: orderId,
    });

    if (existingReview) {
      return res.status(400).json({
        message:
          "You can only submit one review per delivered order for this menu item.",
      });
    }
    if (!isMatch) {
      return res.status(400).json({
        message: "Item not found in order",
      });
    }
    const review = new Review({
      user: user,
      menuId,
      orderId,
      rating,
      comment,
    });
    await review.save();
    menuItem.customerReviews.push(review._id);
    await menuItem.save();
    menuItem.populate("customerReviews");

    res.status(201).json({ message: "Review submitted successfully", review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
