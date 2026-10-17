// backend/tests/broken.test.js
// Deliberately Broken Test (Simulating CI Pipeline Regression Failure)
const request = require('supertest');
const app = require('../server');

describe('Deliberately Broken Test (Simulating CI Pipeline Failure)', () => {
  test('Deliberately broken assertion: expect GET / to return 500', async () => {
    const res = await request(app).get('/');
    // DELIBERATE DEFECT: Root endpoint returns 200 OK, but we assert 500 to trigger CI failure
    expect(res.statusCode).toBe(500);
  });
});
