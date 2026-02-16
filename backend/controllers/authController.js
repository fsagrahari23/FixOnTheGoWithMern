const otpService = require("../services/otpService");
const cloudinary = require("../config/cloudinary");
const User = require("../models/User");
const MechanicProfile = require("../models/MechanicProfile");
const AppError = require("../utils/AppError");

exports.sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new AppError("Email is required for OTP verification.", 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError("Email is already registered.", 400));
    }

    const otp = otpService.generateOtp();
    await otpService.sendOtp(email, otp);

    req.session.otp = otp;
    req.session.email = email;

    res.json({ message: "OTP sent to your email. Please verify." });
  } catch (error) {
    console.error("Send OTP error:", error);
    next(new AppError("Failed to send OTP. Please try again.", 500));
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ message: "OTP is required." });
    }


    console.log("Session:", req.session); // Debug session
    if (otp === req.session.otp) {
      res.json({ message: "OTP verified successfully. Proceed with registration." });
    } else {
      res.status(400).json({ message: "Invalid OTP. Please try again." });
    }
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "OTP verification failed. Please try again." });
  }
};

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, address, latitude, longitude } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    if (email !== req.session.email) {
      return res.status(400).json({ message: "Email does not match the OTP-verified email." });
    }

    const userData = {
      name,
      email,
      password,
      phone: phone || "",
      role: "user",
      location: {
        coordinates: [parseFloat(longitude) || 77.209, parseFloat(latitude) || 28.6139],
        address: address || "",
      },
      isVerified: true,
      isApproved: true,
    };

    const newUser = new User(userData);
    await newUser.save();

    delete req.session.otp;
    delete req.session.email;

    res.json({ message: "User registration successful! Please log in." });
  } catch (error) {
    console.error("User registration error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email is already registered." });
    }
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
};

exports.registerMechanic = async (req, res) => {
  console.log("Mechanic registration request body:", req.body);
  try {
    const { name, email, password, phone, address, specialization, experience, hourlyRate, latitude, longitude, notes } = req.body;

    if (!name || !email || !password || !phone || !address || !specialization || !experience || !hourlyRate) {
      return res.status(400).json({ message: "All required fields must be provided." });
    }

    if (email !== req.session.email) {
      return res.status(400).json({ message: "Email does not match the OTP-verified email." });
    }

    let documentUrls = [];
    // Handle files uploaded via express-fileupload
    if (req.files && req.files.documents) {
      // Normalize to array (single file comes as object, multiple as array)
      const files = Array.isArray(req.files.documents) ? req.files.documents : [req.files.documents];
      
      for (const file of files) {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload(
            file.tempFilePath,
            { resource_type: "auto", folder: "mechanic-documents" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
        });
        documentUrls.push(result.secure_url);
      }
    }

    const userData = {
      name,
      email,
      password,
      phone,
      role: "mechanic",
      location: {
        coordinates: [parseFloat(longitude) || 77.209, parseFloat(latitude) || 28.6139],
        address,
      },
      isVerified: true,
      isApproved: false,
    };
    const newUser = new User(userData);
    await newUser.save();

    const mechanicData = {
      user: newUser._id,
      specialization: Array.isArray(specialization) ? specialization : [specialization],
      experience: parseInt(experience),
      hourlyRate: parseFloat(hourlyRate),
      documents: documentUrls,
      notes: notes || "",
    };
    const newMechanic = new MechanicProfile(mechanicData);
    await newMechanic.save();

    delete req.session.otp;
    delete req.session.email;

    res.json({ message: "Mechanic registration successful! Please wait for approval." });
  } catch (error) {
    console.error("Mechanic registration error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email is already registered." });
    }
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Your account is deactivated." });
    }

    // Store user data in session
    req.session.user = {
      _id: user._id,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      mustChangePassword: user.mustChangePassword || false,
    };

    // Determine redirect based on role
    let redirectUrl = "/dashboard";
    if (user.role === "mechanic" && !user.isApproved) {
      redirectUrl = "/auth/pending-approval";
    } else if (user.role === "mechanic") {
      redirectUrl = "/mechanic/profile";
    } else if (user.role === "admin") {
      redirectUrl = "/admin/users";
    } else if (user.role === "staff") {
      // Check if staff needs to change password
      if (user.mustChangePassword) {
        redirectUrl = "/staff/change-password";
      } else {
        redirectUrl = "/staff/dashboard";
      }
    }

    res.json({ 
      message: "Login successful!", 
      user: req.session.user, 
      redirectUrl,
      mustChangePassword: user.mustChangePassword || false
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Logout failed. Please try again." });
    }
    res.json({ message: "Logout successful!", redirectUrl: "/auth/login" });
  });
};

exports.getMe = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Not authenticated." });
    }
    res.json({ user: req.session.user });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ message: "Failed to fetch user data." });
  }
};

// Forgot Password - Send OTP
exports.sendForgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email address." });
    }

    const otp = otpService.generateOtp();
    await otpService.sendOtp(email, otp);

    req.session.forgotPasswordOtp = otp;
    req.session.forgotPasswordEmail = email;
    req.session.forgotPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    res.json({ message: "OTP sent to your email. Please verify." });
  } catch (error) {
    console.error("Send forgot password OTP error:", error);
    res.status(500).json({ message: "Failed to send OTP. Please try again." });
  }
};

// Verify Forgot Password OTP
exports.verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    if (email !== req.session.forgotPasswordEmail) {
      return res.status(400).json({ message: "Email does not match." });
    }

    if (Date.now() > req.session.forgotPasswordExpires) {
      delete req.session.forgotPasswordOtp;
      delete req.session.forgotPasswordEmail;
      delete req.session.forgotPasswordExpires;
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    if (otp === req.session.forgotPasswordOtp) {
      req.session.otpVerified = true;
      res.json({ message: "OTP verified successfully. You can now reset your password." });
    } else {
      res.status(400).json({ message: "Invalid OTP. Please try again." });
    }
  } catch (error) {
    console.error("Verify forgot password OTP error:", error);
    res.status(500).json({ message: "OTP verification failed. Please try again." });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required." });
    }

    if (email !== req.session.forgotPasswordEmail) {
      return res.status(400).json({ message: "Email does not match." });
    }

    if (!req.session.otpVerified) {
      return res.status(400).json({ message: "OTP not verified. Please verify OTP first." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.password = newPassword;
    await user.save();

    delete req.session.forgotPasswordOtp;
    delete req.session.forgotPasswordEmail;
    delete req.session.forgotPasswordExpires;
    delete req.session.otpVerified;

    res.json({ message: "Password reset successful! Please log in with your new password." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Password reset failed. Please try again." });
  }
};