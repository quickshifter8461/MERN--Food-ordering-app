const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        location: {
            type: { type: String, enum: ['Point'] },
            coordinates: { type: [Number] } // [longitude, latitude]
        }
    },
    cuisine: { type: String, required: true },
    rating: { type: Number, default: 0 },
    menuItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
    contact: {
        phone: String,
        email: String
    },
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
