import request from 'supertest';
import app from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { seedData } from '../scripts/seed.js';

describe('Agri-Tech API & Authorization Test Suite', () => {
  let farmerToken = '';
  let farmerId = '';
  let adminToken = '';
  let otherFarmerToken = '';
  let farmId = '';

  beforeAll(async () => {
    await connectDatabase();
    await seedData();

    // Login primary farmer (Rajesh)
    const farmerRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'rajesh@agritech.demo', password: 'FarmPass123!' });
    expect(farmerRes.status).toBe(200);
    farmerToken = farmerRes.body.data.token;
    farmerId = farmerRes.body.data.user._id;

    // Login other farmer (Harpreet)
    const otherRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'harpreet@agritech.demo', password: 'FarmPass123!' });
    expect(otherRes.status).toBe(200);
    otherFarmerToken = otherRes.body.data.token;

    // Login admin
    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@agritech.demo', password: 'AdminPass123!' });
    expect(adminRes.status).toBe(200);
    adminToken = adminRes.body.data.token;
  }, 30000);

  afterAll(async () => {
    await disconnectDatabase();
  });

  describe('1. Health and Public Endpoints', () => {
    it('GET /health returns healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('healthy');
    });

    it('GET /api/v1/products returns approved products list', async () => {
      const res = await request(app).get('/api/v1/products');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/consultations/experts returns verified expert directory', async () => {
      const res = await request(app).get('/api/v1/consultations/experts');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('2. Authentication & Role Validation', () => {
    it('Registers a new farmer successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Suresh Kumar',
          email: 'suresh.new@agritech.demo',
          password: 'SecretPass123!',
          phone: '+91 98765 99999'
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('suresh.new@agritech.demo');
      expect(res.body.data.user.role).toBe('farmer');
      expect(res.body.data.user.passwordHash).toBeUndefined(); // Never expose password hash
    });

    it('Rejects duplicate email registration', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Duplicate',
          email: 'rajesh@agritech.demo',
          password: 'SecretPass123!'
        });
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('Prevents public user from registering as admin', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Hacker',
          email: 'hacker@agritech.demo',
          password: 'SecretPass123!',
          role: 'admin'
        });
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('Rejects invalid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'rajesh@agritech.demo',
          password: 'WrongPassword!'
        });
      expect(res.status).toBe(401);
    });
  });

  describe('3. Farm & Crop Management with Data Ownership Checks', () => {
    it('Creates a new farm for authenticated farmer', async () => {
      const res = await request(app)
        .post('/api/v1/farms')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          name: 'Narmada Valley Plot',
          location: {
            state: 'Madhya Pradesh',
            district: 'Hoshangabad',
            village: 'Babai',
            latitude: 22.75,
            longitude: 77.72
          },
          area: 15.0,
          areaUnit: 'acre',
          soilType: 'Black Clay',
          irrigationMethod: 'Canal'
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Narmada Valley Plot');
      farmId = res.body.data._id;
    });

    it('Farmer A CANNOT view or modify Farmer B private farm records', async () => {
      // Harpreet attempts to access Rajesh's farm
      const res = await request(app)
        .get(`/api/v1/farms/${farmId}`)
        .set('Authorization', `Bearer ${otherFarmerToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('Farmer A can view their own farm details', async () => {
      const res = await request(app)
        .get(`/api/v1/farms/${farmId}`)
        .set('Authorization', `Bearer ${farmerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Narmada Valley Plot');
    });

    it('Creates and lists crops on the farm', async () => {
      const res = await request(app)
        .post('/api/v1/crops')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          farmId,
          name: 'Soybean',
          variety: 'JS-335',
          plantingDate: '2026-06-20',
          expectedHarvestDate: '2026-10-10',
          growthStage: 'vegetative',
          cultivatedArea: 10.0
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Soybean');
    });

    it('Prevents registering crop on a farm owned by another farmer', async () => {
      const res = await request(app)
        .post('/api/v1/crops')
        .set('Authorization', `Bearer ${otherFarmerToken}`)
        .send({
          farmId,
          name: 'Intruder Crop',
          plantingDate: '2026-06-20',
          cultivatedArea: 5.0
        });
      expect(res.status).toBe(403);
    });
  });

  describe('4. Soil Health & Rule-based Interpretation Engine', () => {
    it('Creates soil record and generates agronomic recommendations', async () => {
      const res = await request(app)
        .post(`/api/v1/soil-records/farm/${farmId}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          measurements: {
            ph: 5.4, // Acidic
            nitrogen: 110, // Low
            phosphorus: 15, // Low
            potassium: 195, // Optimal
            moisture: 28 // Deficient
          },
          source: 'manual',
          notes: 'Test field measurement'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      const { recommendations } = res.body.data;
      expect(Array.isArray(recommendations)).toBe(true);

      const phRec = recommendations.find((r) => r.parameter === 'pH');
      expect(phRec.status).toBe('low');
      expect(phRec.action).toContain('lime');

      const moistureRec = recommendations.find((r) => r.parameter === 'Moisture');
      expect(moistureRec.status).toBe('critical');
    });

    it('Validates measurement boundaries', async () => {
      const res = await request(app)
        .post(`/api/v1/soil-records/farm/${farmId}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          measurements: {
            ph: 18.5, // Invalid pH (>14)
            nitrogen: 100,
            phosphorus: 20,
            potassium: 150,
            moisture: 50
          }
        });
      expect(res.status).toBe(400);
    });
  });

  describe('5. Marketplace & Server-Validated Orders', () => {
    it('Creates order with server-side price calculation and stock decrement', async () => {
      const productsRes = await request(app).get('/api/v1/products');
      const product = productsRes.body.data[0];
      const initialStock = product.stock;

      const orderRes = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          items: [
            {
              productId: product._id,
              quantity: 2
            }
          ],
          shippingAddress: {
            name: 'Rajesh Patel',
            street: 'Farm Plot #14',
            villageOrCity: 'Boriavi',
            district: 'Anand',
            state: 'Gujarat',
            pinCode: '388310',
            phone: '+91 98765 43210'
          }
        });

      expect(orderRes.status).toBe(201);
      expect(orderRes.body.success).toBe(true);
      expect(orderRes.body.data.orderStatus).toBe('pending');
      expect(orderRes.body.data.totalAmount).toBe(product.price * 2);

      // Verify stock was decremented
      const checkProd = await request(app).get(`/api/v1/products/${product._id}`);
      expect(checkProd.body.data.stock).toBe(initialStock - 2);
    });

    it('Rejects order if requested quantity exceeds stock', async () => {
      const productsRes = await request(app).get('/api/v1/products');
      const product = productsRes.body.data[0];

      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          items: [{ productId: product._id, quantity: 99999 }],
          shippingAddress: {
            name: 'Rajesh',
            street: 'Plot 1',
            villageOrCity: 'Anand',
            district: 'Anand',
            state: 'Gujarat',
            pinCode: '388310',
            phone: '9876543210'
          }
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Insufficient stock');
    });
  });

  describe('6. Administrative Authorization & Control', () => {
    it('Blocks non-admin users from administrative endpoints', async () => {
      const res = await request(app)
        .get('/api/v1/admin/overview')
        .set('Authorization', `Bearer ${farmerToken}`);
      expect(res.status).toBe(403);
    });

    it('Allows admin to retrieve platform metrics', async () => {
      const res = await request(app)
        .get('/api/v1/admin/overview')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.metrics.totalUsers).toBeGreaterThan(0);
      expect(res.body.data.metrics.totalFarms).toBeGreaterThan(0);
    });

    it('Admin can suspend and reactivate a user account', async () => {
      // Find a user to suspend
      const usersRes = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);
      const targetUser = usersRes.body.data.find((u) => u.role === 'farmer' && u.email.includes('suresh'));

      // Suspend
      const suspendRes = await request(app)
        .patch(`/api/v1/admin/users/${targetUser._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'suspended' });
      expect(suspendRes.status).toBe(200);
      expect(suspendRes.body.data.status).toBe('suspended');

      // Attempt to login suspended user
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: targetUser.email, password: 'SecretPass123!' });
      expect(loginRes.status).toBe(403);
      expect(loginRes.body.message).toContain('suspended');

      // Reactivate
      const reactivateRes = await request(app)
        .patch(`/api/v1/admin/users/${targetUser._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'active' });
      expect(reactivateRes.status).toBe(200);
      expect(reactivateRes.body.data.status).toBe('active');
    });
  });
});
