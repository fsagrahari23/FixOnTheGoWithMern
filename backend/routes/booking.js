const express = require("express")
const router = express.Router()
const User = require("../models/User")
const Booking = require("../models/Booking")
const Chat = require("../models/Chat")
require("dotenv").config();

const Subscription = require("../models/Subscription")
const cloudinary = require("../config/cloudinary")
const MechanicProfile = require("../models/MechanicProfile")

// Middleware to check for basic user booking limits
const checkBookingLimits = async (req, res, next) => {
    try {
        // Skip for premium users
        const subscription = await Subscription.findOne({
            user: req.user._id,
            status: "active",
            expiresAt: { $gt: new Date() },
        })

        if (subscription) {
            return next() // Premium users have no limits
        }

        // For basic users, check the limit (2 bookings)
        const bookingCount = await Booking.countDocuments({
            user: req.user._id,
            status: { $ne: "cancelled" } // Don't count cancelled bookings
        })

        if (bookingCount >= 2) {
            req.flash("error_msg", "Basic users can only have 2 active bookings. Please upgrade to premium for unlimited bookings.")
            return res.redirect("/user/premium")
        }

        // If within limits, proceed
        next()
    } catch (error) {
        console.error("Error checking booking limits:", error)
        req.flash("error_msg", "An error occurred. Please try again.")
        return res.redirect("/user/dashboard")
    }
}

// New booking page
router.get("/book", checkBookingLimits, async (req, res) => {
    res.render("user/book", {
        title: "Book a Mechanic",
    })
})

// Create new booking
router.post("/book", checkBookingLimits, async (req, res) => {
    try {
        const {
            problemCategory,
            description,
            address,
            latitude,
            longitude,
            requiresTowing,
            pickupAddress,
            pickupLatitude,
            pickupLongitude,
            dropoffAddress,
            dropoffLatitude,
            dropoffLongitude,
            emergencyRequest,
        } = req.body

        // Validation
        if (!problemCategory || !description || !address) {
            req.flash("error_msg", "Please fill in all required fields")
            return res.redirect("/user/book")
        }

        // Validate coordinates
        const lat = Number.parseFloat(latitude)
        const lng = Number.parseFloat(longitude)

        if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            req.flash("error_msg", "Invalid location coordinates. Please select a valid location.")
            return res.redirect("/user/book")
        }

        // Check if emergency request is available for user
        let canRequestEmergency = false
        if (emergencyRequest === "on") {
            const subscription = await Subscription.findOne({
                user: req.user._id,
                status: "active",
                expiresAt: { $gt: new Date() },
                "features.emergencyAssistance": true,
            })

            if (!subscription) {
                req.flash("error_msg", "Emergency assistance is only available for yearly premium subscribers.")
                return res.redirect("/user/book")
            }
            canRequestEmergency = true
        }

        // Check for premium status to set priority
        const subscription = await Subscription.findOne({
            user: req.user._id,
            status: "active",
            expiresAt: { $gt: new Date() },
        })

        const isPremium = !!subscription

        // Upload images if any
        const images = []
        if (req.files && req.files.images) {
            if (Array.isArray(req.files.images)) {
                // Multiple images
                for (const file of req.files.images) {
                    const result = await cloudinary.uploader.upload(file.tempFilePath)
                    images.push(result.secure_url)
                }
            } else {
                // Single image
                const result = await cloudinary.uploader.upload(req.files.images.tempFilePath)
                images.push(result.secure_url)
            }
        }

        // Create new booking
        const bookingData = {
            user: req.user._id,
            problemCategory,
            description,
            images,
            location: {
                type: "Point",
                coordinates: [lng, lat], // MongoDB uses [longitude, latitude] format
                address,
            },
            requiresTowing: requiresTowing === "on",
            isPremiumBooking: isPremium,
            priority: isPremium ? (canRequestEmergency ? 2 : 1) : 0, // Higher priority for premium and emergency
            emergencyRequest: emergencyRequest === "on" && canRequestEmergency,
        }

        // Add towing details if required
        if (requiresTowing === "on") {
            const dropoffLat = Number.parseFloat(dropoffLatitude)
            const dropoffLng = Number.parseFloat(dropoffLongitude)

            if (
                isNaN(dropoffLat) ||
                isNaN(dropoffLng) ||
                (dropoffLat === 0 && dropoffLng === 0) ||
                dropoffLat < -90 ||
                dropoffLat > 90 ||
                dropoffLng < -180 ||
                dropoffLng > 180
            ) {
                req.flash("error_msg", "Invalid dropoff location coordinates. Please select a valid dropoff location.")
                return res.redirect("/user/book")
            }

            // Use pickup coordinates from form or default to main location
            const pickupLat = Number.parseFloat(pickupLatitude) || lat
            const pickupLng = Number.parseFloat(pickupLongitude) || lng

            bookingData.towingDetails = {
                pickupLocation: {
                    type: "Point",
                    coordinates: [pickupLng, pickupLat], // MongoDB uses [longitude, latitude] format
                    address: pickupAddress || address,
                },
                dropoffLocation: {
                    type: "Point",
                    coordinates: [dropoffLng, dropoffLat], // MongoDB uses [longitude, latitude] format
                    address: dropoffAddress,
                },
                status: "pending",
            }
        }

        const newBooking = new Booking(bookingData)
        await newBooking.save()

        // Update basic booking count for non-premium users
        if (!isPremium) {
            await User.findByIdAndUpdate(req.user._id, {
                $inc: { basicBookingsUsed: 1 },
            })
        }

        res.json({ success: true, message: "Booking created successfully", bookingId: newBooking._id })
    } catch (error) {
        console.error("Create booking error:", error)
        res.status(500).json({ success: false, message: `Failed to create booking: ${error.message}` })
    }
})

