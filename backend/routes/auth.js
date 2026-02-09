const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: OTP-based authentication & registration
 */

/**
 * @swagger
 * /auth/send-otp:
 *   post:
 *     summary: Send OTP to email for registration
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@gmail.com
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Email missing or already registered
 *       500:
 *         description: OTP sending failed
 */
router.post("/send-otp", authController.sendOtp);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP sent to email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid or missing OTP
 *       500:
 *         description: OTP verification failed
 */
router.post("/verify-otp", authController.verifyOtp);

/**
 * @swagger
 * /auth/register-user:
 *   post:
 *     summary: Register user after OTP verification
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Rahul Sharma
 *               email:
 *                 type: string
 *                 example: rahul@gmail.com
 *               password:
 *                 type: string
 *                 example: Pass@123
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               address:
 *                 type: string
 *                 example: New Delhi
 *               latitude:
 *                 type: number
 *                 example: 28.6139
 *               longitude:
 *                 type: number
 *                 example: 77.209
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: OTP email mismatch or validation error
 *       500:
 *         description: Registration failed
 */
router.post("/register-user", authController.registerUser);

/**
 * @swagger
 * /auth/register-mechanic:
 *   post:
 *     summary: Register mechanic with documents (OTP required)
 *     tags: [Authentication]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - phone
 *               - address
 *               - specialization
 *               - experience
 *               - hourlyRate
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               specialization:
 *                 type: string
 *                 example: Bike Repair
 *               experience:
 *                 type: number
 *                 example: 5
 *               hourlyRate:
 *                 type: number
 *                 example: 300
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               notes:
 *                 type: string
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Mechanic registered (pending approval)
 *       400:
 *         description: Validation error or OTP mismatch
 *       500:
 *         description: Registration failed
 */
router.post("/register-mechanic", authController.registerMechanic);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user or mechanic (session-based)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account deactivated
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Logout current user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 *       500:
 *         description: Logout failed
 */
router.get("/logout", authController.logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get logged-in user info (session-based)
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: User data fetched
 *       401:
 *         description: Not authenticated
 */
router.get("/me", authMiddleware.isAuthenticated, authController.getMe);

module.exports = router;
