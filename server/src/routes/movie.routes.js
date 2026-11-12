import { Router } from 'express';
import {
  getAllMovies,
  getFeaturedMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} from '../controllers/movie.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';

const router = Router();

// Public routes
router.get('/', getAllMovies);
router.get('/featured', getFeaturedMovies);
router.get('/:id', getMovieById);

// Admin-only routes
router.post('/', authenticate, authorize('ADMIN'), createMovie);
router.put('/:id', authenticate, authorize('ADMIN'), updateMovie);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteMovie);

export default router;

