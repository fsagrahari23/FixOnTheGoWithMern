const request = require('supertest');
const { connect, close } = require('./setup');

let app;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await connect();
  app = require('../app');
});

afterAll(async () => {
  await close();
});

describe('User Booking basic validations', () => {
  test('VAL-BOOK-001: missing required fields', async () => {
    const res = await request(app)
      .post('/user/book')
      .send({});
    // middleware requires auth; expect redirect to login
    expect([302, 401, 403]).toContain(res.status);
  });
});
