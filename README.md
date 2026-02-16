# Vehicle Assistance System - Comprehensive Documentation

## Project Information

- **Group ID**: 28
- **Project Title**: fixOnTheGo
- **Single Point of Contact (SPOC)**:
  - Gautam Chauhan (S20230010089) -> gautam.c23@iiits.in
- **Team Members & Roles**:
  - Vasudev Dilware (S20230010253) -> Mechanic Dashboard
  - Gautam Chauhan (S20230010089) -> Admin dashboard
  - Monu Agrahari (S20230010148) -> User dashboard, workflow and Database management
  - Geeda Sai Vyshnav (S20230010090) -> Authorisation and Role based Authentication
  - Guna Shekhar (S20230010155) -> Payments and Subscriptions

## Table of Contents
1. [Introduction](#introduction)
2. [Project Overview](#project-overview)
3. [Technologies Used](#technologies-used)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Key Features](#key-features)
7. [Express.js Setup](#expressjs-setup)
8. [MongoDB and Mongoose](#mongodb-and-mongoose)
9. [Passport Authentication](#passport-authentication)
10. [Socket.io Real-time Features](#socketio-real-time-features)
11. [Cloudinary File Uploads](#cloudinary-file-uploads)
12. [Stripe Payment Processing](#stripe-payment-processing)
13. [EJS Templating Engine](#ejs-templating-engine)
14. [Geospatial Queries](#geospatial-queries)
15. [Session Management](#session-management)
16. [API Integration Examples](#api-integration-examples)
17. [Conclusion](#conclusion)

## Introduction

Welcome to the Bike Assistance System! This comprehensive documentation will guide you through understanding and working with this full-stack Node.js application. Whether you're a beginner learning web development or an experienced developer exploring new technologies, this guide will help you understand how various libraries and frameworks work together to create a robust bike assistance platform.

## Project Overview

The Bike Assistance System is a web application that connects bike owners with mechanics for on-demand repair services. The system includes:

- **User Registration and Authentication**: Users can register as customers or mechanics
- **Booking System**: Customers can book mechanic services
- **Real-time Chat**: Communication between users and mechanics
- **Location Services**: GPS-based mechanic tracking and location-based searches
- **Payment Processing**: Secure payments through Stripe
- **File Uploads**: Document verification for mechanics
- **Admin Dashboard**: System management and approval workflows

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js with Local Strategy
- **Real-time Communication**: Socket.io
- **File Storage**: Cloudinary
- **Payment Processing**: Stripe
- **Templating**: EJS with Express EJS Layouts
- **Session Management**: express-session with connect-mongo
- **Geospatial Queries**: MongoDB 2dsphere indexes
- **Password Hashing**: bcryptjs
- **File Uploads**: express-fileupload

## Installation

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v5.0 or higher) - [Download here](https://www.mongodb.com/try/download/community) or use MongoDB Atlas
- **npm** or **yarn** - Package manager (comes with Node.js)
- **Git** - For cloning the repository

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd FixOnTheGoWithMern
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

This will install all backend dependencies including:
- Express.js, Mongoose, Socket.io
- Passport.js for authentication
- Cloudinary for file uploads
- Stripe for payments
- And other required packages

### Step 3: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

This will install all frontend dependencies including:
- React, Redux Toolkit
- React Router DOM
- Tailwind CSS
- Lucide React icons
- And other required packages

### Step 4: Configure Environment Variables

#### Backend Configuration

Create a `.env` file in the `backend` directory:

```bash
cd backend
touch .env  # On Windows: type nul > .env
```

Add the following environment variables to `backend/.env`:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/fixonthego?retryWrites=true&w=majority

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Stripe Configuration (for payments)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# Twilio Configuration (for SMS/OTP)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token

# Email Configuration (for OTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
```

#### Frontend Configuration (Optional)

If you need to configure API endpoints, create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

### Step 5: Set Up Third-Party Services

#### MongoDB Setup

**Option 1: Local MongoDB**
1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```
3. Use connection string: `mongodb://localhost:27017/fixonthego`

**Option 2: MongoDB Atlas (Recommended)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create database user with password
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get connection string and add to `.env`

#### Cloudinary Setup

1. Create account at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret
4. Add to `.env` file

#### Stripe Setup

1. Create account at [Stripe](https://stripe.com/)
2. Go to Developers → API Keys
3. Copy Secret Key and Publishable Key (use test keys for development)
4. Add to `.env` file

#### Email Setup (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate App Password:
   - Go to Google Account → Security → 2-Step Verification
   - Scroll to "App passwords"
   - Generate password for "Mail"
3. Add email and app password to `.env`

## How to Run the Application

### Development Mode

#### Method 1: Run Backend and Frontend Separately (Recommended)

**Terminal 1 - Backend Server:**
```bash
cd backend
npm start
# Or for development with auto-restart:
npm run dev
```

The backend server will start on `http://localhost:3000`

**Terminal 2 - Frontend Development Server:**
```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173` (or another port if 5173 is busy)

#### Method 2: Run Both Concurrently

From the root directory:
```bash
# Install concurrently if not already installed
npm install -g concurrently

# Run both servers
npm run dev
```

### Production Mode

#### Build Frontend

```bash
cd frontend
npm run build
```

This creates an optimized production build in `frontend/dist`

#### Serve Production Build

**Option 1: Serve from Backend**
```bash
cd backend
# Copy frontend build to backend public folder
cp -r ../frontend/dist ./public/dist

# Start backend server
npm start
```

**Option 2: Deploy Separately**
- Deploy backend to services like Heroku, Railway, or DigitalOcean
- Deploy frontend to Vercel, Netlify, or AWS S3

### Accessing the Application

Once both servers are running:

1. **Frontend Application**: Open browser and navigate to `http://localhost:5173`
2. **Backend API**: Available at `http://localhost:3000`

### Default Routes

- **Home Page**: `http://localhost:5173/`
- **User Login**: `http://localhost:5173/auth/login`
- **User Registration**: `http://localhost:5173/auth/register`
- **Mechanic Registration**: `http://localhost:5173/auth/register-mechanic`
- **User Dashboard**: `http://localhost:5173/user/dashboard`
- **Mechanic Dashboard**: `http://localhost:5173/mechanic/dashboard`
- **Admin Dashboard**: `http://localhost:5173/admin/dashboard`

### Initial Setup & Testing

#### 1. Create Admin Account

First user registered as admin needs to be created manually in database:

```javascript
// Connect to MongoDB and run:
db.users.updateOne(
  { email: "admin@fixonthego.com" },
  { 
    $set: { 
      role: "admin",
      isApproved: true,
      isActive: true
    }
  }
)
```

Or register normally and update via MongoDB Compass/Shell.

#### 2. Register Test Accounts

- **User Account**: Register at `/auth/register`
- **Mechanic Account**: Register at `/auth/register-mechanic` (requires admin approval)

#### 3. Test Features

1. **User Flow**:
   - Register/Login as user
   - Create a booking request
   - Select nearby mechanic
   - Track booking status
   - Make payment
   - Rate service

2. **Mechanic Flow**:
   - Register as mechanic
   - Wait for admin approval
   - Login and view service requests
   - Accept booking
   - Update booking status
   - Complete service

3. **Admin Flow**:
   - Login as admin
   - Approve/reject mechanic registrations
   - View all bookings
   - Manage users
   - View payments and subscriptions

## Configuration

### Environment Variables
The application uses environment variables for sensitive configuration:
- Database connection strings
- API keys for third-party services
- Session secrets
- Port configuration

### Database Configuration
MongoDB connection is established in `app.js`:
```javascript
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
```

## Key Features

- **Role-based Access Control**: User, Mechanic, and Admin roles
- **Real-time Updates**: Live booking status and chat
- **Location Tracking**: GPS-based mechanic location updates
- **Secure Payments**: Stripe integration with discount handling
- **File Management**: Cloudinary integration for document uploads
- **Geospatial Search**: Location-based mechanic discovery
- **Session Persistence**: MongoDB-backed session storage

## Express.js Setup

Express.js is the core web framework that handles HTTP requests, middleware, and routing.

### Basic Setup (from app.js)
```javascript
const express = require("express");
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/auth", authRoutes);
app.use("/user", isAuthenticated, isUser, userRoutes);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Key Concepts:
- **Middleware**: Functions that process requests before they reach route handlers
- **Routing**: Organizing endpoints by functionality (auth, user, mechanic, admin)
- **Static Files**: Serving CSS, JS, and images from the public directory
- **View Engine**: EJS for server-side rendering

## MongoDB and Mongoose

MongoDB is our NoSQL database, and Mongoose provides schema-based modeling.

### Connection Setup
```javascript
// In app.js
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));
```

### User Schema Example (models/User.js)
```javascript
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "mechanic", "admin"], default: "user" },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [77.209, 28.6139] },
  },
  // ... other fields
});

// Create geospatial index
UserSchema.index({ location: "2dsphere" });

// Password hashing middleware
UserSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
```

### Key Concepts:
- **Schemas**: Define document structure and validation
- **Models**: Constructors for creating and querying documents
- **Middleware**: Pre/post hooks for operations
- **Indexes**: Improve query performance (especially geospatial)

## Passport Authentication

Passport.js handles user authentication with various strategies.

### Configuration (config/passport.js)
```javascript
const LocalStrategy = require("passport-local").Strategy;

module.exports = (passport) => {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      const user = await User.findOne({ email });
      if (!user) return done(null, false, { message: "Email not registered" });

      const isMatch = await user.comparePassword(password);
      if (isMatch) return done(null, user);
      else return done(null, false, { message: "Password incorrect" });
    })
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
  });
};
```

### Usage in Routes (routes/auth.js)
```javascript
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/auth/redirect",
    failureRedirect: "/auth/login",
    failureFlash: true,
  })(req, res, next);
});
```

### Key Concepts:
- **Strategies**: Different authentication methods (local, OAuth, etc.)
- **Serialization**: Converting user object to session ID
- **Deserialization**: Converting session ID back to user object
- **Middleware**: Protecting routes with authentication checks

## Socket.io Real-time Features

Socket.io enables real-time bidirectional communication.

### Server Setup (socket.js)
```javascript
module.exports = (io) => {
  const onlineUsers = {};

  io.on("connection", (socket) => {
    // User authentication
    socket.on("authenticate", async (userId) => {
      socket.userId = userId;
      onlineUsers[userId] = socket.id;
    });

    // Real-time chat
    socket.on("send-message", async (data) => {
      const { chatId, content } = data;
      // Save to database and broadcast
      io.to(chatId).emit("new-message", { chatId, message });
    });

    // Booking status updates
    socket.on("booking-update", async (data) => {
      const { bookingId, status } = data;
      // Update database and notify users
      notifyUsers.forEach(userId => {
        if (onlineUsers[userId]) {
          io.to(onlineUsers[userId]).emit("booking-status-changed", { bookingId, status });
        }
      });
    });
  });
};
```

### Key Concepts:
- **Connection Management**: Tracking online users
- **Rooms**: Grouping sockets for targeted messaging
- **Events**: Custom events for different functionalities
- **Real-time Updates**: Instant notifications and status changes

## Cloudinary File Uploads

Cloudinary handles file storage and optimization.

### Configuration (config/cloudinary.js)
```javascript
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
```

### Usage in Routes (routes/auth.js)
```javascript
// Upload mechanic documents
const documents = [];
if (Array.isArray(req.files.documents)) {
  for (const file of req.files.documents) {
    const result = await cloudinary.uploader.upload(file.tempFilePath);
    documents.push(result.secure_url);
  }
}
```

### Key Concepts:
- **File Upload**: Handling multipart form data
- **Cloud Storage**: Secure file storage with CDN
- **Optimization**: Automatic image optimization and transformation
- **Security**: Secure URLs and access controls

## Stripe Payment Processing

Stripe handles secure payment processing.

### Payment Processing (routes/payment.js)
```javascript
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Create payment intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(amountToCharge * 100), // Convert to cents
  currency: "usd",
  payment_method: paymentMethodId,
  confirm: true,
  description: `Payment for booking #${booking._id}`,
});
```

### Subscription Handling
```javascript
// Premium subscription payment
const paymentIntent = await stripe.paymentIntents.create({
  amount: plan === "monthly" ? 999 : 9999, // $9.99 or $99.99
  currency: "usd",
  payment_method: paymentMethodId,
  confirm: true,
  description: `Premium ${plan} subscription`,
});
```

### Key Concepts:
- **Payment Intents**: Secure payment flow
- **Currency Handling**: Amount conversion and formatting
- **Discounts**: Subscription-based pricing tiers
- **Webhooks**: Handling payment confirmations

## EJS Templating Engine

EJS renders dynamic HTML on the server.

### Setup in app.js
```javascript
const expressLayouts = require("express-ejs-layouts");

