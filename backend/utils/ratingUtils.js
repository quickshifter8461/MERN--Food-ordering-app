const MenuItem = require('../models/menuItemModel')
const Review = require('../models/reviewModel')
const Restaurant = require("../models/restaurantModel");
const calculateAverageRating = async (model, Id) => {
    try {
      if (model === MenuItem) {
        const reviews = await Review.find({ menuId: Id });
  
        if (reviews.length === 0) {
          return 0;
        }
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;
        return averageRating.toFixed(2);
      }
      if (model === Restaurant) {
        const menuItems = await MenuItem.find({ restaurant: Id });
  
        if (menuItems.length === 0) {
          return 0;
        }
        const menuItemRatings = await Promise.all(
          menuItems.map(async (menuItem) => {
            const menuItemAverageRating = await calculateAverageRating(MenuItem, menuItem._id);
            return parseFloat(menuItemAverageRating);
          })
        );
        const totalRestaurantRating = menuItemRatings.reduce((sum, rating) => sum + rating, 0);
        const restaurantAverageRating = totalRestaurantRating / menuItemRatings.length;
        return restaurantAverageRating.toFixed(2);
      }
      return 0; 
    } catch (error) {
      console.error("Error calculating average rating:", error);
      throw error;
    }
  };
  
  module.exports = { calculateAverageRating };
  