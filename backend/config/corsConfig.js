const cors = require('cors')
const dotenv = require("dotenv");
dotenv.config();
// CORS setup
const allowedOrigins = process.env.CLIENT_URLS?.split(",");

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

module.exports = cors(corsOptions);