app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("layout", "layout");
```

### Layout Template (views/layout.ejs)
```html
<!DOCTYPE html>
<html>
<head>
  <title><%= title %></title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <%- include('partials/navbar') %>
  <main>
    <%- body %>
  </main>
</body>
</html>
```

### Key Concepts:
- **Layouts**: Consistent page structure
- **Partials**: Reusable components
- **Server-side Rendering**: Dynamic content generation
- **Template Inheritance**: Extending base layouts

## Geospatial Queries

MongoDB's geospatial features enable location-based queries.

### Schema Setup (models/User.js)
```javascript
location: {
  type: { type: String, enum: ["Point"], default: "Point" },
  coordinates: { type: [Number], default: [77.209, 28.6139] },
}

// Create 2dsphere index
UserSchema.index({ location: "2dsphere" });
```

### Location-based Queries
```javascript
// Find nearby mechanics
const mechanics = await User.find({
  role: "mechanic",
  location: {
    $near: {
      $geometry: { type: "Point", coordinates: [longitude, latitude] },
      $maxDistance: 5000, // 5km radius
    },
  },
});
```

### Key Concepts:
- **2dsphere Index**: For accurate Earth-based calculations
- **GeoJSON**: Standard format for geospatial data
- **Distance Queries**: Finding nearby locations
- **Validation**: Ensuring valid coordinates

## Session Management

Express-session with MongoDB store for persistent sessions.

### Setup in app.js
```javascript
const session = require("express-session");
const MongoStore = require("connect-mongo");

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
}));
```

### Key Concepts:
- **Session Store**: Persistent storage in MongoDB
- **Security**: Secure session secrets and cookie options
- **Flash Messages**: Temporary messages across requests
- **User Context**: Storing user data in session

## API Integration Examples

### Authentication Flow
1. User submits login form
2. Passport authenticates credentials
3. Session created and stored in MongoDB
4. User redirected based on role

### Booking Flow
1. User creates booking request
2. System finds nearby mechanics using geospatial queries
3. Real-time notifications sent via Socket.io
4. Mechanic accepts and location tracking begins
5. Payment processed through Stripe upon completion

### File Upload Flow
1. Mechanic uploads certification documents
2. Files processed by express-fileupload
3. Uploaded to Cloudinary for storage
4. URLs stored in MongoDB
5. Admin reviews and approves mechanic account

## Available NPM Scripts

### Backend Scripts

```bash
# Start the server (production)
npm start

