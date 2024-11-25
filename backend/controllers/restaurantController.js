const Restaurant = require("../models/restaurantModel");
const MenuItem = require("../models/menuItemModel");

const cloudinaryInstance = require('../config/cloudinary')


exports.createRestaurant = async (req, res) => {
  try {
    const { name, location, cuisine, rating , status, contact } = req.body;

    const existingRestaurant = await Restaurant.findOne({ name });
    if (existingRestaurant) {
      return res.status(400).json({ message: "Restaurant already exists" });
    }
    const imageUploadResult = await cloudinaryInstance.uploader.upload(req.file.path);
    const restaurant = new Restaurant({
      name,
      location,
      cuisine,
      rating, 
      status,
      image: imageUploadResult.url,
      contact,
      owner: req.user.userId,
    });
    await restaurant.save();
    res.status(201).json({
      message: "Restaurant created successfully",
      restaurant,
    });
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
    const restaurant = await Restaurant.findById(req.params.restaurantId).populate("menuItems");
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

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    
    if (restaurant.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    if (req.file) {
      const imageUploadResult = await cloudinary.uploader.upload(req.file.path);
      restaurant.image = imageUploadResult.url;
    }

    const { name, address, description, contact, status, menuItems } = req.body;

    if (name) restaurant.name = name;
    if (address) restaurant.address = address;
    if (description) restaurant.description = description;
    if (contact) restaurant.contact = contact;
    if (status) restaurant.status = status;
    if (menuItems) restaurant.menuItems = menuItems;
   
    await restaurant.save();

    res.status(200).json({
      message: "Restaurant updated successfully",
      restaurant,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.deleteRestaurant = async (req, res) => {
    try {
      const restaurant = await Restaurant.findOne({
        _id: req.params.restaurantId,
        owner: req.user.userId, 
      });
  
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found or unauthorized" });
      }
  
      await Restaurant.findByIdAndDelete(req.params.restaurantId);
      res.json({ message: "Restaurant deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
