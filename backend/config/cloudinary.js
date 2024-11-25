const cloudinary = require('cloudinary')
const dotenv= require('dotenv').config()



cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET 
})

const cloudinaryInstance = cloudinary

module.exports = cloudinaryInstance;