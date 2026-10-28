import request from 'supertest';
import app from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { seedData } from '../scripts/seed.js';

describe('Agri-Tech Advanced Workflows & Lifecycle Tests', () => {
  let farmerToken = '';
  let expertToken = '';
  let adminToken = '';
  let expertId = '';
  let farmId = '';

  beforeAll(async () => {
    await connectDatabase();
    await seedData();

    // Login farmer (Rajesh)
    const fRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'rajesh@agritech.demo', password: 'FarmPass123!' });
    farmerToken = fRes.body.data.token;

    // Login expert (Dr. Ananya)
    const eRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'ananya.expert@agritech.demo', password: 'ExpertPass123!' });
    expertToken = eRes.body.data.token;
    expertId = eRes.body.data.user._id;

    // Login admin
    const aRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@agritech.demo', password: 'AdminPass123!' });
    adminToken = aRes.body.data.token;

    // Get farmer's farm
    const farmsRes = await request(app)
      .get('/api/v1/farms')
      .set('Authorization', `Bearer ${farmerToken}`);
    farmId = farmsRes.body.data[0]._id;
  }, 35000);

  afterAll(async () => {
    await disconnectDatabase();
  });

  describe('1. Consultation Complete Lifecycle', () => {
    let consultationId = '';

    it('Farmer submits consultation request to verified expert', async () => {
      const res = await request(app)
        .post('/api/v1/consultations')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          expertId,
          farmId,
          subject: 'Pest attack on mustard leaves',
          description: 'Observed yellow aphid clusters on flowering stems.',
          preferredDate: '2026-11-05'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('pending');
      expect(res.body.data.messages.length).toBe(1);
      consultationId = res.body.data._id;
    });

    it('Expert views consultation and adds response message', async () => {
      const res = await request(app)
        .post(`/api/v1/consultations/${consultationId}/messages`)
        .set('Authorization', `Bearer ${expertToken}`)
        .send({
          message: 'Please spray cold-pressed Neem Oil (10,000 PPM) @ 3ml/litre of water.'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.messages.length).toBe(2);
      expect(res.body.data.status).toBe('in_progress');
    });

    it('Expert updates consultation status to completed', async () => {
      const res = await request(app)
        .patch(`/api/v1/consultations/${consultationId}/status`)
        .set('Authorization', `Bearer ${expertToken}`)
        .send({
          status: 'completed',
          expertResponse: 'Treatment plan delivered. Farmer confirmed pest count decline.'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('completed');
    });
  });

  describe('2. Community Forum & Admin Moderation', () => {
    let postId = '';

    it('Farmer creates forum post and expert replies with comment', async () => {
      const postRes = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          title: 'Testing bio-fungicide in humid weather',
          body: 'We applied Trichoderma harzianum to prevent root rot. Any advice on ideal soil moisture?',
          category: 'soil_health',
          tags: ['bio-fungicide', 'root-rot', 'trichoderma']
        });

      expect(postRes.status).toBe(201);
      expect(postRes.body.data.title).toContain('bio-fungicide');
      expect(postRes.body.data.body).toContain('Trichoderma');
      postId = postRes.body.data._id;

      const commentRes = await request(app)
        .post(`/api/v1/posts/${postId}/comments`)
        .set('Authorization', `Bearer ${expertToken}`)
        .send({
          body: 'Ensure soil moisture is maintained between 45% and 60% for microbial colony establishment.'
        });

      expect(commentRes.status).toBe(201);
      expect(commentRes.body.data.body).toContain('microbial colony');
    });

    it('User reports inappropriate post and admin moderates it', async () => {
      // Create spam post
      const spamRes = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          title: 'Suspicious chemical advert',
          body: 'Buy uncertified pesticide from untrusted link http://suspicious-site.test',
          category: 'general'
        });
      const spamPostId = spamRes.body.data._id;

      // Report it
      const reportRes = await request(app)
        .post(`/api/v1/posts/${spamPostId}/report`)
        .set('Authorization', `Bearer ${expertToken}`)
        .send({ reason: 'Unverified unauthorized pesticide advertisement' });
      expect(reportRes.status).toBe(200);

      // Admin views flagged reports
      const adminReportsRes = await request(app)
        .get('/api/v1/admin/reports')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(adminReportsRes.status).toBe(200);
      const flagged = adminReportsRes.body.data.find((p) => p._id === spamPostId);
      expect(flagged).toBeDefined();

      // Admin removes post
      const removeRes = await request(app)
        .patch(`/api/v1/admin/reports/${spamPostId}/action`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'remove' });
      expect(removeRes.status).toBe(200);
      expect(removeRes.body.data.status).toBe('removed');

      // Verify public cannot view removed post
      const checkRes = await request(app).get(`/api/v1/posts/${spamPostId}`);
      expect(checkRes.status).toBe(404);
    });
  });

  describe('3. Seller Product Submission & Admin Approval Lifecycle', () => {
    let pendingProductId = '';

    it('Seller/Farmer submits new product as pending', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          name: 'Handcrafted Neem Wood Seed Dibbler',
          description: 'Ergonomic traditional planting tool for precise depth and spacing.',
          category: 'tools',
          price: 280,
          unit: 'unit',
          stock: 25
        });

      expect(res.status).toBe(201);
      expect(res.body.data.approvalStatus).toBe('pending');
      pendingProductId = res.body.data._id;
    });

    it('Pending product does NOT appear in public catalog until approved', async () => {
      const publicRes = await request(app).get('/api/v1/products');
      const found = publicRes.body.data.find((p) => p._id === pendingProductId);
      expect(found).toBeUndefined();
    });

    it('Admin approves product and it becomes visible in public marketplace', async () => {
      const approveRes = await request(app)
        .patch(`/api/v1/admin/products/${pendingProductId}/approval`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ approvalStatus: 'approved' });
      expect(approveRes.status).toBe(200);

      const publicRes = await request(app).get('/api/v1/products');
      const found = publicRes.body.data.find((p) => p._id === pendingProductId);
      expect(found).toBeDefined();
      expect(found.name).toBe('Handcrafted Neem Wood Seed Dibbler');
    });
  });

  describe('4. Centralized Notifications & Alerts Lifecycle', () => {
    it('Retrieves user notifications and marks all as read', async () => {
      const notifRes = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${farmerToken}`);
      expect(notifRes.status).toBe(200);
      expect(Array.isArray(notifRes.body.data.notifications)).toBe(true);

      const markAllRes = await request(app)
        .patch('/api/v1/notifications/read-all')
        .set('Authorization', `Bearer ${farmerToken}`);
      expect(markAllRes.status).toBe(200);

      const checkRes = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${farmerToken}`);
      expect(checkRes.body.data.unreadCount).toBe(0);
    });
  });
});
