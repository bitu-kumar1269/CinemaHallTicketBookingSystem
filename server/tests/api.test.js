import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/config/db.js';

describe('Cinema Hall Booking System API Tests', () => {
  let customerToken = '';
  let adminToken = '';
  let testShowId = '';
  let testSeatId = '';

  beforeAll(async () => {
    // Obtain test tokens
    const custRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'customer@cinema.com', password: 'Customer@12345' });
    customerToken = custRes.body.data.token;

    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@cinema.com', password: 'Admin@12345' });
    adminToken = adminRes.body.data.token;

    // Fetch a show
    const showsRes = await request(app).get('/api/shows');
    if (showsRes.body.data && showsRes.body.data.length > 0) {
      testShowId = showsRes.body.data[0].id;
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // 1. Health check
  test('GET /api/health should return status healthy', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  // 2. Authentication: Invalid Credentials
  test('POST /api/auth/login with wrong password should fail with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'customer@cinema.com', password: 'WrongPassword999' });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // 3. Current User session
  test('GET /api/auth/me should return authenticated user profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.email).toBe('customer@cinema.com');
  });

  // 4. Movies catalog
  test('GET /api/movies should return list of movies', async () => {
    const res = await request(app).get('/api/movies');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  // 5. Featured movies
  test('GET /api/movies/featured should return hero and sections', async () => {
    const res = await request(app).get('/api/movies/featured');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.hero).toBeDefined();
    expect(res.body.data.nowShowing).toBeDefined();
  });

  // 6. Show Seating Layout
  test('GET /api/shows/:id/seats should return layout and seat categories', async () => {
    const res = await request(app).get(`/api/shows/${testShowId}/seats`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.rows).toBeDefined();
    expect(res.body.data.allSeats.length).toBeGreaterThan(0);
    testSeatId = res.body.data.allSeats[0].seatId;
  });

  // 7. Concurrency-Safe Seat Locking
  test('POST /api/bookings/lock-seats should lock seat and prevent other locking', async () => {
    // Customer 1 locks seat
    const lockRes = await request(app)
      .post('/api/bookings/lock-seats')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ showId: testShowId, seatIds: [testSeatId] });
    expect(lockRes.statusCode).toBe(200);
    expect(lockRes.body.success).toBe(true);

    // Release seat so tests don't leave lingering locks
    await request(app)
      .post('/api/bookings/release-seats')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ showId: testShowId, seatIds: [testSeatId] });
  });

  // 8. Admin Authorization & Metrics
  test('GET /api/admin/metrics without admin token should be forbidden (403)', async () => {
    const res = await request(app)
      .get('/api/admin/metrics')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.statusCode).toBe(403);
  });

  test('GET /api/admin/metrics with admin token should succeed (200)', async () => {
    const res = await request(app)
      .get('/api/admin/metrics')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.totalMovies).toBeGreaterThan(0);
  });
});

