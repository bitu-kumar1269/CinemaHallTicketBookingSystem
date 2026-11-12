import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getShows = async (req, res, next) => {
  try {
    const { movieId, date, cinemaId, city } = req.query;

    const where = {
      status: 'SCHEDULED',
    };

    if (movieId) {
      where.movieId = movieId;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.startTime = {
        gte: startOfDay,
        lte: endOfDay,
      };
    } else {
      where.startTime = { gte: new Date() };
    }

    if (cinemaId) {
      where.screen = { cinemaHallId: cinemaId };
    }

    if (city) {
      where.screen = { cinemaHall: { city: { equals: city, mode: 'insensitive' } } };
    }

    const shows = await prisma.show.findMany({
      where,
      include: {
        movie: true,
        screen: {
          include: {
            cinemaHall: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    return sendSuccess(res, 'Shows retrieved', shows);
  } catch (err) {
    next(err);
  }
};

export const getShowSeats = async (req, res, next) => {
  try {
    const { id: showId } = req.params;
    const currentUserId = req.user?.id || null;
    const now = new Date();

    const show = await prisma.show.findUnique({
      where: { id: showId },
      include: {
        movie: true,
        screen: {
          include: {
            cinemaHall: true,
          },
        },
      },
    });

    if (!show) {
      return sendError(res, 'Show not found', 404);
    }

    const showSeats = await prisma.showSeat.findMany({
      where: { showId },
      include: {
        seat: true,
      },
      orderBy: [
        { seat: { rowIdentifier: 'asc' } },
        { seat: { seatNumber: 'asc' } },
      ],
    });

    // Map each seat with real-time status and lock countdown
    const processedSeats = showSeats.map((ss) => {
      let activeStatus = ss.status;
      let remainingLockSeconds = 0;
      let isLockedByMe = false;

      if (ss.status === 'LOCKED') {
        if (ss.lockedUntil && ss.lockedUntil > now) {
          remainingLockSeconds = Math.max(0, Math.floor((ss.lockedUntil.getTime() - now.getTime()) / 1000));
          isLockedByMe = currentUserId && ss.lockedByUserId === currentUserId;
        } else {
          // Lock has expired
          activeStatus = 'AVAILABLE';
        }
      }

      return {
        showSeatId: ss.id,
        seatId: ss.seatId,
        row: ss.seat.rowIdentifier,
        number: ss.seat.seatNumber,
        category: ss.seat.category,
        price: ss.finalPrice,
        status: activeStatus,
        isLockedByMe,
        remainingLockSeconds,
      };
    });

    // Group seats by row for clean rendering in seat layout
    const rowsMap = {};
    for (const seat of processedSeats) {
      if (!rowsMap[seat.row]) {
        rowsMap[seat.row] = {
          row: seat.row,
          category: seat.category,
          seats: [],
        };
      }
      rowsMap[seat.row].seats.push(seat);
    }

    const groupedRows = Object.values(rowsMap);

    return sendSuccess(res, 'Show seating layout retrieved', {
      show: {
        id: show.id,
        startTime: show.startTime,
        endTime: show.endTime,
        basePrice: show.basePrice,
        movie: show.movie,
        screen: show.screen,
      },
      rows: groupedRows,
      allSeats: processedSeats,
    });
  } catch (err) {
    next(err);
  }
};

export const createShow = async (req, res, next) => {
  try {
    const { movieId, screenId, startTime, endTime, basePrice } = req.body;

    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date(start.getTime() + 2.5 * 60 * 60 * 1000);

    const show = await prisma.show.create({
      data: {
        movieId,
        screenId,
        startTime: start,
        endTime: end,
        basePrice: parseFloat(basePrice) || 250.0,
      },
    });

    // Automatically initialize ShowSeat records for every seat in that screen
    const screenSeats = await prisma.seat.findMany({
      where: { screenId },
    });

    const showSeatBatch = screenSeats.map((seat) => {
      let multiplier = 1.0;
      if (seat.category === 'PREMIUM') multiplier = 1.35;
      if (seat.category === 'RECLINER') multiplier = 1.8;

      return {
        showId: show.id,
        seatId: seat.id,
        status: 'AVAILABLE',
        finalPrice: Math.round(parseFloat(basePrice) * multiplier),
      };
    });

    await prisma.showSeat.createMany({ data: showSeatBatch });

    return sendSuccess(res, 'Show scheduled and seating initialized successfully', show, 201);
  } catch (err) {
    next(err);
  }
};

export const updateShow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, basePrice } = req.body;

    const updated = await prisma.show.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(basePrice && { basePrice: parseFloat(basePrice) }),
      },
    });

    return sendSuccess(res, 'Show updated', updated);
  } catch (err) {
    next(err);
  }
};

