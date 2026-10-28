
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/environment.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { sendSuccess, sendError } from './utils/apiResponse.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import farmsRoutes from './modules/farms/farms.routes.js';
import cropsRoutes from './modules/crops/crops.routes.js';
import soilRoutes from './modules/soil/soil.routes.js';
import weatherRoutes from './modules/weather/weather.routes.js';
import alertsRoutes from './modules/alerts/alerts.routes.js';
import notificationsRoutes from './modules/notifications/notifications.routes.js';
import productsRoutes from './modules/marketplace/products.routes.js';
import ordersRoutes from './modules/orders/orders.routes.js';
import consultationsRoutes from './modules/consultations/consultations.routes.js';
import communityRoutes from './modules/community/community.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
const normalizeOrigin = (value) =>
  value?.trim().replace(/\/+$/, '');

const allowedOrigins = new Set([
  normalizeOrigin(config.clientUrl),
  'https://agri-tech-rj-9136.vercel.app',
  'https://agri-tech-hr011y4e3-rj-9136.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean));

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(normalizeOrigin(origin))) {
      return callback(null, true);
    }

    console.error('[CORS] Blocked origin:', JSON.stringify(origin));
    console.error('[CORS] Allowed origins:', [...allowedOrigins]);

    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
// Register CORS before routes so browser preflight requests are handled.

// Logging
if (config.env !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Global API rate limiting
app.use('/api/', apiLimiter);

// Health check endpoints
const healthHandler = (req, res) => {
  return sendSuccess(
    res,
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: config.env,
      version: '1.0.0',
    },
    'Agri-Tech API is online'
  );
};

app.get('/health', healthHandler);
app.get('/api/v1/health', healthHandler);

// API v1 routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/farms', farmsRoutes);
app.use('/api/v1/crops', cropsRoutes);
app.use('/api/v1/soil-records', soilRoutes);
app.use('/api/v1/weather', weatherRoutes);
app.use('/api/v1/alerts', alertsRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/products', productsRoutes);
app.use('/api/v1/orders', ordersRoutes);
app.use('/api/v1/consultations', consultationsRoutes);
app.use('/api/v1/posts', communityRoutes);
app.use('/api/v1/admin', adminRoutes);

// Catch-all for unmatched API routes
app.use('/api', (req, res) => {
  return sendError(
    res,
    `API route not found: ${req.method} ${req.originalUrl}`,
    404
  );
});

// Global error handler
app.use(errorHandler);

export default app;
