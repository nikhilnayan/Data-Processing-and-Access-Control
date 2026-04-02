const request = require('supertest');
const app = require('../src/app');
const { setupTestDatabase, teardownTestDatabase } = require('./setup');

describe('Dashboard API', () => {
  let adminToken, analystToken;

  beforeAll(async () => {
    await setupTestDatabase();

    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'admin123' });
    adminToken = adminRes.body.data.token;

    const analystRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'analyst@example.com', password: 'analyst123' });
    analystToken = analystRes.body.data.token;
  });

  afterAll(() => {
    teardownTestDatabase();
  });

  describe('GET /api/dashboard/summary', () => {
    it('should return financial summary', async () => {
      const res = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.summary).toHaveProperty('total_income');
      expect(res.body.data.summary).toHaveProperty('total_expenses');
      expect(res.body.data.summary).toHaveProperty('net_balance');
      expect(res.body.data.summary.total_income).toBeGreaterThan(0);
      expect(res.body.data.summary.total_expenses).toBeGreaterThan(0);
      // Net balance = income - expenses
      expect(res.body.data.summary.net_balance).toBe(
        +(res.body.data.summary.total_income - res.body.data.summary.total_expenses).toFixed(2)
      );
    });

    it('should be accessible by analyst', async () => {
      const res = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.summary).toBeDefined();
    });
  });

  describe('GET /api/dashboard/category-totals', () => {
    it('should return category-wise totals', async () => {
      const res = await request(app)
        .get('/api/dashboard/category-totals')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.categories).toBeInstanceOf(Array);
      expect(res.body.data.categories.length).toBeGreaterThan(0);

      // Each category should have required fields
      res.body.data.categories.forEach((cat) => {
        expect(cat).toHaveProperty('category');
        expect(cat).toHaveProperty('type');
        expect(cat).toHaveProperty('total');
        expect(cat).toHaveProperty('count');
      });
    });

    it('should filter by type', async () => {
      const res = await request(app)
        .get('/api/dashboard/category-totals?type=expense')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      res.body.data.categories.forEach((cat) => {
        expect(cat.type).toBe('expense');
      });
    });
  });

  describe('GET /api/dashboard/trends', () => {
    it('should return monthly trends', async () => {
      const res = await request(app)
        .get('/api/dashboard/trends')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.trends).toBeInstanceOf(Array);

      // Each trend should have required fields
      res.body.data.trends.forEach((trend) => {
        expect(trend).toHaveProperty('month');
        expect(trend).toHaveProperty('income');
        expect(trend).toHaveProperty('expenses');
        expect(trend).toHaveProperty('net');
      });
    });

    it('should accept months parameter', async () => {
      const res = await request(app)
        .get('/api/dashboard/trends?months=3')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.trends).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/dashboard/recent', () => {
    it('should return recent activity', async () => {
      const res = await request(app)
        .get('/api/dashboard/recent')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.records).toBeInstanceOf(Array);
      expect(res.body.data.records.length).toBeLessThanOrEqual(10);
    });

    it('should respect limit parameter', async () => {
      const res = await request(app)
        .get('/api/dashboard/recent?limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.records.length).toBeLessThanOrEqual(5);
    });
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/api/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