// View booking details
router.get("/booking/:id", async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate("mechanic", "name phone")
            .populate("user", "name phone")

        if (!booking) {
            req.flash("error_msg", "Booking not found")
            return res.redirect("/user/dashboard")
        }

        // Check if user is authorized to view this booking
        if (booking.user._id.toString() !== req.user._id.toString()) {
            req.flash("error_msg", "Not authorized")
            return res.redirect("/user/dashboard")
        }

        // Get nearby mechanics if booking is pending
        let nearbyMechanics = []
        if (booking.status === "pending") {
            // Get mechanics sorted by distance, with preference for premium bookings
            const geoNearPipeline = [
                {
                    $geoNear: {
                        near: {
                            type: "Point",
                            coordinates: booking.location.coordinates,
                        },
                        distanceField: "distance",
                        maxDistance: 10000, // 10km
                        spherical: true,
                    },
                },
                {
                    $match: {
                        role: "mechanic",
                        isApproved: true,
                    },
                },
                {
                    $sort: {
                        distance: 1,
                    },
                },
                {
                    $limit: 10,
                },
            ]

            nearbyMechanics = await User.aggregate(geoNearPipeline)
        }

        // Get chat if exists
        const chat = await Chat.findOne({ booking: booking._id })

        // Get subscription status
        const subscription = await Subscription.findOne({
            user: req.user._id,
            status: "active",
            expiresAt: { $gt: new Date() },
        })
        const isPremium = !!subscription

        // Get free towing count for premium users
        let freeTowingRemaining = 0
        if (isPremium && subscription.features.freeTowing > 0) {
            // Count how many bookings have used free towing
            const usedTowingCount = await Booking.countDocuments({
                user: req.user._id,
                requiresTowing: true,
                "payment.discountApplied": { $gt: 0 },
                createdAt: { $gte: subscription.startDate },
            })
            freeTowingRemaining = Math.max(0, subscription.features.freeTowing - usedTowingCount)
        }
        console.log(booking,
            nearbyMechanics,
            chat,
            isPremium,
            subscription,
            freeTowingRemaining,)

        res.render("user/booking-details", {
            title: "Booking Details",
            booking,
            nearbyMechanics,
            chat,
            user: req.user,
            isPremium,
            subscription,
            freeTowingRemaining,
        })
    } catch (error) {
        console.error("View booking error:", error)
        req.flash("error_msg", "Failed to load booking details")
        res.redirect("/user/dashboard")
    }
})

