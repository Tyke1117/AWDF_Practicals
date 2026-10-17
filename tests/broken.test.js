const request = require('supertest');
const app = require('../src/app');

describe('Task Management API - Deliberately Broken Test Suite for CI Failure Demonstration', () => {
  // Step 5: Deliberately broken test - expecting status 201 instead of 200
  test('GET /tasks returns 200 (BROKEN: Expecting 201 Created)', async () => {
    const res = await request(app).get('/tasks');
    // DELIBERATE DEFECT: GET request returns 200 OK, but we assert 201 Created
    expect(res.statusCode).toBe(201);
  });
});
