const express = require("express")
const router = express.Router()
const User = require("../models/User")
const Booking = require("../models/Booking")
require("dotenv").config();

const Subscription = require("../models/Subscription")

// Emergency assistance
router.get("/emergency", async (req, res) => {
    try {
        // Check if user has emergency assistance
        const subscription = await Subscription.findOne({
            user: req.user._id,
            status: "active",
            expiresAt: { $gt: new Date() },
            "features.emergencyAssistance": true,
        })

        if (!subscription) {
            req.flash("error_msg", "Emergency assistance is only available for yearly premium subscribers")
            return res.redirect("/user/premium")
        }

        res.render("user/emergency", {
            title: "Emergency Assistance",
        })
    } catch (error) {
        console.error("Emergency page error:", error)
        req.flash("error_msg", "Failed to load emergency assistance page")
        res.redirect("/user/dashboard")
    }
})

// Request emergency assistance
router.post("/emergency", async (req, res) => {
    try {
        // Check if user has emergency assistance
        const subscription = await Subscription.findOne({
            user: req.user._id,
            status: "active",
            expiresAt: { $gt: new Date() },
            "features.emergencyAssistance": true,
        })

        if (!subscription) {
            req.flash("error_msg", "Emergency assistance is only available for yearly premium subscribers")
            return res.redirect("/user/premium")
        }

        const { latitude, longitude, address, problemDescription, contactNumber, urgencyLevel } = req.body

        // Create emergency booking
        const booking = new Booking({
            user: req.user._id,
            problemCategory: "Emergency Assistance",
            description: problemDescription,
            location: {
                type: "Point",
                coordinates: [Number(longitude), Number(latitude)],
                address,
            },
            contactNumber,
            urgencyLevel,
            isPremiumBooking: true,
            priority: urgencyLevel === 'high' ? 2 : urgencyLevel === 'medium' ? 1 : 0, // Higher priority for higher urgency
            emergencyRequest: true,
            status: "pending",
        })

        await booking.save()

        // Notify nearby mechanics about emergency request
        const io = req.app.get('io');
        if (io && io.notifyNearbyMechanics) {
            await io.notifyNearbyMechanics(booking);
        }

        // Also notify admins about emergency request
        if (io && io.notifyAdmins) {
            await io.notifyAdmins({
                type: "emergency-request",
                title: "🚨 Emergency Request!",
                message: `${req.user.name} has submitted an emergency assistance request. Urgency: ${urgencyLevel}`,
                data: {
                    bookingId: booking._id,
                    userId: req.user._id,
                    link: `/admin/booking/${booking._id}`,
                    meta: { urgencyLevel },
                },
                priority: "urgent",
            });
        }

        req.flash("success_msg", "Emergency assistance request submitted. A mechanic will be assigned shortly.")
        res.redirect(`/user/booking/${booking._id}`)
    } catch (error) {
        console.error("Emergency request error:", error)
        req.flash("error_msg", "Failed to submit emergency request")
        res.redirect("/user/emergency")
    }
})

// Emergency API
router.get("/api/emergency", async (req, res) => {
    try {
        const subscription = await Subscription.findOne({
            user: req.user._id,
            status: "active",
            expiresAt: { $gt: new Date() },
        })

        // Get recent emergency bookings (pending or active)
        const recentEmergency = await Booking.find({
            user: req.user._id,
            emergencyRequest: true,
            status: { $in: ['pending', 'accepted', 'in-progress'] }
        }).sort({ createdAt: -1 }).limit(1)

        res.json({
            user: req.user,
            subscription,
            recentEmergency,
        })
    } catch (error) {
        console.error("Emergency API error:", error)
        res.status(500).json({ error: "Failed to load emergency data" })
    }
})

module.exports = router
