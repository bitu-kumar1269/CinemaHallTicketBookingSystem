import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getAllCinemas = async (req, res, next) => {
  try {
    const { city } = req.query;
    const where = city ? { city: { equals: city, mode: 'insensitive' } } : {};

    const cinemas = await prisma.cinemaHall.findMany({
      where,
      include: {
        screens: {
          select: {
            id: true,
            screenNumber: true,
            totalCapacity: true,
            soundSystem: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return sendSuccess(res, 'Cinemas retrieved', cinemas);
  } catch (err) {
    next(err);
  }
};

export const createCinema = async (req, res, next) => {
  try {
    const { name, city, address, state, pinCode } = req.body;

    const cinema = await prisma.cinemaHall.create({
      data: {
        name,
        city,
        address,
        state,
        pinCode,
      },
    });

    return sendSuccess(res, 'Cinema created successfully', cinema, 201);
  } catch (err) {
    next(err);
  }
};

export const createScreen = async (req, res, next) => {
  try {
    const { cinemaHallId, screenNumber, soundSystem, layoutConfig } = req.body;

    // layoutConfig format: [{ row: 'A', count: 8, category: 'RECLINER' }, ...]
    const rows = layoutConfig || [
      { row: 'A', count: 8, category: 'RECLINER' },
      { row: 'B', count: 8, category: 'RECLINER' },
      { row: 'C', count: 8, category: 'PREMIUM' },
      { row: 'D', count: 8, category: 'PREMIUM' },
      { row: 'E', count: 8, category: 'PREMIUM' },
      { row: 'F', count: 8, category: 'REGULAR' },
      { row: 'G', count: 8, category: 'REGULAR' },
      { row: 'H', count: 8, category: 'REGULAR' },
    ];

    const totalCapacity = rows.reduce((acc, curr) => acc + curr.count, 0);

    const screen = await prisma.screen.create({
      data: {
        cinemaHallId,
        screenNumber,
        soundSystem: soundSystem || 'Dolby Atmos',
        totalCapacity,
      },
    });

    // Populate physical seats
    const seatData = [];
    for (const r of rows) {
      for (let num = 1; num <= r.count; num++) {
        seatData.push({
          screenId: screen.id,
          rowIdentifier: r.row,
          seatNumber: num,
          category: r.category || 'REGULAR',
        });
      }
    }

    await prisma.seat.createMany({ data: seatData });

    return sendSuccess(res, 'Screen and physical seat layout created', screen, 201);
  } catch (err) {
    next(err);
  }
};

