const Coupon = require('../models/couponModel')

exports.createCoupon = async (req,res)=>{
    try{
        const {code, discountPercentage,maxDiscountValue,minOrderValue,expiryDate} = req.body
        if(!code || !discountPercentage || !maxDiscountValue || !minOrderValue || !expiryDate){
            return res.status(400).json({message: "All fields required"})
        }
        const couponExist = await Coupon.findOne({code})
        if(couponExist){
            return res.status(400).json({message: "Coupon already exist"})
        }
        const coupon = new Coupon({code,discountPercentage,maxDiscountValue,minOrderValue,expiryDate })
        await coupon.save()
        res.status(201).json({message: "Coupon created successfully", coupon})
    }catch(error){
        res.status(500).json({message: error.message})
    }
}

exports.getCoupons = async (req,res) =>{
    try{
        const coupons = await Coupon.find()
        if(coupons.length===0){
            return res.status(404).json({message: "No coupons found"})
        }
        res.status(200).json({message: "Coupons fetched successfully", coupons: coupons})
    }catch(error){
        res.status(500).json({message: error.message})
    }
}

exports.applyCoupon = async (req,res) =>{
    try{
        const{code, orderValue} = req.body
        if(!code || !orderValue){
            return res.status(400).json({ message: "Coupon code and order value are required." });
        }
        const coupon = await Coupon.findOne({code})
        if(!coupon){
            return res.status(404).json({message: "Invalid coupon code"})
        }
        if(!coupon.isActive){
            return res.status(400).json({ message: "This coupon is no longer active." });
        }
        const appliedDate = new Date()
        if(appliedDate > coupon.expiryDate){
            return res.status(400).json({ message: "This coupon has expired." });
        }
        if(orderValue< coupon.minOrderValue){
            return res.status(400).json({
                message: `Order value must be at least ${coupon.minOrderValue} to apply this coupon.`,
              }); 
        }
        const couponDiscount = Math.min((orderValue*coupon.discountPercentage)/100, coupon.maxDiscountValue)
        const finalPrice = orderValue-couponDiscount
        res.status(200).json({message:"Coupon applied successfully", couponDiscount, finalPrice})
    }catch(error){
        res.status(500).json({message: error.message})
    }
}

exports.updateCoupon = async (req,res) =>{
    try{
        const {id} = req.params
        const {discountPercentage, maxDiscountValue, minOrderValue, expiryDate, isActive} = req.body
        const coupon = await Coupon.findById(id)
        if(!coupon){
            return res.status(404).json({message: "Coupon not found"})
        }
        if(discountPercentage) coupon.discountPercentage = discountPercentage
        if(maxDiscountValue) coupon.maxDiscountValue = maxDiscountValue
        if(minOrderValue) coupon.minOrderValue = minOrderValue
        if(expiryDate) coupon.expiryDate = expiryDate
        if(isActive) coupon.isActive = isActive
        await coupon.save()

        res.status(200).json({message: "Coupon updated successfully", coupon})
    }catch(error){
        res.status(500).json({message: error.message})
    }
}

exports.deleteCoupon = async (req, res) => {
    try {
      const { id } = req.params;
      const coupon = await Coupon.findByIdAndDelete(id);
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found." });
      }
      res.status(200).json({ message: "Coupon deleted successfully." });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };