const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

/* ---------------- AUTH CHECK ---------------- */
const isAuthenticated = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "No token provided" });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        req.user = user; // attach user to request
        next();

    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};

/* ---------------- ROLE CHECKS ---------------- */
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
    }
    next();
};

const isMechanic = (req, res, next) => {
    if (!req.user || req.user.role !== "mechanic") {
        return res.status(403).json({ error: "Mechanic access required" });
    }
    next();
};

/* ---------------- EXPORTS (IMPORTANT) ---------------- */
module.exports = {
    isAuthenticated,
    isAdmin,
    isMechanic,
};