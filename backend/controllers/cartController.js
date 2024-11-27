const Cart = require("../models/cartModel");
const MenuItem = require("../models/menuItemModel");

// Add or update item in the cart
exports.addItemToCart = async (req, res) => {
  try {
    const  userId  = req.user.userId; 
    const { foodId,restaurantId, quantity } = req.body;
    const menuItem = await MenuItem.findById(foodId).populate("restaurant");
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    const itemPrice = menuItem.price * quantity;
    let cart = await Cart.findOne({ userId, restaurantId });
    if (!cart) {
      cart = new Cart({ userId, restaurantId , items: [], totalPrice: 0, finalPrice: 0 });
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
    cart.finalPrice = cart.totalPrice; 
    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate({
      path: "items.foodId",
      select: "name price",
    }).populate({path: "userId", select: "name"}).populate("restaurantId" , "name location");
    res.status(200).json({ message: "Item added to cart", cart: populatedCart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add item to cart", error });
  }
};

exports.removeItemFromCart = async (req, res) => {
  try {
    const { userId } = req.user; 
    const { foodId } = req.body;
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const itemIndex = cart.items.findIndex(
      (item) => item.foodId.toString() === foodId
    );

    if (itemIndex > -1) {
      cart.items.splice(itemIndex, 1);
      cart.totalPrice = cart.items.reduce(
        (sum, item) => sum + item.totalItemPrice,
        0
      );
      cart.finalPrice = cart.totalPrice;
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


exports.decrementItemQuantity = async (req, res) => {
  try {
    const { cartId, foodId } = req.body; 
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const itemIndex = cart.items.findIndex(
      (item) => item.foodId.toString() === foodId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }
    const item = cart.items[itemIndex];
    if (item.quantity > 1) {
      item.quantity -= 1;
      item.totalItemPrice = item.quantity * item.totalItemPrice / (item.quantity + 1);
    } else {
      cart.items.splice(itemIndex, 1);
    }
    cart.totalPrice = cart.items.reduce((sum, curr) => sum + curr.totalItemPrice, 0);
    cart.finalPrice = cart.totalPrice;
    await cart.save();
    return res.status(200).json({ message: "Item quantity updated", cart });
  } catch (error) {
    console.error("Error updating item quantity:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
