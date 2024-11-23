const MenuItem = require("../models/menuItemModel");


exports.createMenuItem = async (req, res) => {
  try {
    const { name, price, category, isAvailable } = req.body;

    const menuItem = new MenuItem({
      name,
      price,
      category,
      restaurant: req.params.restaurantId,
      isAvailable
    });
    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMenuItemsByRestaurant = async (req, res) => {
    try {
      const menuItems = await MenuItem.find({ restaurant: req.params.restaurantId });
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };