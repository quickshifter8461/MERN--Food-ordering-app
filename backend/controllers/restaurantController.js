const Restaurant = require("../models/restaurantModel");
const MenuItem = require("../models/menuItemModel");
const cloudinaryInstance = require('../config/cloudinary')
exports.createRestaurant = async (req, res) => {
  try {
    const { name, location, cuisine, rating, status, contact } = req.body;
    const existingRestaurant = await Restaurant.findOne({ name });
    if (existingRestaurant) {
      return res.status(400).json({ message: "Restaurant already exists" });
    }
    let imageUrl 
    if (req.file) {
      const uploadResponse = await cloudinaryInstance.uploader.upload(req.file.path);
      imageUrl = uploadResponse.url;
    }
    const restaurant = new Restaurant({
      name,
      location,
      cuisine,
      rating,
      status,
      image: imageUrl,
      contact,
      owner: req.user.userId, 
    });
    await restaurant.save();
    await restaurant.populate("owner","name")
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
    const restaurants = await Restaurant.find().populate('owner',"name").populate('menuItems','name');
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId).populate('menuItems',"name");
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRestaurantByName = async (req,res)=>{
  try{
    const name = req.params.name;
    const restaurant = await Restaurant.find({ name: { $regex: name, $options: "i" } }).populate('menuItems',"name");
    if (!restaurant)
      return res.status(404).json({ message: "Restaurant not found" });
    res.json(restaurant);
  }catch (error) {
    res.status(500).json({ message: error.message });
  }
} 
exports.updateRestaurant = async (req, res) => {
  try {
    // Fetch the restaurant by ID
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Check if the user is authorized to update
    if (restaurant.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    // Handle image update if `req.file` exists
    if (req.file) {
      const imageUploadResult = await cloudinaryInstance.uploader.upload(req.file.path);
      restaurant.image = imageUploadResult.url;
    }

    // Destructure other fields from `req.body`
    const { name, address, description, contact, status } = req.body;

    // Update only provided fields
    if (name) restaurant.name = name;
    if (address) restaurant.address = address;
    if (description) restaurant.description = description;
    if (contact) restaurant.contact = contact;
    if (status) restaurant.status = status;

    // Save the updated restaurant
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
      const restaurant = await Restaurant.findByIdAndDelete(req.params.restaurantId);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found or unauthorized" });
      }
      res.json({ message: "Restaurant deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