// Select mechanic for booking
router.post("/booking/:id/select-mechanic", async (req, res) => {
    try {
        const { mechanicId } = req.body

        const booking = await Booking.findById(req.params.id)

        if (!booking) {
            req.flash("error_msg", "Booking not found")
            return res.redirect("/user/dashboard")
        }

        // Check if user is authorized
        if (booking.user.toString() !== req.user._id.toString()) {
            req.flash("error_msg", "Not authorized")
            return res.redirect("/user/dashboard")
        }

        // Check if booking is in pending state
        if (booking.status !== "pending") {
            req.flash("error_msg", "Booking is not in pending state")
            return res.redirect(`/user/booking/${booking._id}`)
        }

        // Update booking with selected mechanic
        booking.mechanic = mechanicId
        await booking.save()

        // Create a chat for this booking
        const newChat = new Chat({
            booking: booking._id,
            participants: [req.user._id, mechanicId],
        })

        await newChat.save()

        // send json data 
        return res.json({ success: true, message: "Mechanic selected successfully" })
    } catch (error) {
        console.error("Select mechanic error:", error)
        req.flash("error_msg", "Failed to select mechanic")
        res.redirect(`/user/booking/${req.params.id}`)
    }
})

// Cancel booking
router.post("/booking/:id/cancel", async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)

        if (!booking) {
            req.flash("error_msg", "Booking not found")
            return res.redirect("/user/dashboard")
        }

        // Check if user is authorized
        if (booking.user.toString() !== req.user._id.toString()) {
            req.flash("error_msg", "Not authorized")
            return res.redirect("/user/dashboard")
        }

        // Check if booking can be cancelled
        if (!["pending", "accepted"].includes(booking.status)) {
            req.flash("error_msg", "Cannot cancel booking at this stage")
            return res.redirect(`/user/booking/${booking._id}`)
        }

        // Update booking status
        booking.status = "cancelled"
        booking.updatedAt = new Date()
        await booking.save()

        // If this was a basic user booking, decrement the count
        const subscription = await Subscription.findOne({
            user: req.user._id,
            status: "active",
            expiresAt: { $gt: new Date() },
        })

        if (!subscription) {
            await User.findByIdAndUpdate(req.user._id, {
                $inc: { basicBookingsUsed: -1 },
            })
        }

        // return json
        return res.json({ success: true, message: "Booking cancelled successfully" })
    } catch (error) {
        console.error("Cancel booking error:", error)
        req.flash("error_msg", "Failed to cancel booking")
        res.redirect(`/user/booking/${req.params.id}`)
    }
})

// Rate mechanic/service
router.post("/booking/:id/rate", async (req, res) => {
    try {
        const { rating, comment, recommend } = req.body

        if (!rating) {
            return res.status(400).json({ success: false, message: "Rating is required" })
        }

        const booking = await Booking.findById(req.params.id)

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" })
        }

        // Check if user is authorized
        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized" })
        }

        // Check if booking is completed and paid
        if (booking.status !== "completed" || booking.payment.status !== "completed") {
            return res.status(400).json({ success: false, message: "Cannot rate until service is completed and paid" })
        }

        // Check if already rated
        if (booking.rating && booking.rating.value) {
            return res.status(400).json({ success: false, message: "You have already rated this service" })
        }

        // Add rating to booking
        booking.rating = {
            value: Number.parseInt(rating, 10),
            comment: comment,
            recommend: recommend === "1" || recommend === "on" || recommend === true,
            createdAt: new Date(),
        }

        await booking.save()

        // Update mechanic profile rating
        const mechanicProfile = await MechanicProfile.findOne({ user: booking.mechanic })

        if (mechanicProfile) {
            // Add the new review
            mechanicProfile.reviews.push({
                user: req.user._id,
                booking: booking._id,
                rating: Number.parseInt(rating, 10),
                comment: comment,
                recommend: recommend === "1" || recommend === "on" || recommend === true,
                date: new Date(),
            })

            // Calculate new average rating
            const totalRating = mechanicProfile.reviews.reduce((sum, review) => sum + review.rating, 0)
            mechanicProfile.rating = totalRating / mechanicProfile.reviews.length

            await mechanicProfile.save()
        }

        return res.status(200).json({ success: true, message: "Rating submitted successfully" })
    } catch (error) {
        console.error("Rate mechanic error:", error)
        return res.status(500).json({ success: false, message: "Server error" })
    }
})

