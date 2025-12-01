const express = require("express")
const router = express.Router()
const User = require("../models/User")
const Booking = require("../models/Booking")
require("dotenv").config();

const Subscription = require("../models/Subscription")
const bcrypt = require("bcryptjs")

// Profile page
router.get("/profile", async (req, res) => {
    try {
        // Get subscription details
        const subscription = await Subscription.findOne({
            user: req.user._id,
            status: "active",
            expiresAt: { $gt: new Date() },
        }).sort({ createdAt: -1 })

        const isPremium = !!subscription

        // Get subscription history
        const subscriptionHistory = await Subscription.find({
            user: req.user._id,
        }).sort({ createdAt: -1 })

        // Get basic user booking count
        const activeBookingCount = await Booking.countDocuments({
            user: req.user._id,
            status: { $ne: "cancelled" }
        })

        // Calculate remaining bookings for basic users
        const remainingBookings = isPremium ? "Unlimited" : Math.max(0, 2 - activeBookingCount)

        const premiumFeatures = await User.findById(req.user._id).select("premiumFeatures")


        res.render("user/profile", {
            title: "My Profile",
        })
    } catch (error) {
        console.error("Profile page error:", error)
        req.flash("error_msg", "Failed to load profile")
        res.redirect("/user/dashboard")
    }
})

// Update profile
router.post("/profile", async (req, res) => {
    try {
        const {
            name,
            phone,
            address,
            latitude,
            longitude,
        } = req.body;

        // Validation
        if (
            !name ||
            !phone ||
            !address
        ) {
            req.flash("error_msg", "Please fill in all fields");
            return res.redirect("/user/profile");
        }

        // Update user
        await User.findByIdAndUpdate(req.user._id, {
            name,
            phone,
            address,
            location: {
                type: "Point",
                coordinates: [
                    Number.parseFloat(longitude) || 0,
                    Number.parseFloat(latitude) || 0,
                ],
            },
        });



        req.flash("success_msg", "Profile updated successfully");
        res.redirect("/user/profile");
    } catch (error) {
        console.error("Update profile error:", error);
        req.flash("error_msg", "Failed to update profile");
        res.redirect("/mechanic/profile");
    }
});


router.post("/change-password", async (req, res) => {
    // console.log(req.user)
    try {
        const { newPassword, currentPassword, confirmPassword } = req.body;
        if (!newPassword || !currentPassword || !confirmPassword) {
            req.flash("error_msg", "Please fill in all fields");
            return res.redirect("/user/profile");
        }
        const hashPassword = await bcrypt.hash(newPassword, 10);
        const user = await User.findById(req.user._id);
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            req.flash("error_msg", "Please enter correct password");
            return res.redirect("/user/profile");
        }

        await User.findByIdAndUpdate(req.user._id, {
            password: hashPassword
        })
        await user.save();
        req.flash("success_msg", "Profile updated successfully");
        res.redirect("/user/profile");
    } catch (error) {
        console.error("Update profile error:", error);
        req.flash("error_msg", "Failed to update password");
        res.redirect("/user/profile");
    }

})

// Profile API
router.get("/api/profile", async (req, res) => {
    try {
        // Get subscription details
        const subscription = await Subscription.findOne({
            user: req.user._id,
            status: "active",
            expiresAt: { $gt: new Date() },
        }).sort({ createdAt: -1 })

        const isPremium = !!subscription

        // Get subscription history
        const subscriptionHistory = await Subscription.find({
            user: req.user._id,
        }).sort({ createdAt: -1 })

        // Get basic user booking count
        const activeBookingCount = await Booking.countDocuments({
            user: req.user._id,
            status: { $ne: "cancelled" }
        })

        // Calculate remaining bookings for basic users
        const remainingBookings = isPremium ? "Unlimited" : Math.max(0, 2 - activeBookingCount)

        const premiumFeatures = await User.findById(req.user._id).select("premiumFeatures")

        res.json({
            user: req.user,
            subscription,
            subscriptionHistory,
            isPremium,
            remainingBookings,
            premiumFeatures: premiumFeatures.premiumFeatures
        })
    } catch (error) {
        console.error("Profile API error:", error)
        res.status(500).json({ error: "Failed to load profile data" })
    }
})

// Bookings count API (for profile)
router.get("/api/bookings/count", async (req, res) => {
    try {
        const count = await Booking.countDocuments({ user: req.user._id })
        res.json({ count })
    } catch (error) {
        console.error("Bookings count API error:", error)
        res.status(500).json({ error: "Failed to get booking count" })
    }
})

module.exports = router
