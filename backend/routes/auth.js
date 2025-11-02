const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);
router.post("/register-user", authController.registerUser);
router.post("/register-mechanic", authController.registerMechanic);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.get("/me", authMiddleware.isAuthenticated, authController.getMe);
// Example protected routes
router.get("/dashboard", authMiddleware.isAuthenticated, (req, res) => {
    res.json({ message: "Welcome to the dashboard!", user: req.session.user });
});
router.get("/mechanic/profile", authMiddleware.isMechanic, (req, res) => {
    res.json({ message: "Welcome to your mechanic profile!", user: req.session.user });
});
router.get("/admin/users", authMiddleware.isAdmin, (req, res) => {
    res.json({ message: "Welcome to the admin panel!", user: req.session.user });
});

module.exports = router;