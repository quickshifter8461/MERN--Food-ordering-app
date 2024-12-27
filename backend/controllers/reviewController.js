const Review = require("../models/reviewModel");
const Order = require("../models/orderModel");
const MenuItem = require("../models/menuItemModel");
const Restaurant = require("../models/restaurantModel");
const { calculateAverageRating } = require("../utils/ratingUtils");

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
    const menuItemAverageRating = await calculateAverageRating(
      MenuItem,
      menuId
    );
    menuItem.rating = menuItemAverageRating;
    const restaurantId = menuItem.restaurant;
    const restaurantAverageRating = await calculateAverageRating(
      Restaurant,
      restaurantId
    );
    await Restaurant.findByIdAndUpdate(restaurantId, {
      rating: restaurantAverageRating,
    });
    await menuItem.save();
    menuItem.populate("customerReviews");

    res.status(201).json({ message: "Review submitted successfully", review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const reviewId = req.params.reviewId;
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found " });
    }
    const menuItem = await MenuItem.findById(review.menuId);
    const itemIndex = menuItem.customerReviews.findIndex(
      (item) => item.toString() === review._id.toString()
    );
    if (itemIndex > -1) {
      menuItem.customerReviews.splice(itemIndex, 1);
    }
    await Review.findByIdAndDelete(reviewId);
    const menuId = review.menuId;
    const menuItemAverageRating = await calculateAverageRating(
      MenuItem,
      menuId
    );
    const restaurantId = menuItem.restaurant;
    const restaurantAverageRating = await calculateAverageRating(
      Restaurant,
      restaurantId
    );
    await Restaurant.findByIdAndUpdate(restaurantId, {
      rating: restaurantAverageRating,
    });
    menuItem.rating = menuItemAverageRating;
    await menuItem.save();

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllReviewMenuItem = async (req, res) => {
  try {
    const { menuId } = req.params;
    const review = await Review.find({ menuId });
    if (!review) {
      return res.status(404).json({ message: "No reviews found" });
    }
    res.status(200).json({ message: "Reviews fetched successfully", review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllRestaurantReview = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const menuItems = await MenuItem.find({ restaurant: restaurantId });
    const allReviews = await Review.find({
      menuItemId: { $in: menuItems.map((item) => item.menuItemId) },
    });
    res
      .status(200)
      .json({ message: "Reviews fetched successfully", allReviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllReviewsOfUser = async (req, res)=>{
  try {
    const userId = req.user.userId
    const reviews = await Review.find({ user: userId })
    res.status(200).json({ message: "Reviews fetched successfully", reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}