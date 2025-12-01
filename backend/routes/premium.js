const express = require("express")
const router = express.Router()
const User = require("../models/User")
const Booking = require("../models/Booking")
require("dotenv").config();

const Subscription = require("../models/Subscription")

// View premium plans
router.get("/premium", async (req, res) => {
    try {
        // Check if user already has an active subscription
        const subscription = await Subscription.findOne({
            user: req.user._id,
            status: "active",
            expiresAt: { $gt: new Date() },
        })

        // Get basic user booking count
        const activeBookingCount = await Booking.countDocuments({
            user: req.user._id,
            status: { $ne: "cancelled" }
        })

        res.render("user/premium", {
            title: "Premium Plans",
            stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        })
    } catch (error) {
        console.error("Premium plans error:", error)
        req.flash("error_msg", "Failed to load premium plans")
        res.redirect("/user/dashboard")
    }
})

// Subscribe to premium - Stripe payment page
router.post("/premium/subscribe", async (req, res) => {
    try {
        const { plan } = req.body

        if (!["monthly", "yearly"].includes(plan)) {
            req.flash("error_msg", "Invalid plan selected")
            return res.redirect("/user/premium")
        }

        res.render("payment/subscription", {
            title: "Subscribe to Premium",
            user: req.user,
            plan,
            amount: plan === "monthly" ? 9.99 : 99.99,
            stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        })
    } catch (error) {
        console.error("Subscription page error:", error)
        req.flash("error_msg", "Failed to load subscription page")
        res.redirect("/user/premium")
    }
})

// Cancel premium subscription
router.post("/premium/cancel", async (req, res) => {
    try {
        // Find active subscription
        const subscription = await Subscription.findOne({
            user: req.user._id,
            status: "active",
            expiresAt: { $gt: new Date() },
        })

        if (!subscription) {
            req.flash("error_msg", "No active subscription found")
            return res.redirect("/user/profile")
        }

        // Update subscription
        subscription.status = "cancelled"
        subscription.cancelledAt = new Date()
        await subscription.save()

        // Update user's premium status
        await User.findByIdAndUpdate(req.user._id, {
            isPremium: false,
            premiumTier: "none",
            premiumFeatures: {
                priorityService: false,
                tracking: false,
                discounts: 0,
                emergencyAssistance: false,
                freeTowing: 0,
                maintenanceChecks: false,
            },
        })

        req.flash("success_msg", "Your premium subscription has been cancelled")
        res.redirect("/user/profile")
    } catch (error) {
        console.error("Cancel subscription error:", error)
        req.flash("error_msg", "Failed to cancel subscription")
        res.redirect("/user/profile")
    }
})

router.get("/premium/success", async (req, res) => {
    try {
        res.render("payment/subscription-success", {
            title: "Subscription Successful",
        })
    } catch (error) {
        console.error("Subscription success page error:", error)
        req.flash("error_msg", "Failed to load subscription success page")
        res.redirect("/user/premium")
    }
})

// Premium API
router.get("/api/premium", async (req, res) => {
    try {
        const subscription = await Subscription.findOne({
            user: req.user._id,
            status: "active",
            expiresAt: { $gt: new Date() },
        })

        const activeBookingCount = await Booking.countDocuments({
            user: req.user._id,
            status: { $ne: "cancelled" }
        })

        res.json({
            subscription,
            activeBookingCount,
            stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        })
    } catch (error) {
        console.error("Premium API error:", error)
        res.status(500).json({ error: "Failed to load premium data" })
    }
})

module.exports = router
