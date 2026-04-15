/**
 * Swagger/OpenAPI definitions file.
 * Contains all endpoint documentation grouped by service tags.
 * Referenced by swagger.js via the apis option.
 */

// ==================== TAG DEFINITIONS ====================
/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User registration, login, logout, OTP, and password reset
 *   - name: User - Dashboard
 *     description: User dashboard and profile management
 *   - name: User - Bookings
 *     description: Booking creation, management, and history
 *   - name: User - Premium
 *     description: Premium subscription management
 *   - name: User - Chat
 *     description: User chat and messaging
 *   - name: User - Emergency
 *     description: Emergency assistance for premium users
 *   - name: Mechanic
 *     description: Mechanic dashboard, bookings, profile, and availability
 *   - name: Admin - Dashboard
 *     description: Admin dashboard and statistics
 *   - name: Admin - Users
 *     description: Admin user management
 *   - name: Admin - Mechanics
 *     description: Admin mechanic management and approval
 *   - name: Admin - Bookings
 *     description: Admin booking management
 *   - name: Admin - Payments
 *     description: Admin payment and subscription management
 *   - name: Payment
 *     description: Payment processing (Stripe)
 *   - name: Notification
 *     description: Notification management
 *   - name: Chat
 *     description: Booking-based chat messaging
 *   - name: Staff
 *     description: Staff support, chat, mechanic verification, and disputes
 */

// ==================== SCHEMAS ====================
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         role:
 *           type: string
 *           enum: [user, mechanic, admin]
 *         isPremium:
 *           type: boolean
 *         premiumTier:
 *           type: string
 *           enum: [none, monthly, yearly]
 *         isApproved:
 *           type: boolean
 *     Booking:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           type: string
 *         mechanic:
 *           type: string
 *         problemCategory:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, accepted, in-progress, completed, cancelled]
 *         payment:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               enum: [pending, completed, refunded]
 *             amount:
 *               type: number
 *             transactionId:
 *               type: string
 *         requiresTowing:
 *           type: boolean
 *         isPriority:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *     MechanicProfile:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           type: string
 *         specialization:
 *           type: array
 *           items:
 *             type: string
 *         experience:
 *           type: integer
 *         rating:
 *           type: number
 *         availability:
 *           type: boolean
 *         hourlyRate:
 *           type: number
 *     Subscription:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           type: string
 *         plan:
 *           type: string
 *           enum: [monthly, yearly]
 *         amount:
 *           type: number
 *         status:
 *           type: string
 *           enum: [active, cancelled, expired]
 *         startDate:
 *           type: string
 *           format: date-time
 *         expiresAt:
 *           type: string
 *           format: date-time
 *     Notification:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         recipient:
 *           type: string
 *         type:
 *           type: string
 *         title:
 *           type: string
 *         message:
 *           type: string
 *         read:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 */

// ==================== AUTHENTICATION ====================
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
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Invalid email or already registered
 *
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP code
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [otp]
 *             properties:
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified
 *       400:
 *         description: Invalid or expired OTP
 *
 * /auth/register-user:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, phone]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 *
 * /auth/register-mechanic:
 *   post:
 *     summary: Register a new mechanic (with document uploads)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, email, password, phone, specialization, experience, hourlyRate]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               specialization:
 *                 type: array
 *                 items:
 *                   type: string
 *               experience:
 *                 type: integer
 *               hourlyRate:
 *                 type: number
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Mechanic registered (pending approval)
 *       400:
 *         description: Validation error
 *
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns user data and session cookie
 *       400:
 *         description: Invalid credentials
 *
 * /auth/logout:
 *   get:
 *     summary: Logout and destroy session
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logged out successfully
 *
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Current user data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 *
 * /auth/forgot-password/send-otp:
 *   post:
 *     summary: Send OTP for password reset
 *     tags: [Authentication]
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
 *     responses:
 *       200:
 *         description: OTP sent for password reset
 *
 * /auth/forgot-password/verify-otp:
 *   post:
 *     summary: Verify OTP for password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [otp]
 *             properties:
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified for password reset
 *
 * /auth/forgot-password/reset:
 *   post:
 *     summary: Reset password with new password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 */

