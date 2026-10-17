/**
 * Automated Test Suite for Practical 7: Authentication & Middleware Pipeline
 * Tests:
 * 1. Public endpoints & health check
 * 2. Unauthenticated access prevention (401)
 * 3. Tampered/invalid JWT token rejection (401)
 * 4. Input validation middleware for auth (400)
 * 5. Secure user registration with bcrypt password hashing (201)
 * 6. Duplicate registration prevention (400)
 * 7. Authentication via login with bcrypt verification (401/200)
 * 8. User profile retrieval via /me using decoded JWT (200)
 * 9. Input validation middleware for task creation (missing title) (400)
 * 10. Authenticated CRUD task operations (201, 200, 200, 200, 404)
 */

const BASE_URL = process.env.API_URL || "http://localhost:5000";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };
  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  return { status: response.status, data };
}

async function runTests() {
  console.log("===============================================================");
  console.log(" Practical 7: Authentication & Middleware Pipeline Test Suite ");
  console.log("===============================================================\n");

  const testEmail = `student_${Date.now()}@example.com`;
  const testPassword = "Password123!";
  let authToken = null;
  let taskId = null;

  try {
    // 1. Root Endpoint
    console.log("Test 1: Root Health Check Endpoint");
    const resRoot = await request("/");
    assert(resRoot.status === 200, "GET / returns HTTP 200 OK");
    assert(resRoot.data.success === true, "Root response reports success: true");

    // 2. Auth Middleware: Missing Token
    console.log("\nTest 2: Protected Route Rejection on Missing Token");
    const resNoToken = await request("/api/tasks");
    assert(resNoToken.status === 401, "GET /api/tasks without token returns HTTP 401 Unauthorized");
    assert(
      resNoToken.data.error.includes("No token provided"),
      "Response error explains token is required"
    );

    // 3. Auth Middleware: Invalid / Tampered Token
    console.log("\nTest 3: Protected Route Rejection on Tampered / Invalid Token");
    const resInvalidToken = await request("/api/tasks", {
      headers: { Authorization: "Bearer tampered.fake.jwt.token" }
    });
    assert(resInvalidToken.status === 401, "Invalid token returns HTTP 401 Unauthorized");
    assert(
      resInvalidToken.data.error.includes("Invalid or malformed token"),
      "Response informs client token is invalid"
    );

    // 4. Validation Middleware: Register with malformed / missing fields
    console.log("\nTest 4: Input Validation Middleware on Registration");
    const resMissingEmail = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ password: "123" }) // missing email, short password
    });
    assert(
      resMissingEmail.status === 400,
      "POST /api/auth/register with missing email returns HTTP 400 Bad Request"
    );
    assert(
      Array.isArray(resMissingEmail.data.errors) && resMissingEmail.data.errors.length > 0,
      "Validation middleware returns descriptive error list"
    );

    // 5. User Registration Flow (Bcrypt Hashing)
    console.log("\nTest 5: User Registration & Bcrypt Hashing");
    const resRegister = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Test Student",
        email: testEmail,
        password: testPassword
      })
    });
    assert(resRegister.status === 201, "POST /api/auth/register returns HTTP 201 Created");
    assert(resRegister.data.token !== undefined, "Server returns signed JWT token on registration");
    assert(resRegister.data.user.email === testEmail.toLowerCase(), "User email matches registered email");
    assert(resRegister.data.user.password === undefined, "Hashed password is NEVER exposed in response");

    // 6. Duplicate Registration Prevention
    console.log("\nTest 6: Duplicate Email Registration Prevention");
    const resDuplicate = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Test Duplicate",
        email: testEmail,
        password: testPassword
      })
    });
    assert(resDuplicate.status === 400, "Duplicate registration returns HTTP 400 Bad Request");
    assert(
      resDuplicate.data.error.includes("already exists"),
      "Friendly duplicate error message returned"
    );

    // 7. Login: Wrong Password Verification
    console.log("\nTest 7: Login Authentication with Incorrect Password");
    const resWrongPass = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: testEmail,
        password: "WrongPassword999"
      })
    });
    assert(resWrongPass.status === 401, "Login with invalid password returns HTTP 401 Unauthorized");

    // 8. Login: Correct Password Verification & Token Issuance
    console.log("\nTest 8: Successful Login & JWT Token Generation");
    const resLogin = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    assert(resLogin.status === 200, "POST /api/auth/login returns HTTP 200 OK");
    assert(typeof resLogin.data.token === "string", "Valid JWT string issued by server");
    authToken = resLogin.data.token;

    // 9. Supplementary Problem 1: /me Endpoint
    console.log("\nTest 9: Supplementary Problem 1 - GET /api/auth/me Profile Route");
    const resMe = await request("/api/auth/me", {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert(resMe.status === 200, "GET /api/auth/me with Bearer token returns HTTP 200 OK");
    assert(resMe.data.data.email === testEmail.toLowerCase(), "Decoded token correctly resolves user email");
    assert(resMe.data.data.password === undefined, "Password omitted from /me profile response");

    // 10. Validation Middleware: Task Creation (Missing Title)
    console.log("\nTest 10: Input Validation Middleware on Protected Task Creation");
    const resEmptyTask = await request("/api/tasks", {
      method: "POST",
      headers: { Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ title: "   ", priority: "invalid_priority" })
    });
    assert(resEmptyTask.status === 400, "Empty task title returns HTTP 400 Bad Request");
    assert(
      resEmptyTask.data.error.includes("Task title is required"),
      "Validation rejects request before reaching database"
    );

    // 11. Protected Task Creation (POST /api/tasks)
    console.log("\nTest 11: Authenticated Task Creation");
    const resCreateTask = await request("/api/tasks", {
      method: "POST",
      headers: { Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        title: "Complete Practical 7 JWT Implementation",
        description: "Configure bcrypt hashing, JWT signing, and Express middleware pipelines.",
        priority: "high"
      })
    });
    assert(resCreateTask.status === 201, "POST /api/tasks returns HTTP 201 Created");
    assert(resCreateTask.data.data.title === "Complete Practical 7 JWT Implementation", "Task title saved");
    taskId = resCreateTask.data.data.id || resCreateTask.data.data._id;
    assert(taskId !== undefined, "Task ID generated and returned");

    // 12. Protected Task Retrieval (GET /api/tasks)
    console.log("\nTest 12: Authenticated Task List Retrieval");
    const resGetTasks = await request("/api/tasks", {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert(resGetTasks.status === 200, "GET /api/tasks returns HTTP 200 OK");
    assert(Array.isArray(resGetTasks.data.data), "Task list is an array");
    assert(
      resGetTasks.data.data.some((t) => (t.id === taskId || t._id === taskId)),
      "Created task found in authenticated user's task list"
    );

    // 13. Protected Task Update (PUT /api/tasks/:id)
    console.log("\nTest 13: Authenticated Task Update");
    const resUpdateTask = await request(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        completed: true,
        priority: "medium"
      })
    });
    assert(resUpdateTask.status === 200, "PUT /api/tasks/:id returns HTTP 200 OK");
    assert(resUpdateTask.data.data.completed === true, "Task marked as completed");

    // 14. Protected Task Deletion (DELETE /api/tasks/:id)
    console.log("\nTest 14: Authenticated Task Deletion");
    const resDeleteTask = await request(`/api/tasks/${taskId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert(resDeleteTask.status === 200, "DELETE /api/tasks/:id returns HTTP 200 OK");

    // 15. Verify Task Deletion (GET /api/tasks/:id)
    console.log("\nTest 15: Verify Deletion in MongoDB");
    const resVerifyDelete = await request(`/api/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert(resVerifyDelete.status === 404, "GET deleted task returns HTTP 404 Not Found");

    console.log("\n===============================================================");
    console.log(` Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log("===============================================================");

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error(`\n[FATAL ERROR] Unexpected test runner error: ${err.message}`);
    process.exit(1);
  }
}

runTests();
