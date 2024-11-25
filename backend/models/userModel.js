const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minLength:8 },
    phone: { type: Number, unique: true},
    profilePic: {
        type: String,
        default:
          "https://st3.depositphotos.com/6672868/13701/v/450/depositphotos_137014128-stock-illustration-user-profile-icon.jpg",
      },
    role: { type: String, enum: ['user', 'admin', 'restaurant manager'], default: 'user' },
    address: [{type: mongoose.Types.ObjectId, ref: 'Address'}],
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }],
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
