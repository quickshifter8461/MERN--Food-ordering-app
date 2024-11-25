const Cart = require("../models/cartModel"); 
const MenuItems = require("../models/menuItemModel"); // Adjust the path to your MenuItems model


exports.addToCart = async (req, res) => {
  const { userId, foodId, quantity } = req.body;

  try {
    // Find the menu item to get its price and name
    const menuItem = await MenuItems.findById(foodId);
    if (!menuItem) {
      return res.status(404).json({ error: "Food item not found" });
    }

    const { price, name } = menuItem;
    const totalItemPrice = price * quantity;

    // Find the user's cart or create a new one if not existing
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [], totalPrice: 0, finalPrice: 0 });
    }

    // Check if the item already exists in the cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.foodId.toString() === foodId
    );

    if (existingItemIndex > -1) {
      // Update quantity and price for the existing item
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].totalItemPrice += totalItemPrice;
    } else {
      // Add new item to the cart
      cart.items.push({ foodId, name, quantity, price, totalItemPrice });
    }

    // Recalculate total price
    cart.totalPrice = cart.items.reduce(
      (acc, item) => acc + item.totalItemPrice,
      0
    );
    cart.finalPrice = cart.totalPrice - (cart.discount || 0);

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get the cart for a user
exports.getCart = async (req, res) => {
  const { userId } = req.params;

  try {
    const cart = await Cart.findOne({ userId }).populate("items.foodId");
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Remove an item from the cart
exports.removeFromCart = async (req, res) => {
  const { userId, foodId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Find the item to remove
    const itemIndex = cart.items.findIndex(
      (item) => item.foodId.toString() === foodId
    );

    if (itemIndex > -1) {
      const removedItem = cart.items[itemIndex];
      cart.items.splice(itemIndex, 1);

      // Update cart prices
      cart.totalPrice -= removedItem.totalItemPrice;
      cart.finalPrice = cart.totalPrice - (cart.discount || 0);

      await cart.save();
      return res.status(200).json(cart);
    } else {
      return res.status(404).json({ error: "Item not found in cart" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
