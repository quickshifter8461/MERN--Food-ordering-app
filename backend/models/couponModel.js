const mongoose = require("mongoose");
const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountPercentage: { type: Number, required: true },
  maxDiscountValue: { type: Number, required: true },
  minOrderValue: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