// View booking history
router.get("/history", async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id }).populate("mechanic", "name").sort({ createdAt: -1 })

        const subscription = await Subscription.findOne({
            user: req.user._id,
            status: "active",
            expiresAt: { $gt: new Date() },
        })
        const isPremium = !!subscription

        // Get basic user booking count
        const activeBookingCount = await Booking.countDocuments({
            user: req.user._id,
            status: { $ne: "cancelled" }
        })

        // Calculate remaining bookings for basic users
        const remainingBookings = isPremium ? "Unlimited" : Math.max(0, 2 - activeBookingCount)

        res.render("user/history", {
            title: "Booking History",
        })
    } catch (error) {
        console.error("Booking history error:", error)
        req.flash("error_msg", "Failed to load booking history")
        res.redirect("/user/dashboard")
    }
})

// API Endpoints for client-side data fetching

// History API
router.get("/api/history", async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id }).populate("mechanic", "name").sort({ createdAt: -1 })

        const subscription = await Subscription.findOne({
            user: req.user._id,
            status: "active",
            expiresAt: { $gt: new Date() },
        })
        const isPremium = !!subscription

        // Get basic user booking count
        const activeBookingCount = await Booking.countDocuments({
            user: req.user._id,
            status: { $ne: "cancelled" }
        })

        // Calculate remaining bookings for basic users
        const remainingBookings = isPremium ? "Unlimited" : Math.max(0, 2 - activeBookingCount)

        res.json({
            bookings,
            user: req.user,
            isPremium,
            subscription,
            remainingBookings,
        })
    } catch (error) {
        console.error("History API error:", error)
        res.status(500).json({ error: "Failed to load booking history" })
    }
})

// Book API
router.get("/api/book", async (req, res) => {
    try {
        const subs = await Subscription.findOne({ user: req.user._id, status: "active", expiresAt: { $gt: new Date() } })

        res.json({
            user: req.user,
            isPremium: !!subs,
            plan: subs?.plan
        })
    } catch (error) {
        console.error("Book API error:", error)
        res.status(500).json({ error: "Failed to load book data" })
    }
})

// Booking details API
router.get("/api/booking/:id", async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate("mechanic", "name phone")
            .populate("user", "name phone")

        if (!booking) {
            req.flash("error_msg", "Booking not found")
            return res.redirect("/user/dashboard")
        }

        // Check if user is authorized to view this booking
        if (booking.user._id.toString() !== req.user._id.toString()) {
            req.flash("error_msg", "Not authorized")
            return res.redirect("/user/dashboard")
        }

        // Get nearby mechanics if booking is pending
        let nearbyMechanics = []
        if (booking.status === "pending") {
            // Get mechanics sorted by distance, with preference for premium bookings
            const geoNearPipeline = [
                {
                    $geoNear: {
                        near: {
                            type: "Point",
                            coordinates: booking.location.coordinates,
                        },
                        distanceField: "distance",
                        maxDistance: 10000, // 10km
                        spherical: true,
                    },
                },
                {
                    $match: {
                        role: "mechanic",
                        isApproved: true,
                    },
                },
                {
                    $sort: {
                        distance: 1,
                    },
                },
                {
                    $limit: 10,
                },
            ]

            nearbyMechanics = await User.aggregate(geoNearPipeline)
        }

        // Get chat if exists
        const chat = await Chat.findOne({ booking: booking._id })

        // Get subscription status
        const subscription = await Subscription.findOne({
            user: req.user._id,
            status: "active",
            expiresAt: { $gt: new Date() },
        })
        const isPremium = !!subscription

        // Get free towing count for premium users
        let freeTowingRemaining = 0
        if (isPremium && subscription.features.freeTowing > 0) {
            // Count how many bookings have used free towing
            const usedTowingCount = await Booking.countDocuments({
                user: req.user._id,
                requiresTowing: true,
                "payment.discountApplied": { $gt: 0 },
                createdAt: { $gte: subscription.startDate },
            })
            freeTowingRemaining = Math.max(0, subscription.features.freeTowing - usedTowingCount)
        }
        res.json({
            booking,
            nearbyMechanics,
            chat,
            user: req.user,
            isPremium,
            subscription,
            freeTowingRemaining,
        })
    } catch (error) {
        console.error("Booking details API error:", error)
        req.flash("error_msg", "Failed to load booking details")
        res.redirect("/user/dashboard")
    }
})

module.exports = router

