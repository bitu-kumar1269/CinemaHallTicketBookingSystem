import { Server } from 'socket.io';
import { logger } from '../utils/logger.js';

let ioInstance = null;

export const initializeSocket = (httpServer, clientUrl) => {
  const allowedOrigins = clientUrl
    ? clientUrl.split(',').map((u) => u.trim()).filter(Boolean)
    : ['*'];

  ioInstance = new Server(httpServer, {
    cors: {
      origin:
        allowedOrigins.length === 1 && allowedOrigins[0] !== '*'
          ? allowedOrigins[0]
          : allowedOrigins.includes('*')
          ? '*'
          : allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  ioInstance.on('connection', (socket) => {
    logger.info(`⚡ Socket client connected: ${socket.id}`);

    // Join show room for real-time seat tracking
    socket.on('join_show', (showId) => {
      if (showId) {
        socket.join(`show:${showId}`);
        logger.info(`Socket ${socket.id} joined room: show:${showId}`);
      }
    });

    // Leave show room
    socket.on('leave_show', (showId) => {
      if (showId) {
        socket.leave(`show:${showId}`);
        logger.info(`Socket ${socket.id} left room: show:${showId}`);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`⚡ Socket client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
};

export const getIO = () => {
  return ioInstance;
};

/**
 * Broadcast seat lock event to all users in the show room
 */
export const emitSeatLocked = (showId, seatIds, lockedUntil, userId) => {
  if (ioInstance) {
    ioInstance.to(`show:${showId}`).emit('seat_locked', {
      showId,
      seatIds,
      lockedUntil,
      lockedByUserId: userId,
    });
  }
};

/**
 * Broadcast seat release event
 */
export const emitSeatReleased = (showId, seatIds) => {
  if (ioInstance) {
    ioInstance.to(`show:${showId}`).emit('seat_released', {
      showId,
      seatIds,
    });
  }
};

/**
 * Broadcast final confirmed booking event
 */
export const emitSeatBooked = (showId, seatIds) => {
  if (ioInstance) {
    ioInstance.to(`show:${showId}`).emit('seat_booked', {
      showId,
      seatIds,
    });
  }
};

