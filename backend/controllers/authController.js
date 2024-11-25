const User = require("../models/userModel")
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    try {
        const { name, email, password, role, profilePic, phone } = req.body;
        if(!name || !email || !password || !phone){
            return res.status(400).json({ message: "All fields are required" });
        }
        // Check if user exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        user = new User({ name, email, password: hashedPassword, role, phone });
        await user.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if(!email || !password){
            return res.status(400).json({ message: "All fields are required" });  // Return error if required fields are not provided
        }
        // Check user existence
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Generate JWT
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('authToken', token, {
            httpOnly: false, // Prevent client-side access to the cookie
            secure: process.env.NODE_ENV === 'production', // Ensure the cookie is sent only over HTTPS in production
            sameSite: 'strict', // Prevent CSRF attacks
            maxAge: 60 * 60 * 1000 // Set expiry time to 1 hour
        });
        res.json({message: "Login successful" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Check if all fields are provided
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if newPassword matches confirmPassword
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // Fetch the user by ID
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: "Invalid credentials" }); // Generic message for security
        }

        // Verify the current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" }); // Generic message for security
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, email, phone, profilePic } = req.body;

        // Check if at least one field is provided
        if (!name && !email && !phone && !profilePic ) {
            return res.status(400).json({ message: "At least one field must be updated" });
        }

        // Prepare update object
        const updates = {};
        if (name) updates.name = name;
        if (email) updates.email = email;
        if (phone) updates.phone = phone;
        if (profilePic) updates.profilePic = profilePic;
        

        // Find and update the user
        const updateProfile = await User.findByIdAndUpdate(
            req.user.userId,
            { $set: updates },
            { new: true }
        ).select("-password");

        if (!updateProfile) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User profile updated successfully",
            updatedProfile: updateProfile,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteProfile = async(req, res, next)=>{
    try{
        const deleteUser = await User.findByIdAndDelete(req.user.userId);
        if(!deleteUser){
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    }catch(error){
        res.status(500).json({ message: error.message });
    }
}