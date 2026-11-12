import { Router } from 'express';
import { getShows, getShowSeats, createShow, updateShow } from '../controllers/show.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';

const router = Router();

// Optional authentication on getShowSeats so we can detect if a seat is locked by current user
const optionalAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      await authenticate(req, res, () => {});
    }
  } catch (e) {
    // ignore optional token failure
  }
  next();
};

router.get('/', getShows);
router.get('/:id/seats', optionalAuth, getShowSeats);

// Admin-only routes
router.post('/', authenticate, authorize('ADMIN'), createShow);
router.put('/:id', authenticate, authorize('ADMIN'), updateShow);

export default router;

