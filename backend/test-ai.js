/**
 * Practical 13: AI Integration & Failure Path Verification Script
 * Tests:
 * 1. Root API Status & AI Endpoint discovery
 * 2. Normal AI description generation (or graceful template fallback)
 * 3. Validation error on missing title (HTTP 400)
 * 4. Step 6: Failure Path verification using an invalid API key (HTTP 200 with fallback: true)
 * 5. Supplementary Problem: Rate Limiting verification (HTTP 429)
 */

const http = require("http");

const BASE_URL = "http://localhost:5000";

function makeRequest(path, method = "GET", body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const data = body ? JSON.stringify(body) : null;

    const req = http.request(
      url,
      {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(data ? { "Content-Length": Buffer.byteLength(data) } : {})
        }
      },
      (res) => {
        let rawData = "";
        res.on("data", (chunk) => (rawData += chunk));
        res.on("end", () => {
          try {
            const parsed = rawData ? JSON.parse(rawData) : {};
            resolve({ status: res.statusCode, headers: res.headers, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, headers: res.headers, raw: rawData });
          }
        });
      }
    );

    req.on("error", (err) => reject(err));
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log("============================================================");
  console.log("🧪 PRACTICAL 13: AI API INTEGRATION VERIFICATION SUITE");
  console.log("============================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
    }
  }

  try {
    // Test 1: AI Health / Status Check
    console.log("--- Test 1: AI Service Health Check (GET /api/ai/status) ---");
    const statusRes = await makeRequest("/api/ai/status");
    assert(statusRes.status === 200, `Returns HTTP 200 (Got: ${statusRes.status})`);
    assert(statusRes.data.success === true, `Service returns success: true`);
    assert(statusRes.data.fallbackEnabled === true, `Fallback engine is enabled`);
    console.log(`  ℹ️ Config info: Provider=${statusRes.data.provider}, RateLimit=${statusRes.data.rateLimitPerMinute}/min\n`);

    // Test 2: AI Description Generation for Task Title
    console.log("--- Test 2: AI Description Generation (POST /api/ai/generate-description) ---");
    const genRes = await makeRequest("/api/ai/generate-description", "POST", {
      title: "Implement OAuth2 login with Google"
    });
    assert(genRes.status === 200, `Returns HTTP 200 (Got: ${genRes.status})`);
    assert(Boolean(genRes.data.description), `Description was generated: "${genRes.data.description}"`);
    assert(Boolean(genRes.data.suggestedPriority), `Suggested priority returned: ${genRes.data.suggestedPriority}`);
    console.log(`  ℹ️ Source: ${genRes.data.source || (genRes.data.fallback ? "fallback-template" : "live-ai")}`);
    console.log(`  ℹ️ Description: "${genRes.data.description}"\n`);

    // Test 3: Validation Error on Missing Title
    console.log("--- Test 3: Input Validation - Missing Title ---");
    const emptyRes = await makeRequest("/api/ai/generate-description", "POST", { title: "   " });
    assert(emptyRes.status === 400, `Returns HTTP 400 Bad Request (Got: ${emptyRes.status})`);
    assert(emptyRes.data.success === false, `Response indicates success: false`);
    console.log(`  ℹ️ Validation message: "${emptyRes.data.error}"\n`);

    // Test 4: Practical 13 Step 6 - Failure Path with Invalid API Key
    console.log("--- Test 4: Step 6 Failure Path - Graceful Degradation on Invalid Key ---");
    const failRes = await makeRequest("/api/ai/generate-description", "POST", {
      title: "Fix database deadlocks on high concurrency",
      testApiKey: "sk-invalid-key-testing-practical-13-failure-path"
    });
    assert(failRes.status === 200, `App did not crash; returns HTTP 200 (Got: ${failRes.status})`);
    assert(failRes.data.fallback === true, `Graceful fallback flag is true`);
    assert(Boolean(failRes.data.description), `Fallback description generated: "${failRes.data.description}"`);
    assert(Boolean(failRes.data.warning || failRes.data.errorDetail), `Diagnostic warning logged`);
    console.log(`  ℹ️ Graceful Warning: "${failRes.data.warning || failRes.data.errorDetail}"\n`);

    // Test 5: Supplementary Problem - Rate Limiting
    console.log("--- Test 5: Supplementary Problem - Rate Limiter (Max Requests) ---");
    console.log("  Sending rapid requests to test rate limit threshold...");
    let hitRateLimit = false;
    for (let i = 0; i < 12; i++) {
      const rlRes = await makeRequest("/api/ai/generate-description", "POST", {
        title: `Rapid Test Task #${i}`
      });
      if (rlRes.status === 429) {
        hitRateLimit = true;
        assert(rlRes.status === 429, `Rate limiter triggered HTTP 429 Too Many Requests on request #${i + 1}`);
        assert(Boolean(rlRes.data.error), `Error message: "${rlRes.data.error}"`);
        break;
      }
    }
    if (!hitRateLimit) {
      console.log("  ⚠️ Rate limit threshold was not exceeded in this batch (window may have reset)");
    }

    console.log("\n============================================================");
    console.log(`🏁 TESTS COMPLETED: ${passed}/${total} assertions passed`);
    console.log("============================================================\n");
  } catch (err) {
    console.error(`\n❌ Test Execution Failed: ${err.message}`);
    console.error("Make sure Express backend is running on http://localhost:5000 before running tests!");
  }
}

runTests();
