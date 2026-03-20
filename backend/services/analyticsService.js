/**
 * Analytics Service - Reusable MongoDB aggregation queries
 * Clean, modular functions for dashboard analytics
 */

const Booking = require("../models/Booking")
const Subscription = require("../models/Subscription")
const User = require("../models/User")
const MechanicProfile = require("../models/MechanicProfile")
const mongoose = require("mongoose")

const toObjectId = (id) => {
  if (!id) return null
  if (id instanceof mongoose.Types.ObjectId) return id
  if (typeof id === "string" && mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id)
  }
  if (id?._id && mongoose.Types.ObjectId.isValid(id._id)) {
    return new mongoose.Types.ObjectId(id._id)
  }
  return null
}

// ==================== ADMIN ANALYTICS ====================

/**
 * Get top problem categories by booking count and revenue
 */
const getTopProblems = async (limit = 10) => {
  const result = await Booking.aggregate([
    {
      $group: {
        _id: { $ifNull: ["$problemCategory", "Other"] },
        count: { $sum: 1 },
        revenue: {
          $sum: {
            $cond: [
              { $eq: ["$payment.status", "completed"] },
              "$payment.amount",
              0
            ]
          }
        },
        completedCount: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
        },
        cancelledCount: {
          $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
        }
      }
    },
    { $sort: { count: -1 } },
    { $limit: limit },
    {
      $project: {
        category: "$_id",
        count: 1,
        revenue: 1,
        completedCount: 1,
        cancelledCount: 1,
        completionRate: {
          $cond: [
            { $gt: ["$count", 0] },
            { $multiply: [{ $divide: ["$completedCount", "$count"] }, 100] },
            0
          ]
        },
        _id: 0
      }
    }
  ])
  return result
}

/**
 * Get top mechanics by earnings, jobs, and rating
 */
const getTopMechanics = async (limit = 10) => {
  const result = await Booking.aggregate([
    { $match: { mechanic: { $ne: null } } },
    {
      $group: {
        _id: "$mechanic",
        totalJobs: { $sum: 1 },
        completedJobs: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
        },
        earnings: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$status", "completed"] },
                  { $eq: ["$payment.status", "completed"] }
                ]
              },
              "$payment.amount",
              0
            ]
          }
        },
        avgRating: { $avg: "$rating.value" },
        ratingsCount: {
          $sum: { $cond: [{ $gt: ["$rating.value", 0] }, 1, 0] }
        }
      }
    },
    { $sort: { earnings: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },
    {
      $lookup: {
        from: "mechanicprofiles",
        localField: "_id",
        foreignField: "user",
        as: "profile"
      }
    },
    { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        mechanicId: "$_id",
        name: "$user.name",
        email: "$user.email",
        totalJobs: 1,
        completedJobs: 1,
        earnings: 1,
        avgRating: { $round: [{ $ifNull: ["$avgRating", 0] }, 1] },
        ratingsCount: 1,
        specialization: { $ifNull: ["$profile.specialization", []] },
        completionRate: {
          $cond: [
            { $gt: ["$totalJobs", 0] },
            { $round: [{ $multiply: [{ $divide: ["$completedJobs", "$totalJobs"] }, 100] }, 1] },
            0
          ]
        },
        _id: 0
      }
    }
  ])
  return result
}

/**
 * Get repeat users (users with multiple bookings)
 */
const getRepeatUsers = async (limit = 10) => {
  const result = await Booking.aggregate([
    {
      $group: {
        _id: "$user",
        bookingCount: { $sum: 1 },
        totalSpent: {
          $sum: {
            $cond: [
              { $eq: ["$payment.status", "completed"] },
              "$payment.amount",
              0
            ]
          }
        },
        lastBooking: { $max: "$createdAt" },
        firstBooking: { $min: "$createdAt" },
        categories: { $addToSet: "$problemCategory" }
      }
    },
    { $match: { bookingCount: { $gt: 1 } } },
    { $sort: { bookingCount: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },
    {
      $project: {
        userId: "$_id",
        name: "$user.name",
        email: "$user.email",
        isPremium: "$user.isPremium",
        bookingCount: 1,
        totalSpent: 1,
        lastBooking: 1,
        firstBooking: 1,
        categories: 1,
        _id: 0
      }
    }
  ])
  return result
}

/**
 * Get booking trends over time (daily for last N days)
 */
const getBookingTrends = async (days = 30) => {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  startDate.setHours(0, 0, 0, 0)

  const result = await Booking.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          category: { $ifNull: ["$problemCategory", "Other"] }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.date": 1 } },
    {
      $group: {
        _id: "$_id.date",
        categories: {
          $push: { category: "$_id.category", count: "$count" }
        },
        total: { $sum: "$count" }
      }
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        date: "$_id",
        total: 1,
        categories: 1,
        _id: 0
      }
    }
  ])
  return result
}

