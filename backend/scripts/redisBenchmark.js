'use strict';

/**
 * Redis Cache Performance Benchmark
 * 
 * Run this AFTER starting your backend with Redis:
 *   node scripts/redisBenchmark.js
 * 
 * It will test each cached endpoint twice — first call (MISS) vs second call (HIT)
 * and print a formatted performance comparison table.
 */

const http = require('http');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// ─── Endpoints to benchmark ──────────────────────────────────────────────────
// These are public endpoints that don't require auth
const PUBLIC_ENDPOINTS = [
  { path: '/api/redis/health', label: 'Redis Health Check' },
];

// These require a logged-in session cookie — we'll test Redis health + provide 
// instructions for authenticated endpoints
const AUTH_ENDPOINTS = [
  { path: '/user/api/dashboard', label: 'User Dashboard', role: 'user' },
  { path: '/user/api/analytics', label: 'User Analytics', role: 'user' },
  { path: '/user/api/maintenance', label: 'User Maintenance', role: 'user' },
  { path: '/user/api/premium', label: 'User Premium', role: 'user' },
  { path: '/mechanic/api/dashboard', label: 'Mechanic Dashboard', role: 'mechanic' },
  { path: '/mechanic/api/analytics', label: 'Mechanic Analytics', role: 'mechanic' },
  { path: '/mechanic/api/history', label: 'Mechanic History', role: 'mechanic' },
  { path: '/mechanic/api/profile', label: 'Mechanic Profile', role: 'mechanic' },
  { path: '/staff/dashboard', label: 'Staff Dashboard', role: 'staff' },
  { path: '/staff/analytics', label: 'Staff Analytics', role: 'staff' },
];

// ─── HTTP request helper ─────────────────────────────────────────────────────
function timedRequest(url, cookie = '') {
  return new Promise((resolve) => {
    const startTime = process.hrtime.bigint();

    const options = {
      headers: cookie ? { Cookie: cookie, Accept: 'application/json' } : { Accept: 'application/json' },
    };

    const req = http.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        const endTime = process.hrtime.bigint();
        const durationMs = Number(endTime - startTime) / 1_000_000;
        resolve({
          status: res.statusCode,
          cacheHeader: res.headers['x-cache'] || 'N/A',
          cacheKey: res.headers['x-cache-key'] || 'N/A',
          durationMs: durationMs.toFixed(2),
          bodySize: Buffer.byteLength(data, 'utf8'),
        });
      });
    });

    req.on('error', (err) => {
      resolve({ status: 0, cacheHeader: 'ERROR', durationMs: 0, error: err.message });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ status: 0, cacheHeader: 'TIMEOUT', durationMs: 10000 });
    });
  });
}

