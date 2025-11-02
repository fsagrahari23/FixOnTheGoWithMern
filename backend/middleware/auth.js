module.exports = {
  isAuthenticated: (req, res, next) => {
    if (req.session.user) {
      return next();
    }
    return res.status(401).json({ message: "Please log in to access this resource" });
  },

  isUser: (req, res, next) => {
    if (req.session.user && req.session.user.role === "user") {
      return next();
    }
    return res.status(403).json({ message: "Not authorized as a user" });
  },

  isMechanic: (req, res, next) => {
    if (req.session.user && req.session.user.role === "mechanic") {
      if (!req.session.user.isApproved) {
        return res.status(403).json({ message: "Your account is pending approval by admin" });
      }
      return next();
    }
    return res.status(403).json({ message: "Not authorized as a mechanic" });
  },

  isAdmin: (req, res, next) => {
    if (req.session.user && req.session.user.role === "admin") {
      return next();
    }
    return res.status(403).json({ message: "Not authorized as an admin" });
  },
};