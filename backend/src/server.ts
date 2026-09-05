import { app } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { prisma } from './config/db';

const server = app.listen(env.port, '0.0.0.0', () => {
  logger.info(`🚀 MoonFit Backend API running on port ${env.port} [${env.NODE_ENV}]`);
  logger.info(`🔗 Health check available at http://localhost:${env.port}/health`);
  logger.info(`🔐 Storage directory: ${env.resolvedStoragePath}`);
});

// Graceful Shutdown
async function shutdown(signal: string) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    logger.info('HTTP server closed.');
    await prisma.$disconnect();
    logger.info('Database connection closed.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
