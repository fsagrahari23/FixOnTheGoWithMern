const redis = require('redis');
const User = require('../models/User');

const BLOOM_FILTER_KEY = 'email_filter';
const ERROR_RATE = 0.01;
const CAPACITY = 1000000;

// Initialize Redis client
const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => console.error('Redis Client Error', err));
client.on('connect', () => console.log('Redis Client Connected to Bloom Filter'));

let isReady = false;

const connectRedis = async () => {
  if (!client.isOpen) {
    await client.connect();
    isReady = true;
  }
};

const initBloomFilter = async () => {
  try {
    await connectRedis();

    // Check if the filter already exists
    try {
      await client.bf.info(BLOOM_FILTER_KEY);
      console.log('Bloom filter already initialized.');
      return;
    } catch (err) {
      if (err.message && err.message.includes('unknown command')) {
        console.error('CRITICAL: RedisBloom module is not installed on your Redis server. Please ensure you run Redis Stack (redis/redis-stack-server) rather than standard Redis.');
        isReady = false;
        return; // Exit initialization, will fallback to DB
      }
      
      // If it throws an error, it likely doesn't exist, we will reserve it
      if (err.message && (err.message.includes('ERR not found') || err.message.includes('not found'))) {
        await client.bf.reserve(BLOOM_FILTER_KEY, ERROR_RATE, CAPACITY);
        console.log('Bloom filter reserved successfully.');
      } else {
        throw err;
      }
    }

    // Seed the bloom filter with existing emails from DB
    const users = await User.find({}, 'email').lean();
    
    const allEmails = users.map(u => u.email).filter(email => typeof email === 'string' && email.trim() !== '');

    let count = 0;
    let batch = [];
    
    for (const email of allEmails) {
      if (email) {
        batch.push(email.toLowerCase().trim());
        count++;
        
        // Execute in batches of 10000
        if (batch.length === 10000) {
          await client.bf.mAdd(BLOOM_FILTER_KEY, batch);
          batch = [];
        }
      }
    }
    
    // Execute remaining
    if (batch.length > 0) {
      await client.bf.mAdd(BLOOM_FILTER_KEY, batch);
    }
    
    console.log(`Bloom filter initialized with ${count} existing emails.`);
  } catch (error) {
    console.error('Error initializing Bloom filter:', error);
  }
};

const checkEmailBloom = async (email) => {
  try {
    if (!isReady) await connectRedis();
    const exists = await client.bf.exists(BLOOM_FILTER_KEY, email.toLowerCase().trim());
    return exists; // returns boolean
  } catch (error) {
    console.error('Error checking Bloom filter:', error);
    // On error, default to true so we always fall back to DB check (no false negatives)
    return true; 
  }
};

const addEmailBloom = async (email) => {
  try {
    if (!isReady) await connectRedis();
    await client.bf.add(BLOOM_FILTER_KEY, email.toLowerCase().trim());
  } catch (error) {
    console.error('Error adding to Bloom filter:', error);
  }
};

module.exports = {
  initBloomFilter,
  checkEmailBloom,
  addEmailBloom,
  client
};
