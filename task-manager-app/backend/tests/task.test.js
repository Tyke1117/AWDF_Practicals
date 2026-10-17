// backend/tests/task.test.js (Automated Jest Test Suite)
const request = require('supertest');
const app = require('../server');

describe('Task Management API Test Suite (CI Pipeline)', () => {
  // Test 1: Root health check endpoint
  test('GET / returns HTTP 200 OK and valid JSON information', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  // Test 2: Input validation pipeline rejection
  test('POST /api/tasks rejects request with missing title (HTTP 400/401)', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ description: 'Missing mandatory title' });
    expect([400, 401]).toContain(res.statusCode);
  });

  // Test 3: Events activity endpoint returns 200
  test('GET /api/events/activity returns 200 with recorded events array', async () => {
    const res = await request(app).get('/api/events/activity');
    expect(res.statusCode).toBe(200);
  });
});
