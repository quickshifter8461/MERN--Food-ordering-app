const Cart = require("../models/cartModel");
const MenuItem = require("../models/menuItemModel");

exports.getCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cart = await Cart.findOne({ userId })
      .populate("restaurantId", "name location")
      .populate("userId", "name");
    if (!cart) {
      return res.status(404).json({ message: "No items in cart" });
    }
    res.status(200).json({ message: "Cart found", cart: cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addItemToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { foodId, restaurantId, quantity } = req.body;
    const menuItem = await MenuItem.findById(foodId).populate("restaurant");
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    const itemPrice = menuItem.price * quantity;
    let cart = await Cart.findOne({ userId });
    if (cart && cart.restaurantId.toString() !== restaurantId) {
      return res
        .status(409)
        .json({
          message: "Item from different restaurant is already added to cart",
        });
    }
    if (!cart) {
      cart = new Cart({
        userId,
        restaurantId,
        items: [],
        totalPrice: 0,
      });
    }
    const existingItemIndex = cart.items.findIndex(
      (item) => item.foodId.toString() === foodId
    );
    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].totalItemPrice += itemPrice;
    } else {
      cart.items.push({
        foodId,
        restaurantId,
        quantity,
        totalItemPrice: itemPrice,
      });
    }
    cart.totalPrice = cart.items.reduce(
      (sum, item) => sum + item.totalItemPrice,
      0
    );
    await cart.save();
    const populatedCart = await Cart.findById(cart._id)
      .populate("items.foodId", "name price")
      .populate("userId", "name")
      .populate("restaurantId", "name location");
    res
      .status(200)
      .json({ message: "Item added to cart", cart: populatedCart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add item to cart", error });
  }
};

exports.removeItemFromCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { foodId } = req.body;
    const cart = await Cart.findOne({ userId })
      .populate("items.foodId", "name price")
      .populate("userId", "name")
      .populate("restaurantId", "name location");
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const itemIndex = cart.items.findIndex(
      (item) => item.foodId._id.toString() === foodId
    );
    if (itemIndex > -1) {
      cart.items.splice(itemIndex, 1);
      cart.totalPrice = cart.items.reduce(
        (sum, item) => sum + item.totalItemPrice,
        0
      );
      if (cart.items.length === 0) {
        await Cart.findOneAndDelete({ userId });
        return res.status(200).json({ message: "Cart is now empty and deleted" });
      }
      await cart.save();
      res.status(200).json({ message: "Item removed from cart", cart });
    } else {
      res.status(404).json({ message: "Item not found in cart" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to remove item from cart", error });
  }
};

exports.updateItemQuantity = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { foodId, action } = req.body;
    if (!["increment", "decrement"].includes(action)) {
      return res
        .status(400)
        .json({ message: "Invalid action. Use 'increment' or 'decrement'." });
    }
    const cart = await Cart.findOne({ userId })
      .populate("items.foodId", "name price")
      .populate("userId", "name")
      .populate("restaurantId", "name location");
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const itemIndex = cart.items.findIndex(
      (item) => item.foodId._id.toString() === foodId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }
    const item = cart.items[itemIndex];
    if (action === "increment") {
      item.quantity += 1;
      item.totalItemPrice += item.foodId.price;
      cart.totalPrice += item.foodId.price;
    } else if (action === "decrement") {
      if (item.quantity > 1) {
        item.quantity -= 1;
        item.totalItemPrice -= item.foodId.price;
        cart.totalPrice -= item.foodId.price;
      } else {
        cart.totalPrice -= item.totalItemPrice;
        cart.items.splice(itemIndex, 1);
      }
    }
    await cart.save();
    return res.status(200).json({ message: "Item quantity updated", cart });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cart = await Cart.findOneAndDelete({ userId });
    if (!cart) {
      return res.status(404).send({ message: "Cart not found" });
    }
    res.status(200).send({ message: "Cart deleted" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
