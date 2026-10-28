import mongoose from 'mongoose';
import { config } from './environment.js';
import { logger } from '../utils/logger.js';

let memServer = null;

export const connectDatabase = async () => {
  try {
    logger.info(`Attempting connection to MongoDB at: ${config.mongoUri}`);
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    logger.info('Connected to MongoDB successfully.');
  } catch (primaryErr) {
    logger.warn(`Primary MongoDB connection failed: ${primaryErr.message}`);

    if (config.env !== 'production') {
      try {
        logger.info('Initializing in-memory MongoDB server for development...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memServer = await MongoMemoryServer.create();
        const memUri = memServer.getUri();
        logger.info(`In-memory MongoDB initialized at: ${memUri}`);

        await mongoose.connect(memUri);
        logger.info('Connected to in-memory MongoDB fallback successfully.');
      } catch (fallbackErr) {
        logger.error(`Fallback in-memory MongoDB failed: ${fallbackErr.message}`);
        throw fallbackErr;
      }
    } else {
      throw primaryErr;
    }
  }
};

export const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    if (memServer) {
      await memServer.stop();
    }
    logger.info('Disconnected from database.');
  } catch (err) {
    logger.error(`Error disconnecting database: ${err.message}`);
  }
};
