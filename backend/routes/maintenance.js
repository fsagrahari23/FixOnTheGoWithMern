const express = require("express")
const router = express.Router()
const User = require("../models/User")
const Booking = require("../models/Booking")
require("dotenv").config();

const Subscription = require("../models/Subscription")

// Request maintenance check (for yearly premium users)
router.get("/maintenance", async (req, res) => {
    try {
        // Check if user has maintenance checks feature
        const subscription = await Subscription.findOne({
            user: req.user._id,
            status: "active",
            expiresAt: { $gt: new Date() },
            "features.maintenanceChecks": true,
        })

        if (!subscription) {
            req.flash("error_msg", "Maintenance checks are only available for yearly premium subscribers")
            return res.redirect("/user/premium")
        }

        // Check if user has already scheduled maintenance this quarter
        const threeMonthsAgo = new Date()
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

        const recentMaintenance = await Booking.findOne({
            user: req.user._id,
            problemCategory: "Maintenance Check",
            createdAt: { $gte: threeMonthsAgo },
        })

        res.render("user/maintenance", {
            title: "Schedule Maintenance Check",
        })
    } catch (error) {
        console.error("Maintenance page error:", error)
        req.flash("error_msg", "Failed to load maintenance page")
        res.redirect("/user/dashboard")
    }
})

// Schedule maintenance check
router.post("/maintenance", async (req, res) => {
    try {
        // Check if user has maintenance checks feature
        const subscription = await Subscription.findOne({
            user: req.user._id,
            status: "active",
            expiresAt: { $gt: new Date() },
            "features.maintenanceChecks": true,
        })

        if (!subscription) {
            req.flash("error_msg", "Maintenance checks are only available for yearly premium subscribers")
            return res.redirect("/user/premium")
        }

        // Check if user has already scheduled maintenance this quarter
        const threeMonthsAgo = new Date()
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

        const recentMaintenance = await Booking.findOne({
            user: req.user._id,
            problemCategory: "Maintenance Check",
            createdAt: { $gte: threeMonthsAgo },
        })

        if (recentMaintenance) {
            req.flash("error_msg", "You have already scheduled a maintenance check in the last 3 months")
            return res.redirect("/user/maintenance")
        }

        const { preferredDate, notes, latitude, longitude, address } = req.body

        // Create maintenance booking
        const booking = new Booking({
            user: req.user._id,
            problemCategory: "Maintenance Check",
            description: `Quarterly maintenance check scheduled for ${preferredDate}. Notes: ${notes || "None"}`,
            location: {
                type: "Point",
                coordinates: [Number(longitude), Number(latitude)],
                address,
            },
            isPremiumBooking: true,
            priority: 1, // Medium priority
            notes: notes,
            status: "pending",
        })

        await booking.save()

        req.flash("success_msg", "Maintenance check scheduled successfully")
        res.redirect(`/user/booking/${booking._id}`)
    } catch (error) {
        console.error("Maintenance scheduling error:", error)
        req.flash("error_msg", "Failed to schedule maintenance check")
        res.redirect("/user/maintenance")
    }
})

// Maintenance API
router.get("/api/maintenance", async (req, res) => {
    try {
        const subscription = await Subscription.findOne({
            user: req.user._id,
            status: "active",
            expiresAt: { $gt: new Date() },
        })

        const recentMaintenance = await Booking.find({
            user: req.user._id,
            problemCategory: "Maintenance",
            status: { $in: ["completed", "cancelled"] }
        }).sort({ createdAt: -1 }).limit(5)

        res.json({
            user: req.user,
            subscription,
            recentMaintenance,
        })
    } catch (error) {
        console.error("Maintenance API error:", error)
        res.status(500).json({ error: "Failed to load maintenance data" })
    }
})

module.exports = router
