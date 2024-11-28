const mongoose = require("mongoose");
const Coupon = require("../models/couponModel"); 
const Cart = require("../models/cartModel"); 

const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PREPARING: "preparing",
  OUT_FOR_DELIVERY: "out for delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
    cartId: { type: mongoose.Schema.Types.ObjectId, ref: "Cart", required: true },
    totalAmount: { type: Number, },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
    finalPrice: { type: Number, min: 0 },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
    },
    deliveryAddress: { type: mongoose.Schema.Types.ObjectId, ref: "Address", required: true },
  },
  { timestamps: true }
);

const applyDiscount = async (totalAmount, couponId) => {
  if (!couponId) return totalAmount;

  const coupon = await Coupon.findById(couponId);

  if (!coupon) throw new Error("Coupon not found.");
  if (!coupon.isActive) throw new Error("Coupon is inactive.");
  if (coupon.expiryDate < new Date()) throw new Error("Coupon has expired.");
  if (totalAmount < coupon.minOrderValue) {
    throw new Error(
      `Order value must be at least ${coupon.minOrderValue} to use this coupon.`
    );
  }

  const discount = Math.min(
    (totalAmount * coupon.discountPercentage) / 100,
    coupon.maxDiscountValue
  );

  return Math.max(totalAmount - discount, 0);
};

orderSchema.pre("save", async function (next) {
  try {
    const cart = await Cart.findById(this.cartId);
    if (!cart) {
      throw new Error("Cart not found. Unable to calculate total amount.");
    }
    this.totalAmount = cart.totalPrice;
    if (this.coupon) {
      this.finalPrice = await applyDiscount(this.totalAmount, this.coupon);
    } else {
      this.finalPrice = this.totalAmount;
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
