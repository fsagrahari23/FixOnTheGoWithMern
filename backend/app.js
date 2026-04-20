'use strict';

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
const flash = require("connect-flash");
const passport = require("passport");
const fileUpload = require("express-fileupload");
const expressLayouts = require("express-ejs-layouts");
require("dotenv").config();
const cors = require("cors")
const helmet = require('helmet');
const isProduction = process.env.NODE_ENV === 'production';
const AppError = require("./utils/AppError");
const setupSwagger = require("./swagger");
const logger = require("./utils/Logger");
const { graphqlHTTP } = require("express-graphql");
const mechanicGraphQLSchema = require("./graphql/schema");
const mechanicResolvers = require("./graphql/resolvers");
const metricsMiddleware = require("./middleware/metircs.middleware")
const { register } = require("./metrics/prometheus");
const { connectRedis, getCacheStats, getIsConnected, disconnectRedis } = require("./config/redis");
// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const emergencyRoutes = require("./routes/emergency");
const mechanicRoutes = require("./routes/mechanic");
const adminRoutes = require("./routes/admin");
const staffRoutes = require("./routes/staff");
const chatRoutes = require("./routes/chat");
const paymentRoutes = require("./routes/payment");
const bookingRoutes = require("./routes/booking");
const notificationRoutes = require("./routes/notification");
const maintenanceRoutes = require("./routes/maintenance");

// Import middleware
const {
  isAuthenticated,
  isUser,
  isMechanic,
  isAdmin,
  isStaff,
} = require("./middleware/auth");

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
  }
});

// Trust proxy for cross-origin cookies in production (e.g., Render)
app.set('trust proxy', 1);

// Make io available to routes via app.get('io')
app.set('io', io);

// Connect to MongoDB (driver v4+ no longer needs deprecated options)
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Connect to Redis (non-blocking — app works without Redis)
connectRedis().catch((err) => {
  console.error("Redis connection failed (app will run without cache):", err.message);
});

// Set up session with MongoDB store
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction// Set to true in production with HTTPS
    }
  })
);

console.log(isProduction)
// File upload middleware (before express.json)
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: path.join(__dirname, 'tmp'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  abortOnLimit: true,
}));

// THEN parse normal JSON (for non-file routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (for debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Session User:`, req.session?.user?.email || 'Not logged in');
  next();
});

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "uploads")));
app.use(flash());

app.use(expressLayouts);
app.use((req, res, next) => {
  res.locals.path = req.path; // This makes `path` available in all views
  next();
});




// Pipe Morgan to Winston
// Create a stream for Morgan to write to Winston at 'http' level
const morgan = require('morgan');
morgan.token('message', (req, res) => res.statusMessage || ''); // Optional custom token
app.use(
  morgan(isProduction ? 'combined' : 'dev', {
    stream: {
      write: (message) => logger.http(message.trim()), // Log HTTP requests at 'http' level
    },
    skip: (req, _res) => {
      if (isProduction && req.path === '/health') {
        return true;
      }
      return false; // Log all in dev; customize as needed
    },
  })
);
app.set("layout", "layout");
app.use(metricsMiddleware);

app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.end(await register.metrics());
});
app.use((req, res, next) => {
  res.locals.path = req.path; // This makes `path` available in all views
  next();
});

// Security middleware
if (process.env.NODE_ENV === 'production') {
 app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
}



app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
 methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
require("./config/passport")(passport);

// Set global variables
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.options("*", cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));
// Swagger docs
setupSwagger(app);

// Redis health & stats endpoints
app.get("/api/redis/health", async (req, res) => {
  const stats = await getCacheStats();
  res.json({
    status: getIsConnected() ? "connected" : "disconnected",
    ...stats,
  });
});

app.get("/api/redis/flush", async (req, res) => {
  const { invalidateAllCaches } = require("./utils/cacheInvalidation");
  await invalidateAllCaches();
  res.json({ success: true, message: "All caches flushed" });
});

// Routes
app.use("/auth", authRoutes);
app.use("/user", isAuthenticated, isUser, userRoutes);
app.use("/user", isAuthenticated, isUser, bookingRoutes);
app.use("/user", isAuthenticated, isUser, emergencyRoutes);
app.use("/user", isAuthenticated, isUser, maintenanceRoutes);

app.use("/mechanic", isAuthenticated, isMechanic, mechanicRoutes);
app.use("/staff", isAuthenticated, isStaff, staffRoutes);

// Mechanic GraphQL endpoint
app.use(
  "/mechanic/graphql",
  isAuthenticated,
  isMechanic,
  graphqlHTTP((req) => ({
    schema: mechanicGraphQLSchema,
    graphiql: process.env.NODE_ENV !== "production",
    context: {
      user: req.user,
      flash: {
        success_msg: req.flash ? req.flash("success_msg") || [] : [],
        error_msg: req.flash ? req.flash("error_msg") || [] : [],
        error: req.flash ? req.flash("error") || [] : [],
      },
      resolvers: mechanicResolvers,
    },
  }))
);
app.use("/admin", isAuthenticated, isAdmin, adminRoutes);
app.use("/staff", isAuthenticated, isStaff, staffRoutes);
app.use("/chat", isAuthenticated, chatRoutes);
app.use("/payment", isAuthenticated, paymentRoutes);
app.use("/api/notifications", isAuthenticated, notificationRoutes);

// Home route
app.get("/", (req, res) => {
  res.render("index", { title: "Bike Assistance System", layout: false });
});

require("./socket")(io);
// Global error handler
app.use((err, req, res, _next) => {
  // Normalize to AppError
  let error = err instanceof AppError ? err : new AppError(err.message || 'An unexpected error occurred', err.statusCode || 500, { cause: err });

  // Handle specific error types
  if (err.name === 'CastError') {
    error = AppError.notFound('Resource not found');
  }
  if (err.code === 11000) {
    error = AppError.badRequest('Duplicate field value entered', { data: { fields: err.keyValue } });
  }
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message).join('; ');
    error = AppError.badRequest(messages, { code: 'VALIDATION_ERROR', data: { errors: err.errors } });
  }
  if (err.name === 'JsonWebTokenError') {
    error = AppError.unauthorized('Invalid token', { code: 'AUTH_ERROR' });
  }
  if (err.name === 'TokenExpiredError') {
    error = AppError.unauthorized('Token expired', { code: 'AUTH_ERROR' });
  }

  // For non-operational errors, use generic message
  if (!error.isOperational) {
    error.message = 'Internal Server Error';
    error.statusCode = 500;
    error.isOperational = true;
  }

  // Log the error with Winston
  logger.error('Application error', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    user: req.user ? req.user.id : 'unauthenticated', // Example: log user if authenticated
    ...(error.data && { data: error.data }),
  });

  // Send response
  res.status(error.statusCode).json(error.toJSON(isProduction));
});

// Start server

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT} in ${isProduction ? 'production' : 'development'} mode`);
  logger.info(`Swagger Docs at http://localhost:${PORT}/api-docs`);
  logger.info(`Redis Health at http://localhost:${PORT}/api/redis/health`);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received — shutting down gracefully`);
  await disconnectRedis();
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));