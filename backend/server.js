const express = require("express");
const cors = require("cors"); // Import CORS
const cookieParser = require("cookie-parser");
const { PORT, connectDB } = require("./config/db");
const authRoutes = require("./routes/auth");
const restaurantRoutes = require("./routes/restaurant");
const authMiddleware = require("./middlewares/authMiddleware");
const cartRoutes = require("./routes/cartRouter")
const roleMiddleware = require("./middlewares/roleMiddleware");

const app = express();

connectDB();

app.use(cors());

app.use(express.json());
app.use(cookieParser())

app.use("/api/auth", authRoutes);
app.use("/api/restaurants", authMiddleware, restaurantRoutes);
app.use("/api/cart",authMiddleware, cartRoutes)

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