# Start with nodemon (development - auto-restart on changes)
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

### Frontend Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint code
npm run lint
```

## Troubleshooting

### Common Issues and Solutions

#### 1. MongoDB Connection Issues

**Error**: `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions**:
- Check if MongoDB service is running
- Verify `MONGODB_URI` in `.env` file
- For MongoDB Atlas: Check IP whitelist and network access
- Ensure correct username/password in connection string

```bash
# Test MongoDB connection
mongosh "your-connection-string"
```

#### 2. Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions**:
```bash
# Find process using the port
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Or change port in backend/.env
PORT=3001
```

#### 3. Environment Variables Not Loading

**Solutions**:
- Check `.env` file is in correct directory (`backend/.env`)
- Verify `.env` file has no syntax errors
- Restart the server after changing `.env`
- Check for spaces around `=` sign (should be `KEY=value` not `KEY = value`)

#### 4. CORS Issues

**Error**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Solutions**:
- Ensure backend CORS is configured properly
- Check frontend is making requests to correct API URL
- Verify `withCredentials: true` is set in axios requests

#### 5. Cloudinary Upload Fails

**Solutions**:
- Verify Cloudinary credentials in `.env`
- Check file size limits (default: 10MB)
- Ensure API key has upload permissions
- Check internet connection

#### 6. Stripe Payment Errors

