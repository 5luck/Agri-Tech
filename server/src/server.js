import app from './app.js';
import { config } from './config/environment.js';
import { connectDatabase } from './config/database.js';
import { User } from './models/User.js';
import { logger } from './utils/logger.js';

const startServer = async () => {
  try {
    await connectDatabase();

    // Auto-seed demo data if database is empty (e.g. fresh in-memory or empty local instance)
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      logger.info('Database is empty. Automatically initializing demonstration data...');
      const { seedData } = await import('../scripts/seed.js');
      await seedData();
    }

    const server = app.listen(config.port, () => {
      logger.info(`=========================================`);
      logger.info(`Agri-Tech Backend API running on port ${config.port}`);
      logger.info(`Health check: http://localhost:${config.port}/health`);
      logger.info(`Environment: ${config.env}`);
      logger.info(`=========================================`);
    });

    const shutdown = async () => {
      logger.info('Gracefully shutting down Agri-Tech server...');
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
