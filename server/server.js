import http from 'http';
import app from './src/app.js';
import { ENV } from './src/config/env.js';
import { initializeSocket } from './src/services/socket.service.js';
import { seatLockService } from './src/services/seatLock.service.js';
import { logger } from './src/utils/logger.js';
import prisma from './src/config/db.js';

const httpServer = http.createServer(app);

// Initialize Socket.IO
initializeSocket(httpServer, ENV.CLIENT_URL);

// Start background lock expiry reaper
const reaperInterval = seatLockService.startReaper(15000);

const PORT = ENV.PORT;

httpServer.listen(PORT, () => {
  logger.info(`🚀 CineWave Server running in ${ENV.NODE_ENV} mode on port ${PORT}`);
  logger.info(`📡 WebSocket Server mounted for real-time seat tracking`);
  logger.info(`🌐 Health check available at http://localhost:${PORT}/api/health`);
});

// Graceful Shutdown
const handleShutdown = async (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  clearInterval(reaperInterval);
  httpServer.close(async () => {
    logger.info('HTTP server closed.');
    await prisma.$disconnect();
    logger.info('Database connection closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

