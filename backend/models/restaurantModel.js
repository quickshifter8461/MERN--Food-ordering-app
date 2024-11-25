const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true},
    cuisine: { type: String, required: true },
    rating: { type: Number, default: 0 },
    image:{type: String, default:"https://www.allseasonsluxuryproperties.com/images/Food/ff3b9c03-1342-4b6e-9636-93f91b60002e.webp" },
    menuItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
    contact: {type: String},
    status: {
        type: String,
        enum: ['open', 'closed'],
        default: 'open'
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    createdAt: { type: Date, default: Date.now }
});

restaurantSchema.index({ "address.location": "2dsphere" });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
module.exports = Restaurant
