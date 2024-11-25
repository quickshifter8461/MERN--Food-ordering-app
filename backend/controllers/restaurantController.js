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
    let imageUrl = "https://cdn.prod.website-files.com/5f46c318c843828732a6f8e2/66b4beb879a502df90390196_digital-menu-board-free-templates.webp";
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
    const restaurants = await Restaurant.find().populate('owner').populate('menuItems');
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId).populate('menuItems');
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
    const restaurant = await Restaurant.find({ name: { $regex: name, $options: "i" } }).populate('menuItems');
    if (!restaurant)
      return res.status(404).json({ message: "Restaurant not found" });
    res.json(restaurant);
  }catch (error) {
    res.status(500).json({ message: error.message });
  }
} 
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
      const imageUploadResult = await cloudinaryInstance.uploader.upload(req.file.path);
      restaurant.image = imageUploadResult.url;
    }

    const { name, address, description, contact, status } = req.body;

    if (name) restaurant.name = name;
    if (address) restaurant.address = address;
    if (description) restaurant.description = description;
    if (contact) restaurant.contact = contact;
    if (status) restaurant.status = status;
    
   
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
  