**Solutions**:
- Verify using test keys in development (prefix: `sk_test_`, `pk_test_`)
- Check Stripe API version compatibility
- Ensure webhook endpoints are configured (for production)
- Test with Stripe test card: `4242 4242 4242 4242`

#### 7. Socket.io Connection Issues

**Solutions**:
- Check backend Socket.io server is running
- Verify correct Socket.io URL in frontend
- Check for CORS configuration in Socket.io setup
- Clear browser cache and cookies

#### 8. OTP Email Not Sending

**Solutions**:
- Verify Gmail app password (not regular password)
- Check 2FA is enabled on Gmail account
- Ensure less secure app access is enabled (if using old Gmail)
- Check spam folder for test emails
- Verify `EMAIL_USER` and `EMAIL_PASS` in `.env`

#### 9. Build Errors

**Frontend Build Errors**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
npm run dev
```

**Backend Build Errors**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 10. Session Issues / Auto Logout

**Solutions**:
- Check MongoDB connection (sessions stored in DB)
- Verify `SESSION_SECRET` is set in `.env`
- Clear browser cookies
- Check session expiry settings in backend

### Getting Help

If you encounter issues not covered here:

1. Check the console logs (both browser and terminal)
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed (`npm install`)
4. Check MongoDB and other services are running
5. Review the [Issues](https://github.com/your-repo/issues) page
6. Contact the development team

## Performance Optimization Tips

### Backend Optimization

1. **Enable Compression**:
```javascript
const compression = require('compression');
app.use(compression());
```

2. **Database Indexing**:
```javascript
// Add indexes for frequently queried fields
UserSchema.index({ email: 1 });
BookingSchema.index({ status: 1, createdAt: -1 });
```

3. **Caching**:
```javascript
// Use Redis for session storage in production
const RedisStore = require('connect-redis')(session);
```

### Frontend Optimization

1. **Code Splitting**: Lazy load routes
```javascript
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

