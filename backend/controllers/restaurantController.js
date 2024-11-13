const Restaurant = require("../models/restaurantModel");

exports.createRestaurant = async (req, res) => {
  try {
    const { name, location, cuisine } = req.body;

    // Create a new restaurant
    const restaurant = new Restaurant({
      name,
      location,
      cuisine,
      owner: req.user.userId,
    });
    await restaurant.save();

    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant)
      return res.status(404).json({ message: "Restaurant not found" });

    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant)
      return res.status(404).json({ message: "Restaurant not found" });

    if (restaurant.owner.toString() !== req.user.userId)
      return res.status(403).json({ message: "Unauthorized action" });

    Object.assign(restaurant, req.body);
    await restaurant.save();
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteRestaurant = async (req, res) => {
    try {
      // Find the restaurant by ID and check if it exists
      const restaurant = await Restaurant.findOne({
        _id: req.params.restaurantId,
        owner: req.user.userId, // Match owner in the query to ensure authorization
      });
  
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found or unauthorized" });
      }
  
      // Delete the restaurant
      await Restaurant.findByIdAndDelete(req.params.restaurantId);
      res.json({ message: "Restaurant deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