// ─── Benchmark runner ────────────────────────────────────────────────────────
async function runBenchmark() {
  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║         🚀 Redis Cache Performance Benchmark                   ║');
  console.log('║         FixOnTheGoWithMern                                      ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  // Check if server is running
  console.log(`📡 Testing server at ${BASE_URL}...\n`);

  const healthCheck = await timedRequest(`${BASE_URL}/api/redis/health`);
  if (healthCheck.status === 0) {
    console.log('❌ Server is not running! Start it with: cd backend && npm run dev\n');
    process.exit(1);
  }

  console.log(`✅ Server is running (${healthCheck.durationMs}ms)\n`);

  // Parse Redis health response
  try {
    const healthReq = await new Promise((resolve) => {
      http.get(`${BASE_URL}/api/redis/health`, { headers: { Accept: 'application/json' } }, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(JSON.parse(data)));
      });
    });

    console.log('🔗 Redis Status:');
    console.log(`   Status:      ${healthReq.status}`);
    console.log(`   Total Keys:  ${healthReq.totalKeys || 0}`);
    console.log(`   Cache Hits:  ${healthReq.hits || 0}`);
    console.log(`   Cache Miss:  ${healthReq.misses || 0}`);
    console.log(`   Memory Used: ${healthReq.usedMemory || 'N/A'}`);
    console.log('');
  } catch {
    console.log('⚠️  Could not parse Redis health response\n');
  }

  // Get session cookie
  const sessionCookie = process.env.SESSION_COOKIE || '';

  if (!sessionCookie) {
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║  ⚠️  No SESSION_COOKIE provided                                ║');
    console.log('║                                                                  ║');
    console.log('║  To benchmark authenticated endpoints:                           ║');
    console.log('║  1. Log in to your app in a browser                              ║');
    console.log('║  2. Open DevTools → Application → Cookies                        ║');
    console.log('║  3. Copy the "connect.sid" cookie value                          ║');
    console.log('║  4. Run:                                                         ║');
    console.log('║     SESSION_COOKIE="connect.sid=..." node scripts/redisBenchmark.js');
    console.log('║                                                                  ║');
    console.log('║  Running public endpoint tests only...                           ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝\n');
  }

  const endpoints = sessionCookie
    ? [...PUBLIC_ENDPOINTS, ...AUTH_ENDPOINTS]
    : PUBLIC_ENDPOINTS;

  // First, flush all caches to start clean
  console.log('🧹 Flushing all caches for clean benchmark...');
  await timedRequest(`${BASE_URL}/api/redis/flush`);
  console.log('');

  // Run benchmarks
  console.log('┌───────────────────────────┬──────────┬──────────┬──────────┬──────────┐');
  console.log('│ Endpoint                  │ 1st (ms) │ 2nd (ms) │ Cache    │ Speedup  │');
  console.log('├───────────────────────────┼──────────┼──────────┼──────────┼──────────┤');

  const results = [];

  for (const endpoint of endpoints) {
    const url = `${BASE_URL}${endpoint.path}`;

    // First request — should be a MISS (goes to MongoDB)
    const first = await timedRequest(url, sessionCookie);

    // Small delay to let cache populate
    await new Promise((r) => setTimeout(r, 100));

    // Second request — should be a HIT (from Redis)
    const second = await timedRequest(url, sessionCookie);

    const speedup = first.durationMs > 0 && second.durationMs > 0
      ? (parseFloat(first.durationMs) / parseFloat(second.durationMs)).toFixed(1)
      : 'N/A';

    const name = endpoint.label.padEnd(25);
    const firstMs = `${first.durationMs}`.padStart(8);
    const secondMs = `${second.durationMs}`.padStart(8);
    const cache = second.cacheHeader.padStart(8);
    const speedStr = `${speedup}x`.padStart(8);

    console.log(`│ ${name} │ ${firstMs} │ ${secondMs} │ ${cache} │ ${speedStr} │`);

    results.push({
      endpoint: endpoint.label,
      firstMs: parseFloat(first.durationMs),
      secondMs: parseFloat(second.durationMs),
      cacheStatus: second.cacheHeader,
      speedup: parseFloat(speedup) || 0,
      status: second.status,
    });
  }

  console.log('└───────────────────────────┴──────────┴──────────┴──────────┴──────────┘');

  // Summary
  const validResults = results.filter((r) => r.speedup > 0 && r.cacheStatus === 'HIT');
  if (validResults.length > 0) {
    const avgSpeedup = (validResults.reduce((sum, r) => sum + r.speedup, 0) / validResults.length).toFixed(1);
    const avgBefore = (validResults.reduce((sum, r) => sum + r.firstMs, 0) / validResults.length).toFixed(1);
    const avgAfter = (validResults.reduce((sum, r) => sum + r.secondMs, 0) / validResults.length).toFixed(1);
    const totalSaved = validResults.reduce((sum, r) => sum + (r.firstMs - r.secondMs), 0).toFixed(1);

    console.log('\n📊 Summary:');
    console.log(`   Endpoints cached:     ${validResults.length}/${results.length}`);
    console.log(`   Avg before (MongoDB): ${avgBefore}ms`);
    console.log(`   Avg after (Redis):    ${avgAfter}ms`);
    console.log(`   Avg speedup:          ${avgSpeedup}x faster`);
    console.log(`   Total time saved:     ${totalSaved}ms per cycle`);
  }

  // Get final Redis stats
  console.log('\n📈 Final Redis Stats:');
  try {
    const finalHealth = await new Promise((resolve) => {
      http.get(`${BASE_URL}/api/redis/health`, { headers: { Accept: 'application/json' } }, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(JSON.parse(data)));
      });
    });
    console.log(`   Total Keys:  ${finalHealth.totalKeys || 0}`);
    console.log(`   Cache Hits:  ${finalHealth.hits || 0}`);
    console.log(`   Cache Miss:  ${finalHealth.misses || 0}`);
    console.log(`   Memory Used: ${finalHealth.usedMemory || 'N/A'}`);
  } catch {
    console.log('   Could not fetch stats');
  }

  console.log('\n✅ Benchmark complete!\n');
}

runBenchmark().catch(console.error);
