import prisma from '../config/db.js';
import { seatLockService } from '../services/seatLock.service.js';
import { emitSeatReleased } from '../services/socket.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const lockSeats = async (req, res, next) => {
  try {
    const { showId, seatIds } = req.body;
    const userId = req.user.id;

    if (!showId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return sendError(res, 'showId and a non-empty array of seatIds are required.', 400);
    }

    const result = await seatLockService.lockSeats(showId, seatIds, userId);
    return sendSuccess(res, 'Seats locked successfully for 8 minutes', result);
  } catch (err) {
    next(err);
  }
};

export const releaseSeats = async (req, res, next) => {
  try {
    const { showId, seatIds } = req.body;
    const userId = req.user.id;

    if (!showId || !seatIds) {
      return sendError(res, 'showId and seatIds are required.', 400);
    }

    await seatLockService.releaseSeats(showId, seatIds, userId);
    return sendSuccess(res, 'Seats released successfully');
  } catch (err) {
    next(err);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        show: {
          include: {
            movie: true,
            screen: {
              include: {
                cinemaHall: true,
              },
            },
          },
        },
        seats: {
          include: {
            seat: true,
          },
        },
        snacks: {
          include: {
            snack: true,
          },
        },
        payment: true,
        ticket: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, 'My bookings retrieved', bookings);
  } catch (err) {
    next(err);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        show: {
          include: {
            movie: true,
            screen: {
              include: {
                cinemaHall: true,
              },
            },
          },
        },
        seats: {
          include: {
            seat: true,
          },
        },
        snacks: {
          include: {
            snack: true,
          },
        },
        payment: true,
        ticket: true,
      },
    });

    if (!booking) {
      return sendError(res, 'Booking not found', 404);
    }

    if (!isAdmin && booking.userId !== userId) {
      return sendError(res, 'Access denied', 403);
    }

    return sendSuccess(res, 'Booking details retrieved', booking);
  } catch (err) {
    next(err);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        show: true,
        seats: true,
      },
    });

    if (!booking) {
      return sendError(res, 'Booking not found', 404);
    }

    if (!isAdmin && booking.userId !== userId) {
      return sendError(res, 'Access denied', 403);
    }

    if (booking.status === 'CANCELLED') {
      return sendError(res, 'Booking is already cancelled', 400);
    }

    // Cancellation policy: Allowed if show start time is at least 2 hours in the future
    const now = new Date();
    const hoursDifference = (booking.show.startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDifference < 2 && !isAdmin) {
      return sendError(res, 'Cancellation window closed. Bookings can only be cancelled at least 2 hours before showtime.', 400);
    }

    // Perform atomic cancellation & seat release
    await prisma.$transaction(async (tx) => {
      // 1. Update booking status
      await tx.booking.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      // 2. Mark payment as refunded
      await tx.payment.updateMany({
        where: { bookingId: id },
        data: { status: 'REFUNDED' },
      });

      // 3. Free up seats in ShowSeat
      const seatIds = booking.seats.map((s) => s.seatId);
      await tx.showSeat.updateMany({
        where: {
          showId: booking.showId,
          seatId: { in: seatIds },
        },
        data: {
          status: 'AVAILABLE',
          lockedByUserId: null,
          lockedUntil: null,
        },
      });

      // 4. Invalidate ticket
      await tx.ticket.updateMany({
        where: { bookingId: id },
        data: { isUsed: true },
      });
    });

    // Broadcast seat availability update via Socket.IO
    emitSeatReleased(
      booking.showId,
      booking.seats.map((s) => s.seatId)
    );

    return sendSuccess(res, 'Booking cancelled successfully. Refund initiated.', {
      bookingId: id,
      status: 'CANCELLED',
    });
  } catch (err) {
    next(err);
  }
};

export const getSnacks = async (req, res, next) => {
  try {
    const snacks = await prisma.snack.findMany({
      where: { isAvailable: true },
    });
    return sendSuccess(res, 'Snacks catalog retrieved', snacks);
  } catch (err) {
    next(err);
  }
};

