const express = require("express")
const router = express.Router()
const User = require("../models/User")
const Booking = require("../models/Booking")
require("dotenv").config();

const Subscription = require("../models/Subscription")

// User dashboard
router.get("/dashboard", async (req, res) => {
    try {
        // Get user's bookings
        const bookings = await Booking.find({ user: req.user._id })
            .populate("mechanic", "name phone")
            .sort({ createdAt: -1 })

        // Get stats
        const stats = {
            total: bookings.length,
            pending: bookings.filter((b) => b.status === "pending").length,
            inProgress: bookings.filter((b) => b.status === "in-progress").length,
            completed: bookings.filter((b) => b.status === "completed").length,
            cancelled: bookings.filter((b) => b.status === "cancelled").length,
        }

        // Get category-wise data
        const categories = {}
        bookings.forEach((booking) => {
            if (!categories[booking.problemCategory]) {
                categories[booking.problemCategory] = 0
            }
            categories[booking.problemCategory]++
        })

        // Get user's subscription status
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

        // Calculate remaining bookings for basic users
        const remainingBookings = subscription ? "Unlimited" : Math.max(0, 2 - activeBookingCount)

        res.render("user/dashboard", {
            title: "User Dashboard",
        })
    } catch (error) {
        console.error("User dashboard error:", error)
        req.flash("error_msg", "Failed to load dashboard")
        res.redirect("/")
    }
})

// Dashboard API
router.get("/api/dashboard", async (req, res) => {
    try {
        // Get user's bookings
        const bookings = await Booking.find({ user: req.user._id })
            .populate("mechanic", "name phone")
            .sort({ createdAt: -1 })

        // Get stats
        const stats = {
            total: bookings.length,
            pending: bookings.filter((b) => b.status === "pending").length,
            inProgress: bookings.filter((b) => b.status === "in-progress").length,
            completed: bookings.filter((b) => b.status === "completed").length,
            cancelled: bookings.filter((b) => b.status === "cancelled").length,
        }

        // Get category-wise data
        const categories = {}
        bookings.forEach((booking) => {
            if (!categories[booking.problemCategory]) {
                categories[booking.problemCategory] = 0
            }
            categories[booking.problemCategory]++
        })

        // Get user's subscription status
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

        // Calculate remaining bookings for basic users
        const remainingBookings = subscription ? "Unlimited" : Math.max(0, 2 - activeBookingCount)

        res.json({
            user: req.user,
            bookings,
            stats,
            categories,
            subscription,
            isPremium: !!subscription,
            remainingBookings,
        })
    } catch (error) {
        console.error("Dashboard API error:", error)
        res.status(500).json({ error: "Failed to load dashboard data" })
    }
})

module.exports = router
