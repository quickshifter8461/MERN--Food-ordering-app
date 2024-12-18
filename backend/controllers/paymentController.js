const Payment = require("../models/paymentModel.js");
const Razorpay = require("razorpay");
const dotenv = require("dotenv");
const Order = require("../models/orderModel.js");
const crypto = require('crypto');
const Cart = require("../models/cartModel.js");

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
    const amount = Math.round(order.finalPrice);
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

exports.getAllPayments = async (req,res)=>{
  try{
    const payments = await Payment.find({user: req.user.userId})
    res.status(200).json({ message: "Payments found successfully", payments});
  }catch(error){
    res.status(500).json({ message: error.message })
  }
}

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET_KEY) 
      .update(sign)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      const payment = await Payment.findOneAndUpdate(
        { transactionId: razorpay_order_id },
        { status: "success" },
        { new: true }
      );
      const order = await Order.findOneAndUpdate( {_id: payment.orderId}, { status: "confirmed"})
      
       const cart = await Cart.findOneAndUpdate(
          { _id: order.cartId },
          { cartStatus: "ordered" },
          { new: true }
        );
      return res.status(200).json({ message: "Payment is successful" });

    } else {
      return res.status(400).json({ message: "Payment verification failed at backend" });
    }

  } catch (error) {
    console.error("Error during payment verification:", error.message);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


exports.getPaymentsOfAllUsers = async (req, res)=>{
  try{
    const payments = await Payment.find({status: 'success'})
    res.status(200).json({ message: "Payments found successfully", payments});
  }catch(error){
    res.status(500).json({ message: error.message })
  }
}