// ==================== MECHANIC ====================
/**
 * @swagger
 * /mechanic/api/dashboard:
 *   get:
 *     summary: Get mechanic dashboard data
 *     tags: [Mechanic]
 *     description: Returns profile, bookings, stats, earnings, and nearby pending jobs
 *     responses:
 *       200:
 *         description: Dashboard data with stats, earnings, bookings
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not a mechanic
 *
 * /mechanic/api/booking/{id}:
 *   get:
 *     summary: Get booking details for mechanic
 *     tags: [Mechanic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking details with chat and profile
 *       404:
 *         description: Booking not found
 *       403:
 *         description: Not authorized
 *
 * /mechanic/booking/{id}/accept:
 *   post:
 *     summary: Accept a pending booking
 *     tags: [Mechanic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking accepted successfully
 *       400:
 *         description: Booking not in pending state
 *       404:
 *         description: Booking not found
 *
 * /mechanic/booking/{id}/start:
 *   post:
 *     summary: Start service on an accepted booking
 *     tags: [Mechanic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service started successfully
 *       400:
 *         description: Booking not in accepted state
 *       403:
 *         description: Not authorized
 *
 * /mechanic/booking/{id}/complete:
 *   post:
 *     summary: Complete service and set payment amount
 *     tags: [Mechanic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Service charge amount
 *               notes:
 *                 type: string
 *                 description: Service notes
 *     responses:
 *       200:
 *         description: Service completed successfully
 *       400:
 *         description: Missing amount or booking not in-progress
 *
 * /mechanic/api/history:
 *   get:
 *     summary: Get mechanic's job history
 *     tags: [Mechanic]
 *     responses:
 *       200:
 *         description: List of all bookings for this mechanic
 *
 * /mechanic/api/profile:
 *   get:
 *     summary: Get mechanic's profile data
 *     tags: [Mechanic]
 *     responses:
 *       200:
 *         description: Mechanic profile information
 *

// ==================== USER BOOKINGS ====================
/**
 * @swagger
 * /user/book:
 *   post:
 *     summary: Create a new booking
 *     tags: [User - Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [problemCategory, description, address, latitude, longitude]
 *             properties:
 *               problemCategory:
 *                 type: string
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               requiresTowing:
 *                 type: boolean
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Booking created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Basic user booking limit reached
 *
 * /user/api/booking/{id}:
 *   get:
 *     summary: Get booking details (JSON API)
 *     tags: [User - Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking details with nearby mechanics, chat, premium status
 *
 * /user/booking/{id}/select-mechanic:
 *   post:
 *     summary: Select a mechanic for a pending booking
 *     tags: [User - Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [mechanicId]
 *             properties:
 *               mechanicId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mechanic selected successfully
 *
 * /user/booking/{id}/cancel:
 *   post:
 *     summary: Cancel a booking (pending or accepted only)
 *     tags: [User - Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking cancelled
 *
 * /user/booking/{id}/rate:
 *   post:
 *     summary: Rate a completed booking
 *     tags: [User - Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating]
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *               recommend:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Rating submitted
 *       400:
 *         description: Already rated or booking not completed
 *
 * /user/api/history:
 *   get:
 *     summary: Get user's booking history (JSON API)
 *     tags: [User - Bookings]
 *     responses:
 *       200:
 *         description: List of bookings with premium status
 *
 * /user/api/book:
 *   get:
 *     summary: Get booking page data (premium status)
 *     tags: [User - Bookings]
 *     responses:
 *       200:
 *         description: User info and premium status
 */

// ==================== USER PREMIUM ====================
/**
 * @swagger
 * /user/api/premium:
 *   get:
 *     summary: Get premium subscription data
 *     tags: [User - Premium]
 *     responses:
 *       200:
 *         description: Subscription details and premium status
 *
 * /user/premium/subscribe:
 *   post:
 *     summary: Subscribe to a premium plan
 *     tags: [User - Premium]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [plan]
 *             properties:
 *               plan:
 *                 type: string
 *                 enum: [monthly, yearly]
 *     responses:
 *       200:
 *         description: Subscription page rendered
 *
 * /user/premium/cancel:
 *   post:
 *     summary: Cancel premium subscription
 *     tags: [User - Premium]
 *     responses:
 *       200:
 *         description: Subscription cancelled
 *       404:
 *         description: No active subscription found
 */

// ==================== USER CHAT ====================
/**
 * @swagger
 * /user/api/chat/{bookingId}:
 *   get:
 *     summary: Get or create chat for a booking
 *     tags: [User - Chat]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat details with booking
 *       404:
 *         description: Booking or chat not found
 *
 * /user/api/chat/{chatId}/send:
 *   post:
 *     summary: Send a message in a chat
 *     tags: [User - Chat]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent
 *
 * /user/api/chat/{chatId}/messages:
 *   get:
 *     summary: Get all messages in a chat
 *     tags: [User - Chat]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of messages
 *
 * /user/api/chat/unread/count:
 *   get:
 *     summary: Get unread message count
 *     tags: [User - Chat]
 *     responses:
 *       200:
 *         description: Unread message count
 */

