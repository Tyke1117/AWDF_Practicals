const request = require('supertest');
const app = require('../src/app');

describe('Task Management API Test Suite', () => {
  beforeEach(() => {
    // Reset in-memory database to initial state before each test
    app.resetTasks();
  });

  // ==========================================
  // Lab Step 2: Primary Automated Test
  // ==========================================
  test('GET /tasks returns 200', async () => {
    const res = await request(app).get('/tasks');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('title');
    expect(res.body[0]).toHaveProperty('completed');
  });

  // ==========================================
  // Student Assignment: Second Automated Test (POST endpoint)
  // ==========================================
  test('POST /tasks creates a new task and returns 201', async () => {
    const newTaskPayload = {
      title: 'Configure GitHub Actions Workflow',
      completed: false
    };

    const res = await request(app)
      .post('/tasks')
      .send(newTaskPayload)
      .set('Accept', 'application/json');

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('Configure GitHub Actions Workflow');
    expect(res.body.completed).toBe(false);

    // Verify task is now present in collection
    const fetchRes = await request(app).get('/tasks');
    expect(fetchRes.body.some(t => t.title === 'Configure GitHub Actions Workflow')).toBe(true);
  });

  // ==========================================
  // Additional End-to-End Endpoint Coverage
  // ==========================================
  test('GET /tasks/:id returns 200 and task details for valid ID', async () => {
    const res = await request(app).get('/tasks/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(1);
    expect(res.body.title).toBe('Learn CI/CD Fundamentals');
  });

  test('GET /tasks/:id returns 404 for non-existent ID', async () => {
    const res = await request(app).get('/tasks/9999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /tasks returns 400 when title is missing or empty', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ completed: true });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('PUT /tasks/:id updates existing task and returns 200', async () => {
    const res = await request(app)
      .put('/tasks/3')
      .send({ completed: true });

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(3);
    expect(res.body.completed).toBe(true);
  });

  test('DELETE /tasks/:id deletes task and returns 200', async () => {
    const res = await request(app).delete('/tasks/2');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Task deleted successfully');

    // Verify deletion
    const verifyRes = await request(app).get('/tasks/2');
    expect(verifyRes.statusCode).toBe(404);
  });
});
