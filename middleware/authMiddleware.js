const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Ensure you have the correct path

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1]; // Get token from header

            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token

            req.user = await User.findById(decoded.id).select("-password"); // Get user from database

            if (!req.user) {
                return res.status(401).json({ message: "User not found" });
            }

            next(); // Continue to next middleware
        } catch (error) {
            console.error("Token Error:", error);
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
    } else {
        return res.status(401).json({ message: "Not authorized, no token" });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next(); // User is admin, continue
    } else {
        return res.status(403).json({ message: "Not authorized as admin" });
    }
};

module.exports = { protect, admin };
