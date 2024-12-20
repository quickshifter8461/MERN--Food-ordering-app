const mongoose = require("mongoose");
const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String },
  quantity: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  customerReviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
  isAvailable: { type: Boolean, default: true },
});

const MenuItem = mongoose.model("MenuItem", menuItemSchema);
module.exports = MenuItem;
