const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // Retrieve the token from cookies
    const token = req.cookies?.authToken;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user data to the request object
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
