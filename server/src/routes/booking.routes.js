import { Router } from 'express';
import {
  lockSeats,
  releaseSeats,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getSnacks,
} from '../controllers/booking.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Public concessions route
router.get('/snacks', getSnacks);

// Protected routes
router.post('/lock-seats', authenticate, lockSeats);
router.post('/release-seats', authenticate, releaseSeats);
router.get('/my-bookings', authenticate, getMyBookings);
router.get('/:id', authenticate, getBookingById);
router.post('/:id/cancel', authenticate, cancelBooking);

export default router;