2. **Image Optimization**: Use Cloudinary transformations
```javascript
// Add to image URLs
?w=400&h=300&c=fill&q_auto&f_auto
```

3. **Bundle Analysis**:
```bash
npm run build -- --analyze
```

## Security Best Practices

### Environment Variables
- Never commit `.env` files to version control
- Use different keys for development and production
- Rotate secrets regularly in production

### Password Security
- Minimum 6 characters enforced
- Passwords hashed with bcrypt (10 salt rounds)
- Never log or display passwords

### Session Security
- Secure cookies in production (HTTPS only)
- HTTP-only cookies to prevent XSS
- Session timeout after inactivity

### API Security
- Rate limiting on authentication routes
- Input validation and sanitization
- SQL injection prevention via Mongoose
- XSS protection with proper encoding

## Deployment Guide

### Backend Deployment (Heroku Example)

```bash
# Login to Heroku
heroku login

# Create app
heroku create fixonthego-api

# Set environment variables
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set SESSION_SECRET=your-secret
# ... set all other env variables

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Frontend Deployment (Vercel Example)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel --prod

# Set environment variables in Vercel dashboard
```

### Database Deployment

- Use MongoDB Atlas for production database
- Enable authentication and IP whitelisting
- Regular backups enabled
- Monitor database performance

## Conclusion

The Bike Assistance System demonstrates how multiple Node.js libraries can work together to create a comprehensive web application. Each technology serves a specific purpose:

- **Express.js**: Web framework and API routing
- **MongoDB/Mongoose**: Data storage and modeling
- **Passport**: User authentication
- **Socket.io**: Real-time communication
- **Cloudinary**: File management
- **Stripe**: Payment processing
- **EJS**: Template rendering
- **Geospatial Queries**: Location services
- **Session Management**: User state persistence

This modular approach allows for maintainable, scalable code where each library handles its specialty while integrating seamlessly with others. The documentation above provides practical examples from the actual codebase to help you understand both individual components and their interactions.

For further development or modifications, refer to the official documentation of each library and experiment with the provided code examples. Happy coding!
