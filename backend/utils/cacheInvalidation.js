'use strict';

const { flushByPrefix } = require('../config/redis');
const logger = require('./Logger');

/**
 * Cache invalidation helpers.
 *
 * Each helper flushes all cache keys related to a specific domain entity.
 * Call these after any write operation (POST/PUT/DELETE) that mutates data.
 */

/**
 * Invalidate all caches for a specific user (dashboard, analytics, bookings, premium).
 */
const invalidateUserCache = async (userId) => {
  if (!userId) return;
  const id = userId.toString();
  await Promise.all([
    flushByPrefix(`cache:/user/api/dashboard:${id}`),
    flushByPrefix(`cache:/user/api/analytics:${id}`),
    flushByPrefix(`cache:/user/api/maintenance:${id}`),
    flushByPrefix(`cache:/user/api/premium:${id}`),
    flushByPrefix(`cache:user-analytics:${id}`),
    flushByPrefix(`cache:user-dashboard:${id}`),
  ]);
  logger.debug(`Cache invalidated for user: ${id}`);
};

/**
 * Invalidate all caches for a specific mechanic.
 */
const invalidateMechanicCache = async (mechanicId) => {
  if (!mechanicId) return;
  const id = mechanicId.toString();
  await Promise.all([
    flushByPrefix(`cache:/mechanic/api/dashboard:${id}`),
    flushByPrefix(`cache:/mechanic/api/history:${id}`),
    flushByPrefix(`cache:/mechanic/api/profile:${id}`),
    flushByPrefix(`cache:/mechanic/api/analytics:${id}`),
    flushByPrefix(`cache:mechanic-analytics:${id}`),
    flushByPrefix(`cache:mechanic-dashboard:${id}`),
  ]);
  logger.debug(`Cache invalidated for mechanic: ${id}`);
};

/**
 * Invalidate all admin-scoped caches (dashboard, users list, bookings, payments, etc.).
 */
const invalidateAdminCache = async () => {
  await Promise.all([
    flushByPrefix('cache:/admin/'),
    flushByPrefix('cache:admin-'),
  ]);
  logger.debug('Cache invalidated for admin');
};

/**
 * Invalidate all staff-scoped caches (analytics, dashboard).
 */
const invalidateStaffCache = async () => {
  await Promise.all([
    flushByPrefix('cache:/staff/'),
    flushByPrefix('cache:staff-'),
  ]);
  logger.debug('Cache invalidated for staff');
};

/**
 * Invalidate all caches related to a booking mutation.
 * This is the most common invalidation — call after accept, start, complete, cancel, rate.
 */
const invalidateBookingCaches = async (bookingUserId, mechanicId) => {
  const tasks = [
    invalidateAdminCache(),
    invalidateStaffCache(),
  ];

  if (bookingUserId) {
    tasks.push(invalidateUserCache(bookingUserId));
  }

  if (mechanicId) {
    tasks.push(invalidateMechanicCache(mechanicId));
  }

  await Promise.all(tasks);
  logger.debug('Cache invalidated for booking mutation');
};

/**
 * Nuclear option — flush the entire cache. Use sparingly.
 */
const invalidateAllCaches = async () => {
  await flushByPrefix('cache:');
  logger.debug('All caches invalidated');
};

module.exports = {
  invalidateUserCache,
  invalidateMechanicCache,
  invalidateAdminCache,
  invalidateStaffCache,
  invalidateBookingCaches,
  invalidateAllCaches,
};
