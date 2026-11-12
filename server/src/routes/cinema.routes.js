import { Router } from 'express';
import { getAllCinemas, createCinema, createScreen } from '../controllers/cinema.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';

const router = Router();

router.get('/', getAllCinemas);
router.post('/', authenticate, authorize('ADMIN'), createCinema);
router.post('/screens', authenticate, authorize('ADMIN'), createScreen);

export default router;

