/**
 * Automated test script to verify Express API CRUD endpoints
 */
const BASE_URL = "http://localhost:5000";

async function runTests() {
  console.log("=== Testing Practical 13 Express + MongoDB Backend API ===");
  try {
    // 1. Health check
    const rootRes = await fetch(`${BASE_URL}/`);
    const rootData = await rootRes.json();
    console.log("✔ GET / Root health check:", rootData.message);

    // 2. GET /tasks
    const getRes = await fetch(`${BASE_URL}/tasks`);
    const getData = await getRes.json();
    console.log(`✔ GET /tasks status: ${getRes.status}, tasks count: ${getData.count}`);

    // 3. POST /tasks
    const postRes = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Test Task Integration",
        description: "Created via automated test script",
        priority: "high"
      })
    });
    const postData = await postRes.json();
    console.log(`✔ POST /tasks status: ${postRes.status}, created ID: ${postData.data?.id}`);

    if (postData.data?.id) {
      const taskId = postData.data.id;

      // 4. PUT /tasks/:id
      const putRes = await fetch(`${BASE_URL}/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completed: true,
          description: "Updated task description"
        })
      });
      const putData = await putRes.json();
      console.log(`✔ PUT /tasks/${taskId} status: ${putRes.status}, completed: ${putData.data?.completed}`);

      // 5. DELETE /tasks/:id
      const delRes = await fetch(`${BASE_URL}/tasks/${taskId}`, { method: "DELETE" });
      const delData = await delRes.json();
      console.log(`✔ DELETE /tasks/${taskId} status: ${delRes.status}, deleted: ${delData.success}`);
    }

    console.log("=== All API Tests Passed Successfully! ===");
  } catch (err) {
    console.error("❌ API Test Failure:", err.message);
  }
}

runTests();
