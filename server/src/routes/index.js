import { Router } from 'express';
import authRoutes from './auth.routes.js';
import movieRoutes from './movie.routes.js';
import cinemaRoutes from './cinema.routes.js';
import showRoutes from './show.routes.js';
import bookingRoutes from './booking.routes.js';
import paymentRoutes from './payment.routes.js';
import ticketRoutes from './ticket.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

router.use('/auth', authRoutes);
router.use('/movies', movieRoutes);
router.use('/cinemas', cinemaRoutes);
router.use('/shows', showRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/tickets', ticketRoutes);
router.use('/admin', adminRoutes);

export default router;

