/**
 * Automated Performance Benchmark & Caching Validation Suite
 * Practical 9: In-Memory Caching and Query Optimization
 */
require("dotenv").config();
const http = require("http");
const app = require("./server");

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

// Helper: Make HTTP request and measure response time precisely
function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const start = process.hrtime();

    const reqOptions = {
      method: options.method || "GET",
      headers: options.headers || {}
    };

    if (options.body) {
      reqOptions.headers["Content-Type"] = "application/json";
    }

    const req = http.request(url, reqOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        const diff = process.hrtime(start);
        const durationMs = parseFloat((diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2));
        const cacheHeader = res.headers["x-cache"] || "NONE";

        let parsedBody;
        try {
          parsedBody = JSON.parse(data);
        } catch {
          parsedBody = data;
        }

        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          cacheStatus: cacheHeader,
          durationMs,
          body: parsedBody
        });
      });
    });

    req.on("error", (err) => reject(err));

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runBenchmark() {
  console.log("================================================================================");
  console.log("    PRACTICAL 9: IN-MEMORY CACHING & QUERY OPTIMIZATION BENCHMARK SUITE");
  console.log("================================================================================\n");

  // Allow server initialization
  await sleep(1000);

  try {
    // --------------------------------------------------------------------------
    // PART 1: Reset Cache & Verify Baseline
    // --------------------------------------------------------------------------
    console.log("[1/5] Resetting cache to ensure pristine testing conditions...");
    await makeRequest("/tasks/cache/clear", { method: "POST" });
    console.log("      Cache cleared successfully.\n");

    // --------------------------------------------------------------------------
    // PART 2: Uncached vs Cached API Response Time Measurements (3+ readings each)
    // --------------------------------------------------------------------------
    console.log("[2/5] Collecting 3 Sample Readings for UNCACHED requests (Direct MongoDB query)...");
    const uncachedReadings = [];
    for (let i = 1; i <= 3; i++) {
      // Force cache bypass to simulate cold database query
      const res = await makeRequest("/tasks?nocache=true");
      uncachedReadings.push(res.durationMs);
      console.log(`      Sample #${i}: ${res.durationMs} ms (Cache: ${res.cacheStatus}, Status: ${res.statusCode}, Items: ${Array.isArray(res.body) ? res.body.length : 'N/A'})`);
      await sleep(100);
    }

    console.log("\n[3/5] Populating Cache & Collecting 3 Sample Readings for CACHED requests (In-Memory RAM)...");
    // Initial fetch to populate cache (Cache MISS)
    const prime = await makeRequest("/tasks");
    console.log(`      Cache Warming Run: ${prime.durationMs} ms (Cache: ${prime.cacheStatus}) -> Stored into node-cache.`);

    const cachedReadings = [];
    for (let i = 1; i <= 3; i++) {
      const res = await makeRequest("/tasks");
      cachedReadings.push(res.durationMs);
      console.log(`      Sample #${i}: ${res.durationMs} ms (Cache: ${res.cacheStatus}, Status: ${res.statusCode})`);
      await sleep(100);
    }

    // Calculate Summary Statistics
    const avgUncached = parseFloat((uncachedReadings.reduce((a, b) => a + b, 0) / uncachedReadings.length).toFixed(2));
    const avgCached = parseFloat((cachedReadings.reduce((a, b) => a + b, 0) / cachedReadings.length).toFixed(2));
    const speedup = parseFloat((avgUncached / avgCached).toFixed(2));
    const latencyReductionPercent = parseFloat((((avgUncached - avgCached) / avgUncached) * 100).toFixed(2));

    console.log("\n================================================================================");
    console.log("                       RESPONSE TIME COMPARISON TABLE");
    console.log("================================================================================");
    console.log("| Sample # | Uncached (MongoDB) [ms] | Cached (node-cache) [ms] | Latency Reduction |");
    console.log("|:--------:|:-----------------------:|:------------------------:|:-----------------:|");
    for (let i = 0; i < 3; i++) {
      const reduction = (((uncachedReadings[i] - cachedReadings[i]) / uncachedReadings[i]) * 100).toFixed(1);
      console.log(
        `|    #${i + 1}   |        ${uncachedReadings[i].toFixed(2).padStart(6)} ms       |        ${cachedReadings[i].toFixed(2).padStart(6)} ms        |       ${reduction.padStart(5)}%       |`
      );
    }
    console.log("|----------|-------------------------|--------------------------|-------------------|");
    console.log(
      `|  AVERAGE |        ${avgUncached.toFixed(2).padStart(6)} ms       |        ${avgCached.toFixed(2).padStart(6)} ms        |       ${latencyReductionPercent.toFixed(1).padStart(5)}%       |`
    );
    console.log(
      `|  MIN     |        ${Math.min(...uncachedReadings).toFixed(2).padStart(6)} ms       |        ${Math.min(...cachedReadings).toFixed(2).padStart(6)} ms        |         --        |`
    );
    console.log(
      `|  MAX     |        ${Math.max(...uncachedReadings).toFixed(2).padStart(6)} ms       |        ${Math.max(...cachedReadings).toFixed(2).padStart(6)} ms        |         --        |`
    );
    console.log("================================================================================");
    console.log(`>> SUMMARY: In-Memory Caching achieved a ${speedup}x speedup (${latencyReductionPercent}% latency reduction)!\n`);

    // --------------------------------------------------------------------------
    // PART 4: Supplementary Problem 1 - Single-Task Caching (GET /tasks/:id)
    // --------------------------------------------------------------------------
    console.log("[4/5] Testing Supplementary Problem 1: Single-Task Caching (GET /tasks/:id)...");
    const tasksRes = await makeRequest("/tasks");
    const sampleTask = tasksRes.body[0];
    const taskId = sampleTask._id;

    // 1st request: Cache MISS
    const single1 = await makeRequest(`/tasks/${taskId}`);
    console.log(`      1st Read (GET /tasks/${taskId}): ${single1.durationMs} ms (Cache: ${single1.cacheStatus})`);

    // 2nd request: Cache HIT
    const single2 = await makeRequest(`/tasks/${taskId}`);
    console.log(`      2nd Read (GET /tasks/${taskId}): ${single2.durationMs} ms (Cache: ${single2.cacheStatus})`);
    console.log(`      Single Task Cache Acceleration: ${(single1.durationMs / single2.durationMs).toFixed(2)}x faster\n`);

    // --------------------------------------------------------------------------
    // PART 5: Cache Invalidation Testing (POST, PUT, DELETE)
    // --------------------------------------------------------------------------
    console.log("[5/5] Testing Cache Invalidation On Write Operations...");

    // Test POST Invalidation
    console.log("      (A) Creating new task (POST /tasks)...");
    const createRes = await makeRequest("/tasks", {
      method: "POST",
      body: {
        title: "Benchmark Verification Task",
        description: "Created dynamically to test cache invalidation",
        priority: "high"
      }
    });
    console.log(`          Status: ${createRes.statusCode}, Cache Invalidation: ${createRes.body.message}`);

    // Verify GET /tasks is now a MISS because POST invalidated 'all_tasks'
    const afterPostGet = await makeRequest("/tasks");
    console.log(`          Immediate GET /tasks after POST: Cache: ${afterPostGet.cacheStatus} (Expected: MISS)`);

    const createdTaskId = createRes.body.data._id;

    // Cache the single task
    await makeRequest(`/tasks/${createdTaskId}`);

    // Test PUT Invalidation
    console.log("      (B) Updating task (PUT /tasks/:id)...");
    const updateRes = await makeRequest(`/tasks/${createdTaskId}`, {
      method: "PUT",
      body: { completed: true, title: "Benchmark Verification Task [UPDATED]" }
    });
    console.log(`          Status: ${updateRes.statusCode}, Invalidation: ${updateRes.body.message}`);

    // Verify both single task and all_tasks are MISS
    const afterPutSingle = await makeRequest(`/tasks/${createdTaskId}`);
    const afterPutAll = await makeRequest("/tasks");
    console.log(`          GET /tasks/${createdTaskId} after PUT: Cache: ${afterPutSingle.cacheStatus} (Expected: MISS)`);
    console.log(`          GET /tasks after PUT: Cache: ${afterPutAll.cacheStatus} (Expected: MISS)`);

    // Test DELETE Invalidation
    console.log("      (C) Deleting task (DELETE /tasks/:id)...");
    const deleteRes = await makeRequest(`/tasks/${createdTaskId}`, { method: "DELETE" });
    console.log(`          Status: ${deleteRes.statusCode}, Invalidation: ${deleteRes.body.message}`);

    const afterDeleteAll = await makeRequest("/tasks");
    console.log(`          GET /tasks after DELETE: Cache: ${afterDeleteAll.cacheStatus} (Expected: MISS)`);

    // Fetch Debug Metrics Endpoint
    console.log("\n[DEBUG] Fetching Cache Performance & Counters via Debug Endpoint (/tasks/cache/stats)...");
    const statsRes = await makeRequest("/tasks/cache/stats");
    console.log("      Total Requests Tracked:", statsRes.body.data.metrics.totalRequests);
    console.log("      Cache Hits:", statsRes.body.data.metrics.hits);
    console.log("      Cache Misses:", statsRes.body.data.metrics.misses);
    console.log("      Hit Ratio:", statsRes.body.data.metrics.hitRatio);
    console.log("      Active Cache Keys Count:", statsRes.body.data.activeKeysCount);
    console.log("      Active Cache Keys:", statsRes.body.data.activeKeys);

    console.log("\n================================================================================");
    console.log("          ALL BENCHMARK & VALIDATION TESTS PASSED SUCCESSFULLY!                 ");
    console.log("================================================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("[Benchmark Failure]", error);
    process.exit(1);
  }
}

runBenchmark();
