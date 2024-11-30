const Payment = require("../models/paymentModel.js");
const Razorpay = require("razorpay");
const dotenv = require("dotenv");
const Order = require("../models/orderModel.js");
const Crypto = require("crypto");
dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_ID_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

exports.createPayment = async (req, res) => {
  try {
    const user = req.user.userId;
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (order.status !== "pending") {
      if (order.status === "cancelled") {
        return res
          .status(400)
          .json({ message: "Cannot make payment for cancelled order" });
      }
      if (order.status === "delivered") {
        return res
          .status(400)
          .json({ message: "You have already received your order" });
      }
      return res.status(400).json({
        message:
          "You have already made the payment for this order, your order will reach you soon",
      });
    }
    const amount = order.finalPrice;
    const amountInPaisa = amount * 100;
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaisa,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: { orderId: order, userId: user },
    });
    const newPayment = new Payment({
      orderId,
      user,
      amount,
      status: "pending",
      transactionId: razorpayOrder.id,
    });

    const savedPayment = await newPayment.save();
    res.status(201).json({
      message: "Payment initiated successfully.",
      payment: savedPayment, razorpayOrder
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, transactionId, signature } = req.body;
    const order = await Order.findById(orderId);
    const secret = process.env.RAZORPAY_SECRET_KEY;
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(orderId + "|" + transactionId);
    const generateSignature = hmac.digest("hex");
    if (generateSignature === signature) {
        order.status = "confirmed"
        await order.save()
      return res
        .status(200)
        .json({ success: true, message: "Payment verified" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "payment not verified" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
