import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { User } from '../src/models/User.js';
import { Farm } from '../src/models/Farm.js';
import { Crop } from '../src/models/Crop.js';
import { SoilRecord } from '../src/models/SoilRecord.js';
import { WeatherData } from '../src/models/WeatherData.js';
import { Alert } from '../src/models/Alert.js';
import { Product } from '../src/models/Product.js';
import { Order } from '../src/models/Order.js';
import { Consultation } from '../src/models/Consultation.js';
import { CommunityPost } from '../src/models/CommunityPost.js';
import { Comment } from '../src/models/Comment.js';
import { Notification } from '../src/models/Notification.js';
import { AuditLog } from '../src/models/AuditLog.js';
import { analyzeSoilMeasurements } from '../src/services/analytics/soilAnalytics.js';
import { logger } from '../src/utils/logger.js';

export const seedData = async () => {
  logger.info('--- Starting Agri-Tech Demonstration Seeder ---');

  // Clear existing collections safely
  await Promise.all([
    User.deleteMany({}),
    Farm.deleteMany({}),
    Crop.deleteMany({}),
    SoilRecord.deleteMany({}),
    WeatherData.deleteMany({}),
    Alert.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    Consultation.deleteMany({}),
    CommunityPost.deleteMany({}),
    Comment.deleteMany({}),
    Notification.deleteMany({}),
    AuditLog.deleteMany({})
  ]);

  const salt = await bcrypt.genSalt(10);
  const commonFarmerHash = await bcrypt.hash('FarmPass123!', salt);
  const commonExpertHash = await bcrypt.hash('ExpertPass123!', salt);
  const adminHash = await bcrypt.hash('AdminPass123!', salt);

  // 1. Users
  logger.info('Seeding users...');
  const admin = await User.create({
    name: 'Platform Administrator',
    email: 'admin@agritech.demo',
    passwordHash: adminHash,
    role: 'admin',
    phone: '+91 98765 00001',
    status: 'active',
    preferredLanguage: 'en'
  });

  const farmer1 = await User.create({
    name: 'Rajesh Patel',
    email: 'rajesh@agritech.demo',
    passwordHash: commonFarmerHash,
    role: 'farmer',
    phone: '+91 98765 43210',
    status: 'active',
    preferredLanguage: 'hi'
  });

  const farmer2 = await User.create({
    name: 'Harpreet Singh',
    email: 'harpreet@agritech.demo',
    passwordHash: commonFarmerHash,
    role: 'farmer',
    phone: '+91 98765 43211',
    status: 'active',
    preferredLanguage: 'en'
  });

  const expert1 = await User.create({
    name: 'Dr. Ananya Sharma',
    email: 'ananya.expert@agritech.demo',
    passwordHash: commonExpertHash,
    role: 'expert',
    phone: '+91 98765 11111',
    status: 'active',
    preferredLanguage: 'en',
    expertProfile: {
      specialization: ['Soil Fertility', 'Crop Nutrition', 'Sustainable Agriculture'],
      qualifications: ['Ph.D. in Agronomy (IARI New Delhi)', 'M.Sc. Soil Science'],
      languages: ['English', 'Hindi', 'Gujarati'],
      verificationStatus: 'verified',
      bio: 'Senior Agricultural Scientist with 14+ years of field advisory experience in soil rejuvenation and micro-nutrient optimization.',
      yearsExperience: 14
    }
  });

  const expert2 = await User.create({
    name: 'Dr. Vikram Rao',
    email: 'vikram.expert@agritech.demo',
    passwordHash: commonExpertHash,
    role: 'expert',
    phone: '+91 98765 22222',
    status: 'active',
    preferredLanguage: 'en',
    expertProfile: {
      specialization: ['Integrated Pest Management (IPM)', 'Plant Pathology', 'Horticulture'],
      qualifications: ['Ph.D. Plant Protection', 'B.Sc. Agriculture (UAS Bangalore)'],
      languages: ['English', 'Hindi', 'Kannada'],
      verificationStatus: 'verified',
      bio: 'Specialist in biological pest defense, organic bio-fungicides, and early diagnosis of viral crop blights.',
      yearsExperience: 11
    }
  });

  const pendingExpert = await User.create({
    name: 'Dr. Meera Iyer',
    email: 'meera.pending@agritech.demo',
    passwordHash: commonExpertHash,
    role: 'expert',
    phone: '+91 98765 33333',
    status: 'active',
    preferredLanguage: 'en',
    expertProfile: {
      specialization: ['Drip Irrigation Engineering', 'Hydroponics'],
      qualifications: ['M.Tech Agricultural Engineering'],
      languages: ['English', 'Tamil'],
      verificationStatus: 'pending',
      bio: 'Hydrological design expert seeking verification on platform.',
      yearsExperience: 6
    }
  });

  // 2. Farms
  logger.info('Seeding farms...');
  const farm1 = await Farm.create({
    ownerId: farmer1._id,
    name: 'Surya Kiran Agro Farm',
    location: {
      state: 'Gujarat',
      district: 'Anand',
      village: 'Boriavi',
      latitude: 22.5645,
      longitude: 72.9289
    },
    area: 12.5,
    areaUnit: 'acre',
    soilType: 'Sandy Loam',
    irrigationMethod: 'Drip & Sprinkler',
    description: 'Specializes in high-grade organic wheat, mustard, and precision tomato cultivation.',
    status: 'active'
  });

  const farm2 = await Farm.create({
    ownerId: farmer1._id,
    name: 'Kaveri Basin Green Orchard',
    location: {
      state: 'Maharashtra',
      district: 'Nashik',
      village: 'Pimpalgaon',
      latitude: 20.1662,
      longitude: 73.9875
    },
    area: 8.0,
    areaUnit: 'acre',
    soilType: 'Black Cotton',
    irrigationMethod: 'Drip',
    description: 'Dedicated table grape vineyards and seasonal bell pepper greenhouses.',
    status: 'active'
  });

  const farm3 = await Farm.create({
    ownerId: farmer2._id,
    name: 'Golden Wheat Fields',
    location: {
      state: 'Punjab',
      district: 'Ludhiana',
      village: 'Samrala',
      latitude: 30.8354,
      longitude: 76.1914
    },
    area: 25.0,
    areaUnit: 'acre',
    soilType: 'Alluvial',
    irrigationMethod: 'Canal & Tube Well',
    description: 'Grain production hub adopting zero-tillage wheat sowing and laser leveling.',
    status: 'active'
  });

  // 3. Crops
  logger.info('Seeding crops...');
  const crop1 = await Crop.create({
    farmId: farm1._id,
    ownerId: farmer1._id,
    name: 'Sharbati Durum Wheat',
    variety: 'HD-2967 High Yield',
    plantingDate: new Date('2026-11-05'),
    expectedHarvestDate: new Date('2027-03-25'),
    growthStage: 'vegetative',
    cultivatedArea: 7.0,
    irrigationMethod: 'Sprinkler',
    status: 'active',
    notes: 'Germination rate was 94%. Pre-sowing zinc sulfate treatment applied.',
    activities: [
      {
        title: 'Initial Land Tillage & Basal Fertilizer',
        type: 'fertilization',
        dueDate: new Date('2026-11-04'),
        completed: true,
        completedAt: new Date('2026-11-04'),
        notes: 'DAP 50kg/acre incorporated with organic manure.'
      },
      {
        title: 'First Crown Root Initiation (CRI) Irrigation',
        type: 'irrigation',
        dueDate: new Date('2026-11-25'),
        completed: true,
        completedAt: new Date('2026-11-25'),
        notes: 'Irrigation scheduled at 21 days after sowing.'
      },
      {
        title: 'Mid-Vegetative Top Dressing (Neem Coated Urea)',
        type: 'fertilization',
        dueDate: new Date('2026-12-15'),
        completed: false,
        notes: 'Split application of 45 kg urea per acre.'
      },
      {
        title: 'Aphid & Rust Scouting',
        type: 'pest_control',
        dueDate: new Date('2026-12-28'),
        completed: false,
        notes: 'Inspect lower leaf canopies for yellow rust pustules.'
      }
    ]
  });

  const crop2 = await Crop.create({
    farmId: farm1._id,
    ownerId: farmer1._id,
    name: 'Hybrid Tomato',
    variety: 'Abhinav F1',
    plantingDate: new Date('2026-09-12'),
    expectedHarvestDate: new Date('2026-12-20'),
    growthStage: 'flowering',
    cultivatedArea: 3.5,
    irrigationMethod: 'Drip',
    status: 'active',
    notes: 'Supported by bamboo trellis staking. Mulching film installed to suppress weeds.',
    activities: [
      {
        title: 'Drip Fertigation (19:19:19 NPK)',
        type: 'fertilization',
        dueDate: new Date('2026-10-10'),
        completed: true,
        completedAt: new Date('2026-10-10')
      },
      {
        title: 'Pruning of Side Suckers',
        type: 'inspection',
        dueDate: new Date('2026-10-25'),
        completed: true,
        completedAt: new Date('2026-10-26')
      },
      {
        title: 'Calcium Nitrate Foliar Spray (Prevent Blossom End Rot)',
        type: 'fertilization',
        dueDate: new Date('2026-11-12'),
        completed: false
      }
    ]
  });

  const crop3 = await Crop.create({
    farmId: farm2._id,
    ownerId: farmer1._id,
    name: 'Thompson Seedless Grapes',
    variety: 'Export Grade Clone',
    plantingDate: new Date('2024-03-10'),
    expectedHarvestDate: new Date('2027-02-28'),
    growthStage: 'ripening',
    cultivatedArea: 8.0,
    irrigationMethod: 'Drip',
    status: 'active',
    notes: 'Bower trellis structure with automated drip moisture sensors.'
  });

  const crop4 = await Crop.create({
    farmId: farm3._id,
    ownerId: farmer2._id,
    name: 'Basmati Rice',
    variety: 'Pusa 1121',
    plantingDate: new Date('2026-07-01'),
    expectedHarvestDate: new Date('2026-11-10'),
    growthStage: 'harvest-ready',
    cultivatedArea: 20.0,
    irrigationMethod: 'Canal',
    status: 'active',
    notes: 'Crop has matured with golden canopy; combine harvester booked for weekend.'
  });

  // 4. Soil Records
  logger.info('Seeding soil records...');
  const m1 = {
    ph: 6.8,
    nitrogen: 185,
    phosphorus: 38,
    potassium: 220,
    moisture: 52,
    temperature: 24,
    electricalConductivity: 0.65,
    organicMatter: 1.4
  };
  await SoilRecord.create({
    farmId: farm1._id,
    cropId: crop1._id,
    ownerId: farmer1._id,
    measurements: m1,
    source: 'laboratory',
    recommendations: analyzeSoilMeasurements(m1, 'Sharbati Durum Wheat'),
    measuredAt: new Date('2026-10-15'),
    notes: 'Standard pre-sowing soil profile testing by State Soil Testing Lab.'
  });

  const m2 = {
    ph: 7.9,
    nitrogen: 120,
    phosphorus: 18,
    potassium: 190,
    moisture: 32,
    temperature: 27,
    electricalConductivity: 0.88,
    organicMatter: 0.9
  };
  await SoilRecord.create({
    farmId: farm1._id,
    cropId: crop2._id,
    ownerId: farmer1._id,
    measurements: m2,
    source: 'sensor',
    recommendations: analyzeSoilMeasurements(m2, 'Tomato'),
    measuredAt: new Date('2026-10-26'),
    notes: 'IoT soil probe telemetry from Sector B plot.'
  });

  // 5. Weather Cache (Open-Meteo demo baseline)
  logger.info('Seeding weather data...');
  await WeatherData.create({
    farmId: farm1._id,
    ownerId: farmer1._id,
    provider: 'Open-Meteo',
    coordinates: { latitude: 22.5645, longitude: 72.9289 },
    current: {
      temperature: 29.4,
      humidity: 58,
      windSpeed: 11.2,
      precipitation: 0.0,
      condition: 'Mainly clear',
      weatherCode: 1
    },
    forecast: [
      { date: '2026-10-28', tempMax: 33.1, tempMin: 21.0, precipitationProbability: 5, precipitationSum: 0.0, condition: 'Clear sky', weatherCode: 0, windSpeedMax: 14.2 },
      { date: '2026-10-29', tempMax: 32.8, tempMin: 20.6, precipitationProbability: 10, precipitationSum: 0.0, condition: 'Mainly clear', weatherCode: 1, windSpeedMax: 12.0 },
      { date: '2026-10-30', tempMax: 31.5, tempMin: 20.1, precipitationProbability: 25, precipitationSum: 1.2, condition: 'Partly cloudy', weatherCode: 2, windSpeedMax: 16.5 },
      { date: '2026-10-31', tempMax: 30.2, tempMin: 19.8, precipitationProbability: 15, precipitationSum: 0.0, condition: 'Mainly clear', weatherCode: 1, windSpeedMax: 11.8 },
      { date: '2026-11-01', tempMax: 31.0, tempMin: 19.5, precipitationProbability: 5, precipitationSum: 0.0, condition: 'Clear sky', weatherCode: 0, windSpeedMax: 10.5 },
      { date: '2026-11-02', tempMax: 32.2, tempMin: 20.2, precipitationProbability: 0, precipitationSum: 0.0, condition: 'Clear sky', weatherCode: 0, windSpeedMax: 9.8 },
      { date: '2026-11-03', tempMax: 32.6, tempMin: 20.5, precipitationProbability: 5, precipitationSum: 0.0, condition: 'Clear sky', weatherCode: 0, windSpeedMax: 10.2 }
    ],
    hourly: [
      { time: '2026-10-28T06:00', temperature: 21.2, precipitationProbability: 0, humidity: 72 },
      { time: '2026-10-28T09:00', temperature: 26.5, precipitationProbability: 5, humidity: 60 },
      { time: '2026-10-28T12:00', temperature: 31.8, precipitationProbability: 5, humidity: 48 },
      { time: '2026-10-28T15:00', temperature: 33.1, precipitationProbability: 10, humidity: 44 },
      { time: '2026-10-28T18:00', temperature: 28.4, precipitationProbability: 5, humidity: 55 },
      { time: '2026-10-28T21:00', temperature: 24.1, precipitationProbability: 0, humidity: 66 }
    ],
    fetchedAt: new Date(),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000)
  });

  // 6. Alerts
  logger.info('Seeding alerts...');
  await Alert.create({
    ownerId: farmer1._id,
    farmId: farm1._id,
    cropId: crop2._id,
    type: 'soil',
    title: 'Moisture Deficit Detected in Tomato Plot',
    description: 'Soil probe Sector B reported 32% moisture, dropping below the 35% critical stress threshold. Fast evaporation observed.',
    severity: 'high',
    source: 'Field Sensor Node #2',
    recommendedAction: 'Trigger evening drip cycle for 90 minutes. Check mulch layer integrity.',
    status: 'unread'
  });

  await Alert.create({
    ownerId: farmer1._id,
    farmId: farm1._id,
    cropId: crop1._id,
    type: 'weather',
    title: 'Sudden Unseasonal Rain Threat on Day 3',
    description: 'Western disturbance forecast predicts light showers (1.2mm) with gusty winds up to 16.5 km/h on Oct 30.',
    severity: 'moderate',
    source: 'IMD / Open-Meteo Weather Advisory',
    recommendedAction: 'Postpone planned foliar fungicide spraying until skies clear.',
    status: 'unread'
  });

  await Alert.create({
    ownerId: farmer1._id,
    farmId: farm2._id,
    cropId: crop3._id,
    type: 'pest',
    title: 'Downy Mildew Warning in Nashik District',
    description: 'High morning humidity (above 85%) and temperature swings in the grape belt are conducive to Plasmopara viticola development.',
    severity: 'critical',
    source: 'National Research Centre for Grapes (NRCG)',
    recommendedAction: 'Inspect underside of tender leaves for oily spots. Apply systemic triazole or copper-based preventative spray.',
    status: 'unread'
  });

  // 7. Marketplace Products
  logger.info('Seeding marketplace products...');
  const prod1 = await Product.create({
    sellerId: admin._id,
    name: 'Certified Sharbati Wheat Seeds (HD-2967)',
    description: 'Premium graded, certified disease-resistant seed with 95%+ germination rate. Ideal for North and Central Indian plains.',
    category: 'seeds',
    price: 1850,
    unit: 'bag (40kg)',
    stock: 45,
    images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'],
    approvalStatus: 'approved',
    isActive: true
  });

  const prod2 = await Product.create({
    sellerId: admin._id,
    name: 'Organic Neem Oil Bio-Pesticide (10,000 PPM)',
    description: 'Cold-pressed azadirachtin-rich natural pest repellent. Effective against sucking pests, aphids, whiteflies, and mites.',
    category: 'crop_protection',
    price: 720,
    unit: 'litre',
    stock: 80,
    images: ['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80'],
    approvalStatus: 'approved',
    isActive: true
  });

  const prod3 = await Product.create({
    sellerId: admin._id,
    name: 'Granular Bio-NPK Microbial Inoculant',
    description: 'Consortium of nitrogen-fixing (Azotobacter), phosphate-solubilizing (PSB), and potash-mobilizing (KMB) beneficial bacteria.',
    category: 'fertilizers',
    price: 450,
    unit: 'bag (5kg)',
    stock: 120,
    images: ['https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=600&q=80'],
    approvalStatus: 'approved',
    isActive: true
  });

  const prod4 = await Product.create({
    sellerId: admin._id,
    name: 'Precision Drip Irrigation Emitter Tube Kit (16mm)',
    description: 'UV-resistant inline cylindrical dripper pipe with 30cm spacing, including end caps, connectors, and flush valves. Covers 1 acre.',
    category: 'irrigation_equipment',
    price: 4800,
    unit: 'roll (400m)',
    stock: 18,
    images: ['https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=600&q=80'],
    approvalStatus: 'approved',
    isActive: true
  });

  const prod5 = await Product.create({
    sellerId: farmer2._id,
    name: 'Organic Vermicompost with Trichoderma',
    description: 'Earthworm castings enriched with beneficial Trichoderma harzianum fungus for suppressing root rot pathogen.',
    category: 'soil_amendments',
    price: 360,
    unit: 'bag (50kg)',
    stock: 65,
    images: ['https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=600&q=80'],
    approvalStatus: 'pending', // Pending admin approval test case
    isActive: true
  });

  // 8. Orders (Development demo order)
  logger.info('Seeding sample orders...');
  await Order.create({
    orderNumber: 'AGRI-2026-104821',
    buyerId: farmer1._id,
    items: [
      {
        productId: prod2._id,
        productName: prod2.name,
        quantity: 2,
        unitPrice: 720,
        unit: 'litre',
        subtotal: 1440
      },
      {
        productId: prod3._id,
        productName: prod3.name,
        quantity: 3,
        unitPrice: 450,
        unit: 'bag (5kg)',
        subtotal: 1350
      }
    ],
    totalAmount: 2790,
    currency: 'INR',
    orderStatus: 'confirmed',
    paymentStatus: 'pending', // Development mode checkout
    shippingAddress: {
      name: 'Rajesh Patel',
      street: 'Farm Plot #14, Boriavi Road',
      villageOrCity: 'Boriavi',
      district: 'Anand',
      state: 'Gujarat',
      pinCode: '388310',
      phone: '+91 98765 43210'
    }
  });

  // 9. Consultations
  logger.info('Seeding consultations...');
  await Consultation.create({
    farmerId: farmer1._id,
    expertId: expert1._id,
    farmId: farm1._id,
    cropId: crop1._id,
    subject: 'Soil alkalinity buffer and micronutrient spray schedule for wheat',
    description: 'Dr. Sharma, our recent soil report shows a pH of 7.9 in Sector B and low available zinc. What formulation do you recommend before the CRI stage?',
    preferredDate: new Date('2026-11-02'),
    status: 'in_progress',
    messages: [
      {
        senderId: farmer1._id,
        senderRole: 'farmer',
        message: 'Dr. Sharma, our recent soil report shows a pH of 7.9 in Sector B and low available zinc. What formulation do you recommend before the CRI stage?',
        sentAt: new Date('2026-10-27T08:30:00Z')
      },
      {
        senderId: expert1._id,
        senderRole: 'expert',
        message: 'Hello Rajesh. With a pH of 7.9, zinc fixation in soil is very common. Rather than soil application, please plan a foliar spray of Chelated Zinc (Zn-EDTA 12%) @ 1g/litre of water along with 2% Urea at 25-30 days after sowing. Avoid mixing directly with alkaline sprays.',
        sentAt: new Date('2026-10-27T10:15:00Z')
      }
    ]
  });

  // 10. Community Forum Posts & Comments
  logger.info('Seeding community posts...');
  const post1 = await CommunityPost.create({
    authorId: farmer1._id,
    title: 'Tips for reducing water consumption using drip scheduling during heatwaves',
    body: 'Over the last two seasons in Anand, we tested running short drip pulses early morning (5 AM - 7 AM) combined with straw mulching. We noticed an almost 35% reduction in irrigation water usage and zero blossom end rot in our tomatoes. How are other members managing high evaporation rates?',
    category: 'equipment',
    tags: ['drip-irrigation', 'water-conservation', 'mulching', 'tomato'],
    status: 'published',
    commentCount: 2
  });

  await Comment.create({
    postId: post1._id,
    authorId: expert1._id,
    body: 'Excellent observation, Rajesh. Morning pulses prevent root waterlogging while keeping soil temperature moderated as ambient temperature climbs past noon. Mulching also preserves beneficial mycorrhizae in the top 10cm.'
  });

  await Comment.create({
    postId: post1._id,
    authorId: farmer2._id,
    body: 'We use laser land levelers in Punjab prior to sowing. It saved us roughly 20-25% water in our flood-irrigated sections as well.'
  });

  const post2 = await CommunityPost.create({
    authorId: expert2._id,
    title: 'Identifying Fall Armyworm vs Stem Borer in Early Maize & Millet',
    body: 'Colleagues and farmers: Please watch for inverted "Y" markings on the head capsule of caterpillars feeding inside whorls. Pheromone traps placed @ 5 per acre offer early detection before defoliation hits economic injury thresholds.',
    category: 'pest_control',
    tags: ['fall-armyworm', 'pest-alert', 'biological-control'],
    status: 'published',
    commentCount: 0
  });

  // 11. Notifications
  logger.info('Seeding notifications...');
  await Notification.create({
    userId: farmer1._id,
    type: 'soil',
    title: 'Soil Test Analysis Ready',
    message: 'Your soil sample analysis for Surya Kiran Agro Farm has been processed with customized nutrient advisories.',
    readAt: null
  });

  await Notification.create({
    userId: farmer1._id,
    type: 'order',
    title: 'Order Confirmed',
    message: 'Order #AGRI-2026-104821 has been confirmed by supplier and is preparing for dispatch.',
    readAt: null
  });

  // 12. Audit Log Baseline
  logger.info('Seeding audit logs...');
  await AuditLog.create({
    actorId: admin._id,
    action: 'SYSTEM_INITIALIZATION_SEED',
    resourceType: 'System',
    outcome: 'success',
    metadata: { environment: 'development', version: '1.0.0' }
  });

  logger.info('========================================================');
  logger.info('Agri-Tech Demonstration Data Seeded Successfully!');
  logger.info('Demo Credentials:');
  logger.info('  Admin:   admin@agritech.demo / AdminPass123!');
  logger.info('  Farmer:  rajesh@agritech.demo / FarmPass123!');
  logger.info('  Farmer:  harpreet@agritech.demo / FarmPass123!');
  logger.info('  Expert:  ananya.expert@agritech.demo / ExpertPass123!');
  logger.info('  Expert:  vikram.expert@agritech.demo / ExpertPass123!');
  logger.info('========================================================');
};

// If run directly from terminal
if (process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    try {
      await connectDatabase();
      await seedData();
      await disconnectDatabase();
      process.exit(0);
    } catch (err) {
      console.error('Seeding failed:', err);
      process.exit(1);
    }
  })();
}
