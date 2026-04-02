const request = require('supertest');
const app = require('../src/app');
const { setupTestDatabase, teardownTestDatabase } = require('./setup');

describe('Financial Records API', () => {
  let adminToken;

  beforeAll(async () => {
    await setupTestDatabase();

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'admin123' });
    adminToken = res.body.data.token;
  });

  afterAll(() => {
    teardownTestDatabase();
  });

  describe('POST /api/records', () => {
    it('should create a financial record', async () => {
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: 1500.50,
          type: 'income',
          category: 'Consulting',
          date: '2026-04-01',
          description: 'Consulting project',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.record.amount).toBe(1500.50);
      expect(res.body.data.record.type).toBe('income');
      expect(res.body.data.record.category).toBe('Consulting');
    });

    it('should reject record with negative amount', async () => {
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: -100,
          type: 'income',
          category: 'Test',
          date: '2026-04-01',
        });

      expect(res.status).toBe(400);
    });

    it('should reject record with invalid type', async () => {
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: 100,
          type: 'transfer',
          category: 'Test',
          date: '2026-04-01',
        });

      expect(res.status).toBe(400);
    });

    it('should reject record with invalid date format', async () => {
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: 100,
          type: 'income',
          category: 'Test',
          date: '04/01/2026',
        });

      expect(res.status).toBe(400);
    });

    it('should reject record without required fields', async () => {
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 100 });

      expect(res.status).toBe(400);
      expect(res.body.details.errors.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/records', () => {
    it('should list all records with pagination', async () => {
      const res = await request(app)
        .get('/api/records')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBeGreaterThan(0);
    });

    it('should filter records by type', async () => {
      const res = await request(app)
        .get('/api/records?type=income')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      res.body.data.forEach((record) => {
        expect(record.type).toBe('income');
      });
    });

    it('should filter records by category', async () => {
      const res = await request(app)
        .get('/api/records?category=Salary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      res.body.data.forEach((record) => {
        expect(record.category).toBe('Salary');
      });
    });

    it('should filter records by date range', async () => {
      const res = await request(app)
        .get('/api/records?startDate=2026-02-01&endDate=2026-02-28')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      res.body.data.forEach((record) => {
        expect(record.date >= '2026-02-01').toBe(true);
        expect(record.date <= '2026-02-28').toBe(true);
      });
    });

    it('should search records by description', async () => {
      const res = await request(app)
        .get('/api/records?search=salary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should paginate results', async () => {
      const res = await request(app)
        .get('/api/records?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(5);
      expect(res.body.pagination.limit).toBe(5);
    });

    it('should sort records by amount ascending', async () => {
      const res = await request(app)
        .get('/api/records?sort=amount&order=asc')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const amounts = res.body.data.map((r) => r.amount);
      for (let i = 1; i < amounts.length; i++) {
        expect(amounts[i]).toBeGreaterThanOrEqual(amounts[i - 1]);
      }
    });
  });

  describe('GET /api/records/:id', () => {
    it('should get a single record', async () => {
      const res = await request(app)
        .get('/api/records/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.record.id).toBe(1);
    });

    it('should return 404 for non-existent record', async () => {
      const res = await request(app)
        .get('/api/records/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/records/:id', () => {
    it('should update a record', async () => {
      const res = await request(app)
        .put('/api/records/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 6000, description: 'Updated salary' });

      expect(res.status).toBe(200);
      expect(res.body.data.record.amount).toBe(6000);
      expect(res.body.data.record.description).toBe('Updated salary');
    });

    it('should return 404 for non-existent record', async () => {
      const res = await request(app)
        .put('/api/records/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 100 });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/records/:id', () => {
    it('should soft-delete a record', async () => {
      // Create a record to delete
      const createRes = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: 50,
          type: 'expense',
          category: 'Test',
          date: '2026-04-01',
          description: 'Record to delete',
        });

      const recordId = createRes.body.data.record.id;

      const deleteRes = await request(app)
        .delete(`/api/records/${recordId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(200);

      // Verify it's no longer accessible
      const getRes = await request(app)
        .get(`/api/records/${recordId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(getRes.status).toBe(404);
    });

    it('should return 404 for non-existent record', async () => {
      const res = await request(app)
        .delete('/api/records/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });
});
