const Address = require("../models/addressModel");
const User = require('../models/userModel')
exports.addAddress = async (req, res) => {
  try {
    const { street, city, state, postalCode, name } = req.body;
    const user = await User.findById(req.user.userId)
    const address = new Address({
      street,
      city,
      state,
      postalCode,
      name,
      user: req.user.userId,
    });
    await address.save();
    user.address.push(address._id)
    await user.save()
    await user.populate('address')
    res.status(201).json({
      message: "Address saved successfully",
      address: address,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.userId }).populate("user","name");
    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAddressById = async (req, res) => {
  try {
    const addressId = req.params.addressId;
    const address = await Address.findById({
      user: req.user.userId,
      _id: addressId,
    }).populate("user","name");
    if(!address){
     return res.status(404).json({message: "Address not found"})
    }
      res.status(200).json(address);
  } catch (error) {
    res.status(500).json({ Message: error.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const addressId = req.params.addressId;
    const { street, city, state, postalCode, name } = req.body;
    const address = await Address.findById({
      user: req.user.userId,
      _id: addressId,
    });
    if (!address) {
     return res.status(404).json({ message: "Address not found" });
    }
    if (street) address.street = street;
    if (city) address.city = city;
    if (state) address.state = state;
    if (postalCode) address.postalCode = postalCode;
    if (name) address.name = name;

    await address.save();
    res
      .status(200)
      .json({ message: "Address updated successfully", address: address });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAddress = async (req,res)=>{
    try{
        const addressId = req.params.addressId
        const address = await Address.findByIdAndDelete({user: req.user.userId, _id:addressId})
        res.json({message: "Address deleted successfully"})
    }catch(error){
        res.status(500).json({message: error.message})
    }
}