/**
 * Get performance metrics (avg completion time, cancellation rate, ratings)
 */
const getPerformanceMetrics = async () => {
  const [bookingMetrics, ratingDistribution] = await Promise.all([
    Booking.aggregate([
      {
        $facet: {
          overall: [
            {
              $group: {
                _id: null,
                totalBookings: { $sum: 1 },
                completedBookings: {
                  $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
                },
                cancelledBookings: {
                  $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
                },
                avgRating: { $avg: "$rating.value" },
                totalRatings: {
                  $sum: { $cond: [{ $gt: ["$rating.value", 0] }, 1, 0] }
                }
              }
            }
          ],
          avgCompletionTime: [
            { $match: { status: "completed" } },
            {
              $project: {
                completionTimeHours: {
                  $divide: [
                    { $subtract: ["$updatedAt", "$createdAt"] },
                    1000 * 60 * 60
                  ]
                }
              }
            },
            {
              $group: {
                _id: null,
                avgHours: { $avg: "$completionTimeHours" }
              }
            }
          ]
        }
      }
    ]),
    Booking.aggregate([
      { $match: { "rating.value": { $gte: 1, $lte: 5 } } },
      {
        $group: {
          _id: "$rating.value",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ])

  const overall = bookingMetrics[0]?.overall[0] || {}
  const avgTime = bookingMetrics[0]?.avgCompletionTime[0]?.avgHours || 0

  return {
    totalBookings: overall.totalBookings || 0,
    completedBookings: overall.completedBookings || 0,
    cancelledBookings: overall.cancelledBookings || 0,
    completionRate: overall.totalBookings
      ? ((overall.completedBookings / overall.totalBookings) * 100).toFixed(1)
      : 0,
    cancellationRate: overall.totalBookings
      ? ((overall.cancelledBookings / overall.totalBookings) * 100).toFixed(1)
      : 0,
    avgRating: overall.avgRating ? overall.avgRating.toFixed(1) : 0,
    totalRatings: overall.totalRatings || 0,
    avgCompletionTimeHours: avgTime.toFixed(1),
    ratingDistribution: ratingDistribution.map((r) => ({
      rating: r._id,
      count: r.count
    }))
  }
}

// ==================== MECHANIC ANALYTICS ====================

/**
 * Get mechanic's analytics data
 */
const getMechanicAnalytics = async (mechanicId) => {
  const normalizedMechanicId = toObjectId(mechanicId)

  if (!normalizedMechanicId) {
    return {
      earningsByCategory: [],
      monthlyEarnings: [],
      repeatCustomers: [],
      performance: {
        totalJobs: 0,
        completedJobs: 0,
        cancelledJobs: 0,
        completionRate: 0,
        avgRating: 0,
        totalRatings: 0,
        totalEarnings: 0
      }
    }
  }

  const [
    earningsByCategory,
    monthlyEarnings,
    repeatCustomers,
    performanceStats
  ] = await Promise.all([
    // Earnings by problem category
    Booking.aggregate([
      {
        $match: {
          mechanic: normalizedMechanicId,
          status: "completed",
          "payment.status": "completed"
        }
      },
      {
        $group: {
          _id: { $ifNull: ["$problemCategory", "Other"] },
          earnings: { $sum: "$payment.amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { earnings: -1 } },
      {
        $project: {
          category: "$_id",
          earnings: 1,
          count: 1,
          _id: 0
        }
      }
    ]),

    // Monthly earnings trend (last 6 months)
    Booking.aggregate([
      {
        $match: {
          mechanic: normalizedMechanicId,
          status: "completed",
          "payment.status": "completed",
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          earnings: { $sum: "$payment.amount" },
          jobs: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          month: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              {
                $cond: [
                  { $lt: ["$_id.month", 10] },
                  { $concat: ["0", { $toString: "$_id.month" }] },
                  { $toString: "$_id.month" }
                ]
              }
            ]
          },
          earnings: 1,
          jobs: 1,
          _id: 0
        }
      }
    ]),

    // Repeat customers
    Booking.aggregate([
      { $match: { mechanic: normalizedMechanicId, status: "completed" } },
      {
        $group: {
          _id: "$user",
          visits: { $sum: 1 },
          totalSpent: {
            $sum: {
              $cond: [
                { $eq: ["$payment.status", "completed"] },
                "$payment.amount",
                0
              ]
            }
          },
          lastVisit: { $max: "$createdAt" }
        }
      },
      { $match: { visits: { $gt: 1 } } },
      { $sort: { visits: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          name: "$user.name",
          visits: 1,
          totalSpent: 1,
          lastVisit: 1,
          _id: 0
        }
      }
    ]),

    // Performance stats
    Booking.aggregate([
      { $match: { mechanic: normalizedMechanicId } },
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          completedJobs: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          },
          cancelledJobs: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
          },
          avgRating: { $avg: "$rating.value" },
          totalRatings: {
            $sum: { $cond: [{ $gt: ["$rating.value", 0] }, 1, 0] }
          },
          totalEarnings: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", "completed"] },
                    { $eq: ["$payment.status", "completed"] }
                  ]
                },
                "$payment.amount",
                0
              ]
            }
          }
        }
      }
    ])
  ])

  const stats = performanceStats[0] || {}

  return {
    earningsByCategory,
    monthlyEarnings,
    repeatCustomers,
    performance: {
      totalJobs: stats.totalJobs || 0,
      completedJobs: stats.completedJobs || 0,
      cancelledJobs: stats.cancelledJobs || 0,
      completionRate: stats.totalJobs
        ? ((stats.completedJobs / stats.totalJobs) * 100).toFixed(1)
        : 0,
      avgRating: stats.avgRating ? stats.avgRating.toFixed(1) : 0,
      totalRatings: stats.totalRatings || 0,
      totalEarnings: stats.totalEarnings || 0
    }
  }
}

