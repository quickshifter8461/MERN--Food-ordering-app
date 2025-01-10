const User = require("../models/userModel");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" });
    res.status(200).json({ message: "Users fetched successfully", users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.status === true) {
      const updatedStatus = await User.updateOne(
        user,
        { status: false },
        { new: true }
      );
      const updatedUser = await User.findById(userId);
      res
        .status(200)
        .json({ message: "User status updated successfully", updatedUser });
    }
    if (user.status === false) {
      const updatedStatus = await User.updateOne(
        user,
        { status: true },
        { new: true }
      );
      const updatedUser = await User.findById(userId);
      res
        .status(200)
        .json({ message: "User status updated successfully", updatedUser });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
