module.exports = {
  isAuthenticated: (req, res, next) => {
    if (req.session.user) {
      req.user = req.session.user;
      return next();
    }
    return res.status(401).json({ message: "Please log in to access this resource" });
  },

  isUser: (req, res, next) => {
    if (req.session.user && req.session.user.role === "user") {
      req.user = req.session.user;
      return next();
    }
    return res.status(403).json({ message: "Not authorized as a user" });
  },

  isMechanic: (req, res, next) => {
    if (req.session.user && req.session.user.role === "mechanic") {
      if (!req.session.user.isApproved) {
        return res.status(403).json({ message: "Your account is pending approval by admin" });
      }
      req.user = req.session.user;
      return next();
    }
    return res.status(403).json({ message: "Not authorized as a mechanic" });
  },

  isAdmin: (req, res, next) => {
    if (req.session.user && req.session.user.role === "admin") {
      req.user = req.session.user;
      return next();
    }
    return res.status(403).json({ message: "Not authorized as an admin" });
  },

  isStaff: (req, res, next) => {
    if (req.session.user && req.session.user.role === "staff") {
      req.user = req.session.user;
      return next();
    }
    return res.status(403).json({ message: "Not authorized as staff" });
  },

  isAdminOrStaff: (req, res, next) => {
    if (req.session.user && (req.session.user.role === "admin" || req.session.user.role === "staff")) {
      req.user = req.session.user;
      return next();
    }
    return res.status(403).json({ message: "Not authorized. Admin or staff access required." });
  },

  // Middleware to check if staff needs to change password
  checkPasswordChange: (req, res, next) => {
    if (req.session.user && req.session.user.mustChangePassword) {
      return res.status(403).json({ 
        message: "You must change your password before accessing this resource",
        mustChangePassword: true 
      });
    }
    return next();
  },
};

