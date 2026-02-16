const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staffController");
const { isStaff, checkPasswordChange } = require("../middleware/auth");

// All routes require staff authentication
// Password change route (accessible even with mustChangePassword = true)
router.post("/change-password", staffController.changePassword);

// Routes below require password to be changed first
router.use(checkPasswordChange);

// Dashboard
router.get("/dashboard", staffController.getDashboardData);

// Mechanic management
router.get("/mechanics/pending", staffController.getPendingMechanics);
router.get("/mechanic/:id", staffController.getMechanicDetails);
router.post("/mechanic/:id/approve", staffController.approveMechanic);
router.post("/mechanic/:id/reject", staffController.rejectMechanic);

// Dispute/Conflict resolution
router.get("/disputes", staffController.getDisputedBookings);
router.get("/booking/:id", staffController.getBookingDetails);
router.post("/dispute/:id/resolve", staffController.resolveDispute);
router.post("/booking/:id/flag", staffController.flagBookingDispute);

// Bookings
router.get("/bookings", staffController.getAllBookings);

// Payments
router.get("/payments", staffController.getPayments);
router.get("/payment/:id", staffController.getPaymentDetails);

module.exports = router;
