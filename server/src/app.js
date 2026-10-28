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
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true);
      const allowed = [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'];
      if (allowed.includes(origin) || config.env !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Logging
if (config.env !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Global API rate limiting
app.use('/api/', apiLimiter);

// Health check endpoint
const healthHandler = (req, res) => {
  return sendSuccess(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.env,
    version: '1.0.0'
  }, 'Agri-Tech API is online');
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

// Catch-all 404 for unmatched API routes
app.use('/api/*', (req, res) => {
  return sendError(res, `API route not found: ${req.method} ${req.originalUrl}`, 404);
});

// Global Error Handler
app.use(errorHandler);

export default app;
