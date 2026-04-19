const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");
const User = require('../models/User');
const { emailProbablyExists, addEmailToBloom } = require('../utils/bloomFilter');
const { validateSignup, validateLogin } = require('../middleware/validation');

/**
 * @swagger
 * /auth/send-otp:
 *   post:
 *     summary: Send OTP for registration
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Email already exists or invalid input
 */
router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);
router.post("/register-user", authController.registerUser);
router.post("/register-mechanic", authController.registerMechanic);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.get("/me", authMiddleware.isAuthenticated, authController.getMe);

router.post('/signup', validateSignup, async (req, res) => {
  try {
    const email = req.body.email.toLowerCase().trim();

    if (emailProbablyExists(email)) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const user = new User({
      name: req.body.name.trim(),
      email,
      password: req.body.password,
    });

    await user.save();
    addEmailToBloom(email);

    return res.status(201).json({ message: 'Signup successful' });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to create user' });
  }
});

router.post('/login', validateLogin, async (req, res) => {
  try {
    const email = req.body.email.toLowerCase().trim();

    if (!emailProbablyExists(email)) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const validPassword = await user.comparePassword(req.body.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.status(200).json({ message: 'Login successful' });
    } catch (error) {
    return res.status(500).json({ error: 'Unable to log in' });
    }
});


// Forgot Password routes
router.post("/forgot-password/send-otp", authController.sendForgotPasswordOtp);
router.post("/forgot-password/verify-otp", authController.verifyForgotPasswordOtp);
router.post("/forgot-password/reset", authController.resetPassword);

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