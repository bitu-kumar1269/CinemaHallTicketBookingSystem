import { Router } from 'express';
import { getTicket, downloadTicketPDF, verifyQRCode } from '../controllers/ticket.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';

const router = Router();

router.get('/:bookingId', authenticate, getTicket);
router.get('/:bookingId/download', authenticate, downloadTicketPDF);
router.post('/verify-qr', authenticate, authorize('ADMIN'), verifyQRCode);

export default router;

