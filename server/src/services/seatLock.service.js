import prisma from '../config/db.js';
import { ENV } from '../config/env.js';
import { emitSeatLocked, emitSeatReleased } from './socket.service.js';
import { logger } from '../utils/logger.js';

export const seatLockService = {
  /**
   * Acquire temporary lock on seats for a specific show
   */
  async lockSeats(showId, seatIds, userId) {
    if (!seatIds || seatIds.length === 0) {
      throw new Error('At least one seat must be selected to lock.');
    }

    const lockDurationMs = ENV.SEAT_LOCK_MINUTES * 60 * 1000;
    const expiresAt = new Date(Date.now() + lockDurationMs);
    const now = new Date();

    // Execute within a strict Prisma transaction
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch current statuses of requested seats with locking
      const currentShowSeats = await tx.showSeat.findMany({
        where: {
          showId,
          seatId: { in: seatIds },
        },
        include: {
          seat: true,
        },
      });

      if (currentShowSeats.length !== seatIds.length) {
        throw new Error('Some requested seats do not exist for this show.');
      }

      // 2. Validate availability
      const conflictingSeats = [];

      for (const showSeat of currentShowSeats) {
        const isBooked = showSeat.status === 'BOOKED';
        const isLockedByOther =
          showSeat.status === 'LOCKED' &&
          showSeat.lockedUntil &&
          showSeat.lockedUntil > now &&
          showSeat.lockedByUserId !== userId;

        if (isBooked || isLockedByOther) {
          conflictingSeats.push(`${showSeat.seat.rowIdentifier}${showSeat.seat.seatNumber}`);
        }
      }

      if (conflictingSeats.length > 0) {
        const error = new Error(`Seat(s) ${conflictingSeats.join(', ')} are already booked or held by another customer.`);
        error.statusCode = 409;
        throw error;
      }

      // 3. Update seats to LOCKED status
      await tx.showSeat.updateMany({
        where: {
          showId,
          seatId: { in: seatIds },
        },
        data: {
          status: 'LOCKED',
          lockedByUserId: userId,
          lockedUntil: expiresAt,
        },
      });

      // 4. Broadcast via Socket.IO
      emitSeatLocked(showId, seatIds, expiresAt, userId);

      return {
        success: true,
        showId,
        seatIds,
        lockedUntil: expiresAt,
      };
    });
  },

  /**
   * Release locked seats voluntarily
   */
  async releaseSeats(showId, seatIds, userId) {
    return await prisma.$transaction(async (tx) => {
      await tx.showSeat.updateMany({
        where: {
          showId,
          seatId: { in: seatIds },
          status: 'LOCKED',
          lockedByUserId: userId,
        },
        data: {
          status: 'AVAILABLE',
          lockedByUserId: null,
          lockedUntil: null,
        },
      });

      emitSeatReleased(showId, seatIds);

      return { success: true };
    });
  },

  /**
   * Periodic reaper to release expired locks and broadcast to rooms
   */
  async reapExpiredLocks() {
    try {
      const now = new Date();
      const expiredSeats = await prisma.showSeat.findMany({
        where: {
          status: 'LOCKED',
          lockedUntil: {
            lte: now,
          },
        },
        select: {
          id: true,
          showId: true,
          seatId: true,
        },
      });

      if (expiredSeats.length > 0) {
        logger.info(`⏰ Reaping ${expiredSeats.length} expired seat lock(s)...`);

        const expiredIds = expiredSeats.map((s) => s.id);
        await prisma.showSeat.updateMany({
          where: { id: { in: expiredIds } },
          data: {
            status: 'AVAILABLE',
            lockedByUserId: null,
            lockedUntil: null,
          },
        });

        // Group by showId and emit socket events
        const grouped = {};
        for (const s of expiredSeats) {
          if (!grouped[s.showId]) grouped[s.showId] = [];
          grouped[s.showId].push(s.seatId);
        }

        for (const [showId, seatIds] of Object.entries(grouped)) {
          emitSeatReleased(showId, seatIds);
        }
      }
    } catch (err) {
      logger.error('Error during expired lock reaping:', err);
    }
  },

  /**
   * Start recurring background reaper (every 15 seconds)
   */
  startReaper(intervalMs = 15000) {
    logger.info(`🛡️ Seat Lock Background Reaper started (interval: ${intervalMs}ms)`);
    return setInterval(() => {
      this.reapExpiredLocks();
    }, intervalMs);
  },
};