// ==================== USER ANALYTICS ====================

/**
 * Get user's booking analytics
 */
const getUserAnalytics = async (userId) => {
  const normalizedUserId = toObjectId(userId)

  if (!normalizedUserId) {
    return {
      problemStats: [],
      spendingByCategory: [],
      monthlyActivity: [],
      summary: {
        totalBookings: 0,
        totalSpent: 0,
        mostCommonProblem: "None",
        highestSpendCategory: "None"
      }
    }
  }

  const [problemStats, spendingByCategory, monthlyActivity] = await Promise.all([
    // Problems faced (frequency)
    Booking.aggregate([
      { $match: { user: normalizedUserId } },
      {
        $group: {
          _id: { $ifNull: ["$problemCategory", "Other"] },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      {
        $project: {
          category: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]),

    // Spending by category
    Booking.aggregate([
      {
        $match: {
          user: normalizedUserId,
          "payment.status": "completed"
        }
      },
      {
        $group: {
          _id: { $ifNull: ["$problemCategory", "Other"] },
          spent: { $sum: "$payment.amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { spent: -1 } },
      {
        $project: {
          category: "$_id",
          spent: 1,
          count: 1,
          _id: 0
        }
      }
    ]),

    // Monthly activity (last 6 months)
    Booking.aggregate([
      {
        $match: {
          user: normalizedUserId,
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          bookings: { $sum: 1 },
          spent: {
            $sum: {
              $cond: [
                { $eq: ["$payment.status", "completed"] },
                "$payment.amount",
                0
              ]
            }
          }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          month: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              {
                $cond: [
                  { $lt: ["$_id.month", 10] },
                  { $concat: ["0", { $toString: "$_id.month" }] },
                  { $toString: "$_id.month" }
                ]
              }
            ]
          },
          bookings: 1,
          spent: 1,
          _id: 0
        }
      }
    ])
  ])

  // Calculate totals
  const totalSpent = spendingByCategory.reduce((sum, c) => sum + c.spent, 0)
  const totalBookings = problemStats.reduce((sum, p) => sum + p.count, 0)

  return {
    problemStats,
    spendingByCategory,
    monthlyActivity,
    summary: {
      totalBookings,
      totalSpent,
      mostCommonProblem: problemStats[0]?.category || "None",
      highestSpendCategory: spendingByCategory[0]?.category || "None"
    }
  }
}

module.exports = {
  // Admin
  getTopProblems,
  getTopMechanics,
  getRepeatUsers,
  getBookingTrends,
  getPerformanceMetrics,
  // Mechanic
  getMechanicAnalytics,
  // User
  getUserAnalytics
}
