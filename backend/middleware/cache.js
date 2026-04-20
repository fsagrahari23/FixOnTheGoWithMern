'use strict';

const { getCache, setCache, getIsConnected } = require('../config/redis');

/**
 * Express cache middleware factory.
 *
 * Usage:
 *   router.get('/api/dashboard', cacheMiddleware(60), handler);
 *   router.get('/api/analytics',  cacheMiddleware(300, (req) => `analytics:${req.user._id}`), handler);
 *
 * @param {number}   ttlSeconds   - Cache TTL in seconds (default 60)
 * @param {Function} keyGenerator - Optional custom key generator (req) => string
 * @returns Express middleware
 */
const cacheMiddleware = (ttlSeconds = 60, keyGenerator = null) => {
  return async (req, res, next) => {
    // Skip caching if Redis is not available
    if (!getIsConnected()) {
      return next();
    }

    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key
    const userId = req.user?._id?.toString() || 'anonymous';
    const cacheKey = keyGenerator
      ? `cache:${keyGenerator(req)}`
      : `cache:${req.baseUrl}${req.path}:${userId}`;

    try {
      // Check for cached response
      const cachedData = await getCache(cacheKey);

      if (cachedData) {
        // Cache HIT — return cached data
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey);
        res.setHeader('X-Cache-TTL', `${ttlSeconds}s`);
        return res.json(cachedData);
      }

      // Cache MISS — intercept res.json to cache the response
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('X-Cache-Key', cacheKey);

      const originalJson = res.json.bind(res);

      res.json = (data) => {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          setCache(cacheKey, data, ttlSeconds).catch(() => {
            // Silently fail — don't break the response
          });
        }
        return originalJson(data);
      };

      next();
    } catch {
      // If anything goes wrong with caching, proceed without it
      next();
    }
  };
};

module.exports = cacheMiddleware;
