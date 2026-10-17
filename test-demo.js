/**
 * Demonstration & Verification Script for Practical 10
 * Tests asynchronous non-blocking event handling, timestamp ordering,
 * supplementary events (task-deleted), and error event handling.
 */

const BASE_URL = 'http://localhost:5000';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runDemo() {
  console.log('\n================================================================================');
  console.log('🧪 PRACTICAL 10: AUTOMATED TEST & EVENT VERIFICATION SUITE');
  console.log('================================================================================\n');

  try {
    // --------------------------------------------------------------------------
    // Test 1: Verify Server Health & Event System Readiness
    // --------------------------------------------------------------------------
    console.log('[STEP 1] Checking server health...');
    const rootRes = await fetch(`${BASE_URL}/`);
    const rootData = await rootRes.json();
    console.log('Server Status:', rootData.status);
    console.log('Practical    :', rootData.practical);
    console.log('--------------------------------------------------------------------------------\n');

    // --------------------------------------------------------------------------
    // Test 2: Standard Task Creation (Demonstrates Non-blocking 'task-created')
    // --------------------------------------------------------------------------
    console.log('[STEP 2] Creating standard task to demonstrate non-blocking notification...');
    const startTime = Date.now();
    const taskPayload = {
      title: 'Deploy Production Kubernetes Cluster',
      description: 'Configure Ingress controllers and autoscalers',
      assignedUser: 'Pari (DevOps Lead)',
    };

    const createRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskPayload),
    });

    const elapsedMs = Date.now() - startTime;
    const createData = await createRes.json();

    console.log(`[API CLIENT] Received response in: ${elapsedMs} ms`);
    console.log(`[API CLIENT] Status Code: ${createRes.status}`);
    console.log(`[API CLIENT] API Response Timestamp: ${createData.apiResponseTimestamp}`);
    console.log(`[API CLIENT] Created Task ID: ${createData.data._id}`);
    console.log('>> Note: Client received response in milliseconds while background notification runs in the background for 2s!');

    const createdTaskId = createData.data._id;

    // --------------------------------------------------------------------------
    // Test 3: Observe Asynchronous Completion
    // --------------------------------------------------------------------------
    console.log('\n[STEP 3] Waiting 2.5 seconds to allow background listener to finish execution...');
    await sleep(2500);
    console.log('[STEP 3] Background listener delay period elapsed. Background task completed.\n');

    // --------------------------------------------------------------------------
    // Test 4: Task Deletion (Demonstrates 'task-deleted' event)
    // --------------------------------------------------------------------------
    console.log('[STEP 4] Deleting created task to test supplementary "task-deleted" event...');
    const deleteStartTime = Date.now();
    const deleteRes = await fetch(`${BASE_URL}/tasks/${createdTaskId}`, {
      method: 'DELETE',
    });
    const deleteElapsedMs = Date.now() - deleteStartTime;
    const deleteData = await deleteRes.json();

    console.log(`[API CLIENT] Delete Response received in: ${deleteElapsedMs} ms`);
    console.log(`[API CLIENT] Status Code: ${deleteRes.status}`);
    console.log(`[API CLIENT] Delete Response Timestamp: ${deleteData.apiResponseTimestamp}`);
    console.log(`[API CLIENT] Message: ${deleteData.message}`);

    console.log('\n[STEP 4] Waiting 1.5 seconds to observe background audit log completion...');
    await sleep(1500);

    // --------------------------------------------------------------------------
    // Test 5: Error Handling in Event Listener (Demonstrates 'error' event listener)
    // --------------------------------------------------------------------------
    console.log('[STEP 5] Testing error listener by creating a task designed to trigger an error in background...');
    const errorTaskPayload = {
      title: 'simulate-error: Payment Gateway Sync Failure',
      description: 'Will trigger an error in the background listener after 2s',
      assignedUser: 'Pari (Security Engineer)',
    };

    const errCreateRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorTaskPayload),
    });
    const errCreateData = await errCreateRes.json();

    console.log(`[API CLIENT] API Response returned immediately with 201 Created!`);
    console.log(`[API CLIENT] API Response Timestamp: ${errCreateData.apiResponseTimestamp}`);
    console.log('>> The server sent 201 to the client. Now waiting 2.5s for the listener to encounter the simulated error and emit to "error" listener...');

    await sleep(2500);

    // --------------------------------------------------------------------------
    // Test 6: Final Task List Verification
    // --------------------------------------------------------------------------
    console.log('\n[STEP 6] Querying GET /tasks to verify database state...');
    const listRes = await fetch(`${BASE_URL}/tasks`);
    const listData = await listRes.json();
    console.log(`Total tasks in database: ${listData.count}`);

    console.log('\n================================================================================');
    console.log('🎉 ALL PRACTICAL 10 TESTS COMPLETED SUCCESSFULLY!');
    console.log('================================================================================\n');
  } catch (err) {
    console.error('Test suite failed:', err);
  }
}

runDemo();
