const MenuItem = require("../models/menuItemModel");
const Restaurant = require("../models/restaurantModel")
const User = require("../models/userModel")
const cloudinaryInstance = require("../config/cloudinary");
const mongoose = require("mongoose");

exports.createMenuItem = async (req, res) => {
  try {
    const { name, price, category, isAvailable } = req.body;
    const restaurantId = req.params.restaurantId.trim();

    let imageUrl =
      "https://cdn.prod.website-files.com/5f46c318c843828732a6f8e2/66b4beb879a502df90390196_digital-menu-board-free-templates.webp";

    if (req.file) {
      const uploadResponse = await cloudinaryInstance.uploader.upload(
        req.file.path
      );
      imageUrl = uploadResponse.url;
    }

    const menuItemIsExist = await MenuItem.findOne({
      restaurant: restaurantId,
      name: name,
    });
    if (menuItemIsExist) {
      return res.status(400).json({ message: "Menu item already exists" });
    }

    const menuItem = new MenuItem({
      name,
      price,
      category,
      restaurant: restaurantId,
      isAvailable,
      image: imageUrl,
    });

    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMenuItemsByRestaurant = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({
      restaurant: req.params.restaurantId,
    });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getMenuItemById = async (req, res) => {
  try {
    const { menuItemId, restaurantId } = req.params;
    const menuItem = await MenuItem.findOne({
      _id: menuItemId,
      restaurant: restaurantId,
    });

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

exports.getMenuItemsByName = async (req, res) => {
  try {
    const name = req.params.name; // Extract the search term from the request
    const menuItems = await MenuItem.find({
      name: { $regex: name, $options: "i" }, // Case-insensitive partial match
    });

    if (menuItems.length === 0) {
      return res.status(404).json({ message: "No menu items found." });
    }
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const { menuItemId, restaurantId } = req.params;
    const { name, price, category, isAvailable } = req.body;

    let updateFields = { name, price, category, isAvailable };

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