const jwt = require("jsonwebtoken");
const { User } = require("../model/user");

const auth = async (req, res, next) => {
  try {
 
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token missing from header." });
    }

    
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    
    req.userID = user._id;
    req.user = user;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please log in again." });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token. Please log in again." });
    }

    res.status(500).json({ message: "Something went wrong in authentication." });
  }
};

module.exports = auth;
