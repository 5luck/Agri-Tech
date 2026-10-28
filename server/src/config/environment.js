import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/agritech',
  jwtSecret: process.env.JWT_ACCESS_SECRET || 'agritech_super_secret_jwt_access_key_2026_dev_seed',
  jwtExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  weatherApiBaseUrl: process.env.WEATHER_API_BASE_URL || 'https://api.open-meteo.com',
  logLevel: process.env.LOG_LEVEL || 'debug'
};