// ==================== EMERGENCY ====================
/**
 * @swagger
 * /user/api/emergency:
 *   get:
 *     summary: Get emergency assistance data
 *     tags: [User - Emergency]
 *     responses:
 *       200:
 *         description: Emergency data with subscription info
 *
 * /user/emergency:
 *   post:
 *     summary: Submit emergency assistance request (premium yearly only)
 *     tags: [User - Emergency]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [latitude, longitude, address, problemDescription]
 *             properties:
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               address:
 *                 type: string
 *               problemDescription:
 *                 type: string
 *               contactNumber:
 *                 type: string
 *               urgencyLevel:
 *                 type: string
 *                 enum: [low, medium, high]
 *     responses:
 *       302:
 *         description: Redirects to booking page
 */

// ==================== PAYMENT ====================
/**
 * @swagger
 * /payment/premium/process:
 *   post:
 *     summary: Process premium subscription payment
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [plan, paymentDetails]
 *             properties:
 *               plan:
 *                 type: string
 *                 enum: [monthly, yearly]
 *               paymentDetails:
 *                 type: object
 *                 properties:
 *                   cardNumber:
 *                     type: string
 *                   expiryDate:
 *                     type: string
 *                   cvv:
 *                     type: string
 *     responses:
 *       200:
 *         description: Subscription payment successful
 *       400:
 *         description: Invalid plan or already subscribed
 *
 * /payment/{bookingId}/process:
 *   post:
 *     summary: Process booking payment via Stripe
 *     tags: [Payment]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [paymentMethodId]
 *             properties:
 *               paymentMethodId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment successful
 *       404:
 *         description: Booking not found
 *       403:
 *         description: Not authorized
 */

// ==================== NOTIFICATION ====================
/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get paginated notifications for current user
 *     tags: [Notification]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of notifications with pagination
 *   delete:
 *     summary: Delete all notifications (optionally only read ones)
 *     tags: [Notification]
 *     parameters:
 *       - in: query
 *         name: readOnly
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Notifications deleted
 *
 * /api/notifications/unread-count:
 *   get:
 *     summary: Get unread notification count
 *     tags: [Notification]
 *     responses:
 *       200:
 *         description: Unread count
 *
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notification]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 *
 * /api/notifications/mark-all-read:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notification]
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a single notification
 *     tags: [Notification]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification deleted
 *       404:
 *         description: Not found
 */

// ==================== CHAT (Booking-Based) ====================
/**
 * @swagger
 * /chat/{bookingId}/messages:
 *   get:
 *     summary: Get chat by booking ID (creates if absent)
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat details with messages
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Booking not found
 *
 * /chat/{chatId}/send:
 *   post:
 *     summary: Send a message in a chat
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               attachment:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Message sent
 *
 * /chat/{chatId}/all:
 *   get:
 *     summary: Get all messages in a chat
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of messages
 *
 * /chat/unread/count:
 *   get:
 *     summary: Get total unread message count across all chats
 *     tags: [Chat]
 *     responses:
 *       200:
 *         description: Unread message count
 */

