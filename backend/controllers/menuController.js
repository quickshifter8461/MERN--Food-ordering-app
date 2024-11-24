const MenuItem = require("../models/menuItemModel");
const Restaurant = require("../models/restaurantModel");
const cloudinaryInstance = require("../config/cloudinary");
const mongoose = require("mongoose");

exports.createMenuItem = async (req, res) => {
  try {
    const { name, price, category, isAvailable, description } = req.body;
    const restaurantId = req.params.restaurantId.trim();
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    let imageUrl =
      "https://cdn.prod.website-files.com/5f46c318c843828732a6f8e2/66b4beb879a502df90390196_digital-menu-board-free-templates.webp";
    if (req.file) {
      const uploadResponse = await cloudinaryInstance.uploader.upload(
        req.file.path
      );
      imageUrl = uploadResponse.url;
    }
    const menuItemExists = await MenuItem.findOne({
      restaurant: restaurantId,
      name: name,
    });
    if (menuItemExists) {
      return res.status(400).json({ message: "Menu item already exists" });
    }
    const menuItem = new MenuItem({
      name,
      price,
      category,
      restaurant: restaurantId,
      isAvailable,
      description,
      image: imageUrl,
    });
    await menuItem.save();
    restaurant.menuItems.push(menuItem._id);
    await restaurant.save();
    await restaurant.populate("menuItems");
    res.status(201).json({
      message: "Menu item created successfully",
      menuItem
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getMenuItemsByRestaurant = async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;
    const restaurant = await Restaurant.findById(restaurantId)
    if (!restaurant) {
      return res.status(400).json({ message: "No restaurant found" });
    }
    const menuItems = await MenuItem.find({ restaurant: restaurantId });
    res.status(200).json(menuItems);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.searchMenuOfRestaurant = async (req,res)=>{
  try{
    const menuItems = await MenuItem.find({
      restaurant: req.params.restaurantId,
      name: { $regex: req.params.name, $options: "i" },
    });
    res.status(200).json(menuItems)
  }catch(error){
    res.status(500).json({ message: error.message });
  }
}

exports.searchMenuItemsByName = async (req,res)=>{
  try {
    const name = req.params.name
    const menuItems = await MenuItem.find({name: {$regex: name, $options:'i'}})
    res.status(200).json(menuItems)
  } catch (error) {
    res.status(500).json({message: error.message})
  }
}

exports.getMenuItemById = async (req, res) =>{
  try{
    const restaurantId = req.params.restaurantId
    const menuItemId =  req.params.menuItemId
    const menuItem = await MenuItem.findById({restaurant: restaurantId,
      _id: menuItemId
    })
    res.status(200).json(menuItem)
  }catch(error){
    res.status(500).json({message: error.message})
  }
}

exports.updateMenuItem = async (req, res) => {
  try {
    const { menuItemId, restaurantId } = req.params;
    const { name, price, category, isAvailable, description } = req.body;

    let updateFields = { name, price, category, isAvailable, description };

    if (req.file) {
      const uploadResponse = await cloudinaryInstance.uploader.upload(
        req.file.path
      );
      updateFields.imageUrl = uploadResponse.url;
    }

    const menuItem = await MenuItem.findOneAndUpdate(
      { _id: menuItemId, restaurant: restaurantId },
      updateFields,
      { new: true, runValidators: true }
    );

    if (!menuItem) {
      return res
        .status(404)
        .json({ message: "Menu item not found in the specified restaurant." });
    }

    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try{
    const { menuItemId, restaurantId } = req.params;
    if(!menuItemId){
      return res.status(400).json({ message: "Menu item ID is required" });
    }
    const deleteMenuItem = await MenuItem.findByIdAndDelete({
      _id: menuItemId,
      restaurant: restaurantId,
    });
    if(!deleteMenuItem){
      return res.status(404).json({ message: "Menu item not found in the specified restaurant" });
    }
    res.status(200).json({ message: "Menu item deleted" });
  }catch (error) {
    res.status(500).json({ message: error.message });
  }
}