const request = require('supertest');
const app = require('../src/app');
const { setupTestDatabase, teardownTestDatabase } = require('./setup');

describe('Role-Based Access Control', () => {
  let adminToken, analystToken, viewerToken;

  beforeAll(async () => {
    await setupTestDatabase();

    // Login as each role
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'admin123' });
    adminToken = adminRes.body.data.token;

    const analystRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'analyst@example.com', password: 'analyst123' });
    analystToken = analystRes.body.data.token;

    const viewerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'viewer@example.com', password: 'viewer123' });
    viewerToken = viewerRes.body.data.token;
  });

  afterAll(() => {
    teardownTestDatabase();
  });

  // ── Record Access ──────────────────────────────────────────────────

  describe('Financial Records Access', () => {
    it('should allow viewer to list records', async () => {
      const res = await request(app)
        .get('/api/records')
        .set('Authorization', `Bearer ${viewerToken}`);
      expect(res.status).toBe(200);
    });

    it('should allow analyst to list records', async () => {
      const res = await request(app)
        .get('/api/records')
        .set('Authorization', `Bearer ${analystToken}`);
      expect(res.status).toBe(200);
    });

    it('should allow admin to list records', async () => {
      const res = await request(app)
        .get('/api/records')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    it('should deny viewer from creating records', async () => {
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ amount: 100, type: 'income', category: 'Test', date: '2026-01-01' });
      expect(res.status).toBe(403);
    });

    it('should deny analyst from creating records', async () => {
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({ amount: 100, type: 'income', category: 'Test', date: '2026-01-01' });
      expect(res.status).toBe(403);
    });

    it('should allow admin to create records', async () => {
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 100, type: 'income', category: 'Test', date: '2026-01-01' });
      expect(res.status).toBe(201);
    });

    it('should deny viewer from updating records', async () => {
      const res = await request(app)
        .put('/api/records/1')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ amount: 200 });
      expect(res.status).toBe(403);
    });

    it('should deny viewer from deleting records', async () => {
      const res = await request(app)
        .delete('/api/records/1')
        .set('Authorization', `Bearer ${viewerToken}`);
      expect(res.status).toBe(403);
    });
  });

  // ── Dashboard Access ───────────────────────────────────────────────

  describe('Dashboard Access', () => {
    it('should deny viewer from accessing summary', async () => {
      const res = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${viewerToken}`);
      expect(res.status).toBe(403);
    });

    it('should allow analyst to access summary', async () => {
      const res = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${analystToken}`);
      expect(res.status).toBe(200);
    });

    it('should allow admin to access summary', async () => {
      const res = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    it('should deny viewer from accessing category totals', async () => {
      const res = await request(app)
        .get('/api/dashboard/category-totals')
        .set('Authorization', `Bearer ${viewerToken}`);
      expect(res.status).toBe(403);
    });

    it('should deny viewer from accessing trends', async () => {
      const res = await request(app)
        .get('/api/dashboard/trends')
        .set('Authorization', `Bearer ${viewerToken}`);
      expect(res.status).toBe(403);
    });

    it('should allow all authenticated users to access recent activity', async () => {
      const viewerRes = await request(app)
        .get('/api/dashboard/recent')
        .set('Authorization', `Bearer ${viewerToken}`);
      expect(viewerRes.status).toBe(200);

      const analystRes = await request(app)
        .get('/api/dashboard/recent')
        .set('Authorization', `Bearer ${analystToken}`);
      expect(analystRes.status).toBe(200);
    });
  });

  // ── User Management Access ─────────────────────────────────────────

  describe('User Management Access', () => {
    it('should deny viewer from listing users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${viewerToken}`);
      expect(res.status).toBe(403);
    });

    it('should deny analyst from listing users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${analystToken}`);
      expect(res.status).toBe(403);
    });

    it('should allow admin to list users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });
});
