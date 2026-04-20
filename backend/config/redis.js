'use strict';

const { createClient } = require('redis');
const logger = require('../utils/Logger');

// ─── Redis Client Singleton ───────────────────────────────────────────────────
let client = null;
let isConnected = false;
let loggedConnectionFailure = false;

/**
 * Initialize and return the Redis client.
 * Safe to call multiple times — returns the existing client if already connected.
 */
const connectRedis = async () => {
  if (client && isConnected) return client;

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const redisRequired = process.env.REDIS_REQUIRED === 'true';

  client = createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy: (retries) => {
        // In optional mode (default), avoid retry loops and log noise when Redis is down.
        if (!redisRequired) {
          return false;
        }

        if (retries > 10) {
          logger.warn('Redis: Max reconnect attempts reached — running without cache');
          return false;
        }
        return Math.min(retries * 200, 3000); // exponential backoff, max 3s
      },
      connectTimeout: 5000,
    },
  });

  client.on('connect', () => {
    logger.info('🔗 Redis: Connecting...');
  });

  client.on('ready', () => {
    isConnected = true;
    loggedConnectionFailure = false;
    logger.info('✅ Redis: Connected and ready');
  });

  client.on('error', (err) => {
    const message = err && err.message ? err.message : String(err || 'unknown error');
    if (!loggedConnectionFailure) {
      logger.warn(`Redis unavailable (${message}). Continuing without cache.`);
      loggedConnectionFailure = true;
      return;
    }

    if (redisRequired) {
      logger.error(`Redis error: ${message}`);
    }
  });

  client.on('end', () => {
    isConnected = false;
    logger.warn('⚠️  Redis: Connection closed');
  });

  try {
    await client.connect();
  } catch (err) {
    const message = err && err.message ? err.message : String(err || 'unknown error');
    if (redisRequired) {
      logger.error(`Redis: Initial connection failed — ${message}`);
    } else if (!loggedConnectionFailure) {
      logger.warn(`Redis unavailable (${message}). Continuing without cache.`);
      loggedConnectionFailure = true;
    }
    isConnected = false;
  }

  return client;
};

/**
 * Get the current Redis client (may be null if not initialized).
 */
const getClient = () => client;

/**
 * Whether Redis is currently connected and usable.
 */
const getIsConnected = () => isConnected;

// ─── Cache Helpers ────────────────────────────────────────────────────────────

/**
 * Get a cached value by key. Returns parsed JSON or null.
 */
const getCache = async (key) => {
  try {
    if (!client || !isConnected) return null;
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    logger.error(`Redis GET error [${key}]:`, err.message);
    return null;
  }
};

/**
 * Set a cache entry with optional TTL (seconds). Default TTL = 60s.
 */
const setCache = async (key, data, ttlSeconds = 60) => {
  try {
    if (!client || !isConnected) return;
    await client.setEx(key, ttlSeconds, JSON.stringify(data));
  } catch (err) {
    logger.error(`Redis SET error [${key}]:`, err.message);
  }
};

/**
 * Delete a single cache key.
 */
const deleteCache = async (key) => {
  try {
    if (!client || !isConnected) return;
    await client.del(key);
  } catch (err) {
    logger.error(`Redis DEL error [${key}]:`, err.message);
  }
};

/**
 * Delete all cache keys matching a prefix (e.g. "cache:admin:*").
 * Uses SCAN to avoid blocking the server.
 */
const flushByPrefix = async (prefix) => {
  try {
    if (!client || !isConnected) return;

    let cursor = 0;
    let totalDeleted = 0;

    do {
      const result = await client.scan(cursor, { MATCH: `${prefix}*`, COUNT: 100 });
      cursor = result.cursor;
      const keys = result.keys;

      if (keys.length > 0) {
        await client.del(keys);
        totalDeleted += keys.length;
      }
    } while (cursor !== 0);

    if (totalDeleted > 0) {
      logger.debug(`Redis: Flushed ${totalDeleted} keys with prefix "${prefix}"`);
    }
  } catch (err) {
    logger.error(`Redis FLUSH error [${prefix}]:`, err.message);
  }
};

/**
 * Get cache statistics for the health endpoint.
 */
const getCacheStats = async () => {
  try {
    if (!client || !isConnected) {
      return { connected: false };
    }
    const info = await client.info('stats');
    const memoryInfo = await client.info('memory');
    const dbSize = await client.dbSize();

    // Parse key metrics from INFO output
    const getInfoValue = (infoStr, key) => {
      const match = infoStr.match(new RegExp(`${key}:(.+)`));
      return match ? match[1].trim() : 'N/A';
    };

    return {
      connected: true,
      totalKeys: dbSize,
      hits: getInfoValue(info, 'keyspace_hits'),
      misses: getInfoValue(info, 'keyspace_misses'),
      usedMemory: getInfoValue(memoryInfo, 'used_memory_human'),
      uptime: getInfoValue(info, 'uptime_in_seconds') + 's',
    };
  } catch (err) {
    logger.error('Redis stats error:', err.message);
    return { connected: false, error: err.message };
  }
};

/**
 * Gracefully disconnect Redis.
 */
const disconnectRedis = async () => {
  try {
    if (client) {
      await client.quit();
      isConnected = false;
      logger.info('Redis: Disconnected gracefully');
    }
  } catch (err) {
    logger.error('Redis disconnect error:', err.message);
  }
};

module.exports = {
  connectRedis,
  getClient,
  getIsConnected,
  getCache,
  setCache,
  deleteCache,
  flushByPrefix,
  getCacheStats,
  disconnectRedis,
};