// ==================== ADMIN ====================
/**
 * @swagger
 * /admin/api/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin - Dashboard]
 *     description: Returns user counts, booking stats, revenue, subscription stats
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *
 * /admin/api/users:
 *   get:
 *     summary: Get all users with premium and booking info
 *     tags: [Admin - Users]
 *     responses:
 *       200:
 *         description: List of users
 *
 * /admin/api/user/{id}:
 *   get:
 *     summary: Get user details with bookings and subscription
 *     tags: [Admin - Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 *
 * /admin/user/{id}/delete:
 *   post:
 *     summary: Delete user and all related data
 *     tags: [Admin - Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: User deleted, redirects
 *
 * /admin/user/{id}/toggle-premium:
 *   post:
 *     summary: Toggle user premium status
 *     tags: [Admin - Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Premium status toggled
 *
 * /admin/api/mechanics:
 *   get:
 *     summary: Get all mechanics (pending and approved)
 *     tags: [Admin - Mechanics]
 *     responses:
 *       200:
 *         description: List of mechanics with profiles
 *
 * /admin/api/mechanic/{id}:
 *   get:
 *     summary: Get mechanic details with profile and bookings
 *     tags: [Admin - Mechanics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mechanic details
 *
 * /admin/mechanic/{id}/approve:
 *   post:
 *     summary: Approve a pending mechanic
 *     tags: [Admin - Mechanics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mechanic approved
 *
 * /admin/mechanic/{id}/reject:
 *   post:
 *     summary: Reject and delete a mechanic
 *     tags: [Admin - Mechanics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Mechanic rejected
 *
 * /admin/mechanic/{id}/delete:
 *   post:
 *     summary: Delete an approved mechanic
 *     tags: [Admin - Mechanics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Mechanic deleted
 *
 * /admin/api/bookings:
 *   get:
 *     summary: Get all bookings with stats and trends
 *     tags: [Admin - Bookings]
 *     responses:
 *       200:
 *         description: All bookings with statistics
 *
 * /admin/api/booking/{id}:
 *   get:
 *     summary: Get booking details with available mechanics
 *     tags: [Admin - Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking details
 *
 * /admin/booking/{id}/assign-mechanic:
 *   post:
 *     summary: Assign a mechanic to a booking
 *     tags: [Admin - Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [mechanicId]
 *             properties:
 *               mechanicId:
 *                 type: string
 *     responses:
 *       302:
 *         description: Mechanic assigned
 *
 * /admin/booking/{id}/delete:
 *   post:
 *     summary: Delete a booking
 *     tags: [Admin - Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Booking deleted
 *
 * /admin/api/payments:
 *   get:
 *     summary: Get all payments and revenue stats
 *     tags: [Admin - Payments]
 *     responses:
 *       200:
 *         description: Payments with revenue totals
 *
 * /admin/api/subscriptions:
 *   get:
 *     summary: Get all subscriptions
 *     tags: [Admin - Payments]
 *     responses:
 *       200:
 *         description: List of subscriptions
 *
 * /admin/subscription/{id}/cancel:
 *   post:
 *     summary: Cancel a subscription
 *     tags: [Admin - Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription cancelled
 *
 * /admin/subscription/create:
 *   post:
 *     summary: Create subscription manually for a user
 *     tags: [Admin - Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, plan]
 *             properties:
 *               userId:
 *                 type: string
 *               plan:
 *                 type: string
 *                 enum: [monthly, yearly]
 *               duration:
 *                 type: integer
 *     responses:
 *       302:
 *         description: Subscription created
 */

// ==================== STAFF ====================
/**
 * @swagger
 * /staff/dashboard:
 *   get:
 *     summary: Get staff dashboard data
 *     tags: [Staff]
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *
 * /staff/change-password:
 *   post:
 *     summary: Change staff password
 *     tags: [Staff]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed
 *
 * /staff/chats:
 *   get:
 *     summary: Get all support chats assigned to staff
 *     tags: [Staff]
 *     responses:
 *       200:
 *         description: List of chats with unread counts
 *
 * /staff/chat/{chatId}:
 *   get:
 *     summary: Get specific chat messages
 *     tags: [Staff]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat messages
 *
 * /staff/chat/{chatId}/send:
 *   post:
 *     summary: Send message in support chat
 *     tags: [Staff]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent
 *
 * /staff/email/respond:
 *   post:
 *     summary: Send email response to a user
 *     tags: [Staff]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, message]
 *             properties:
 *               userId:
 *                 type: string
 *               message:
 *                 type: string
 *               subject:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email sent
 *
 * /staff/support-requests:
 *   get:
 *     summary: Get unread support requests
 *     tags: [Staff]
 *     responses:
 *       200:
 *         description: List of chats with unread messages
 *
 * /staff/mechanics/pending:
 *   get:
 *     summary: Get pending mechanic applications
 *     tags: [Staff]
 *     responses:
 *       200:
 *         description: List of pending mechanics
 *
 * /staff/mechanic/{id}/approve:
 *   post:
 *     summary: Approve a mechanic application
 *     tags: [Staff]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mechanic approved
 *
 * /staff/mechanic/{id}/reject:
 *   post:
 *     summary: Reject a mechanic application
 *     tags: [Staff]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mechanic rejected
 *
 * /staff/disputes:
 *   get:
 *     summary: Get disputed bookings
 *     tags: [Staff]
 *     responses:
 *       200:
 *         description: List of disputed bookings
 *
 * /staff/dispute/{id}/resolve:
 *   post:
 *     summary: Resolve a booking dispute
 *     tags: [Staff]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dispute resolved
 *
 * /staff/bookings:
 *   get:
 *     summary: Get all bookings (staff view)
 *     tags: [Staff]
 *     responses:
 *       200:
 *         description: List of all bookings
 *
 * /staff/payments:
 *   get:
 *     summary: Get payment records
 *     tags: [Staff]
 *     responses:
 *       200:
 *         description: Payment records
 */
