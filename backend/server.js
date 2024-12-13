const express = require("express");
const cors = require("cors"); // Import CORS
const cookieParser = require("cookie-parser");
const { PORT, connectDB } = require("./config/db");
const authRoutes = require("./routes/auth");
const restaurantRoutes = require("./routes/restaurant");
const authMiddleware = require("./middlewares/authMiddleware");
const cartRoutes = require("./routes/cartRoutes");
const couponRoutes = require("./routes/couponRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const morgan = require('morgan');
const dotenv= require('dotenv')
dotenv.config()

const app = express();
app.use(morgan('short')); 
connectDB();

app.use(cors(
  {
    origin: process.env.CLIENT_URL,
    credentials:true,
    methods:['GET', 'POST','PUT','PATCH','DELETE','OPTIONS'],
  }
));

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/cart", authMiddleware, cartRoutes);
app.use("/api/coupon", authMiddleware, couponRoutes);
app.use("/api/order", authMiddleware, orderRoutes);
app.use("/api/review", authMiddleware, reviewRoutes);
app.get("/", (req, res) => {
  res.send("API running...");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.all("*", (req, res) => {
  res.status(404).json({ message: "Endpoint does not exist" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "An error occurred on the server." });
});
