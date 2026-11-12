import { Router } from 'express';
import {
  getMetrics,
  getRevenueChart,
  getScreenOccupancy,
  getAllBookings,
  getAllUsers,
  toggleUserRole,
} from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';

const router = Router();

// Protect all admin routes with authentication and ADMIN role check
router.use(authenticate, authorize('ADMIN'));

router.get('/metrics', getMetrics);
router.get('/revenue-chart', getRevenueChart);
router.get('/screen-occupancy', getScreenOccupancy);
router.get('/bookings', getAllBookings);
router.get('/users', getAllUsers);
router.put('/users/:id/role', toggleUserRole);

export default router;

