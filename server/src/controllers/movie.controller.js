import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getAllMovies = async (req, res, next) => {
  try {
    const { search, genre, language, status } = req.query;

    const where = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { cast: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (genre) {
      where.genre = { contains: genre, mode: 'insensitive' };
    }

    if (language) {
      where.language = { contains: language, mode: 'insensitive' };
    }

    if (status) {
      where.status = status;
    }

    const movies = await prisma.movie.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { releaseDate: 'desc' }],
    });

    return sendSuccess(res, 'Movies retrieved successfully', movies);
  } catch (err) {
    next(err);
  }
};

export const getFeaturedMovies = async (req, res, next) => {
  try {
    const featured = await prisma.movie.findMany({
      where: { isFeatured: true, status: 'NOW_SHOWING' },
      take: 5,
    });

    const nowShowing = await prisma.movie.findMany({
      where: { status: 'NOW_SHOWING' },
      take: 8,
    });

    const comingSoon = await prisma.movie.findMany({
      where: { status: 'COMING_SOON' },
      take: 6,
    });

    return sendSuccess(res, 'Featured movies retrieved', {
      hero: featured.length > 0 ? featured[0] : nowShowing[0] || null,
      featuredList: featured,
      nowShowing,
      comingSoon,
    });
  } catch (err) {
    next(err);
  }
};

export const getMovieById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        shows: {
          where: {
            startTime: { gte: new Date() },
            status: 'SCHEDULED',
          },
          include: {
            screen: {
              include: {
                cinemaHall: true,
              },
            },
          },
          orderBy: { startTime: 'asc' },
        },
      },
    });

    if (!movie) {
      return sendError(res, 'Movie not found', 404);
    }

    return sendSuccess(res, 'Movie details retrieved', movie);
  } catch (err) {
    next(err);
  }
};

export const createMovie = async (req, res, next) => {
  try {
    const {
      title,
      description,
      genre,
      language,
      durationMins,
      releaseDate,
      director,
      cast,
      rating,
      posterUrl,
      backdropUrl,
      trailerUrl,
      certification,
      status,
      isFeatured,
    } = req.body;

    const movie = await prisma.movie.create({
      data: {
        title,
        description,
        genre,
        language,
        durationMins: parseInt(durationMins, 10),
        releaseDate: new Date(releaseDate),
        director,
        cast,
        rating: parseFloat(rating) || 8.0,
        posterUrl,
        backdropUrl,
        trailerUrl,
        certification: certification || 'UA',
        status: status || 'NOW_SHOWING',
        isFeatured: Boolean(isFeatured),
      },
    });

    return sendSuccess(res, 'Movie created successfully', movie, 201);
  } catch (err) {
    next(err);
  }
};

export const updateMovie = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    if (data.durationMins) data.durationMins = parseInt(data.durationMins, 10);
    if (data.rating) data.rating = parseFloat(data.rating);
    if (data.releaseDate) data.releaseDate = new Date(data.releaseDate);

    const movie = await prisma.movie.update({
      where: { id },
      data,
    });

    return sendSuccess(res, 'Movie updated successfully', movie);
  } catch (err) {
    next(err);
  }
};

export const deleteMovie = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.movie.delete({
      where: { id },
    });

    return sendSuccess(res, 'Movie deleted successfully');
  } catch (err) {
    next(err);
  }
};

