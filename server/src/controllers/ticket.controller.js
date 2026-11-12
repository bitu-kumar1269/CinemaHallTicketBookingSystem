import prisma from '../config/db.js';
import { generateTicketPDF } from '../services/pdf.service.js';
import { generateQRCodeDataURL, verifyTicketPayload } from '../services/qr.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getTicket = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        ticket: true,
        seats: { include: { seat: true } },
        show: {
          include: {
            movie: true,
            screen: { include: { cinemaHall: true } },
          },
        },
        payment: true,
        user: { select: { fullName: true, email: true, phone: true } },
      },
    });

    if (!booking) {
      return sendError(res, 'Booking not found', 404);
    }

    if (!isAdmin && booking.userId !== userId) {
      return sendError(res, 'Access denied', 403);
    }

    if (!booking.ticket) {
      return sendError(res, 'Ticket not yet generated for this booking', 400);
    }

    // Generate Base64 QR code image for instant frontend rendering
    const qrDataUrl = await generateQRCodeDataURL(booking.ticket.qrPayload);

    return sendSuccess(res, 'Ticket retrieved', {
      ticket: booking.ticket,
      qrDataUrl,
      booking: {
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        totalAmount: booking.totalAmount,
        status: booking.status,
        customerName: booking.user.fullName,
        customerEmail: booking.user.email,
        show: {
          movieTitle: booking.show.movie.title,
          posterUrl: booking.show.movie.posterUrl,
          language: booking.show.movie.language,
          certification: booking.show.movie.certification,
          durationMins: booking.show.movie.durationMins,
          cinemaName: booking.show.screen.cinemaHall.name,
          cinemaAddress: `${booking.show.screen.cinemaHall.address}, ${booking.show.screen.cinemaHall.city}`,
          screenNumber: booking.show.screen.screenNumber,
          soundSystem: booking.show.screen.soundSystem,
          startTime: booking.show.startTime,
        },
        seats: booking.seats.map((s) => ({
          name: `${s.seat.rowIdentifier}${s.seat.seatNumber}`,
          category: s.seat.category,
          price: s.price,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const downloadTicketPDF = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        ticket: true,
        seats: { include: { seat: true } },
        show: {
          include: {
            movie: true,
            screen: { include: { cinemaHall: true } },
          },
        },
        payment: true,
        user: { select: { fullName: true, email: true } },
      },
    });

    if (!booking) {
      return sendError(res, 'Booking not found', 404);
    }

    if (!isAdmin && booking.userId !== userId) {
      return sendError(res, 'Access denied', 403);
    }

    const pdfBuffer = await generateTicketPDF(booking);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ticket-${booking.bookingNumber}.pdf`);
    return res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

export const verifyQRCode = async (req, res, next) => {
  try {
    const { qrPayload } = req.body;
    const adminId = req.user.id;

    if (!qrPayload) {
      return sendError(res, 'qrPayload is required', 400);
    }

    let parsedPayload;
    try {
      parsedPayload = typeof qrPayload === 'string' ? JSON.parse(qrPayload) : qrPayload;
    } catch (e) {
      return sendError(res, 'Invalid QR payload format', 400);
    }

    // 1. Verify Cryptographic Signature
    const verificationResult = verifyTicketPayload(parsedPayload);
    if (!verificationResult.valid) {
      return sendError(res, `Verification failed: ${verificationResult.reason}`, 400);
    }

    const { data } = verificationResult;
    const { ticketCode, bookingNumber } = data;

    // 2. Fetch Ticket from Database
    const ticket = await prisma.ticket.findUnique({
      where: { ticketCode },
      include: {
        booking: {
          include: {
            user: { select: { fullName: true, email: true } },
            show: {
              include: {
                movie: true,
                screen: { include: { cinemaHall: true } },
              },
            },
            seats: { include: { seat: true } },
          },
        },
      },
    });

    if (!ticket) {
      return sendError(res, 'Ticket record not found in system', 404);
    }

    // 3. Check if Already Used
    if (ticket.isUsed) {
      await prisma.ticketVerification.create({
        data: {
          ticketId: ticket.id,
          verifiedByAdminId: adminId,
          status: 'ALREADY_USED',
          notes: 'Attempted re-entry on previously scanned ticket.',
        },
      });

      return sendError(res, 'Ticket was already scanned and used!', 409, {
        ticketCode: ticket.ticketCode,
        isUsed: true,
      });
    }

    // 4. Mark Ticket as Used and log verification
    await prisma.$transaction([
      prisma.ticket.update({
        where: { id: ticket.id },
        data: { isUsed: true },
      }),
      prisma.ticketVerification.create({
        data: {
          ticketId: ticket.id,
          verifiedByAdminId: adminId,
          status: 'VALID',
          notes: 'Successful admission granted at cinema gate.',
        },
      }),
    ]);

    return sendSuccess(res, '✅ Ticket verified! Entry granted.', {
      status: 'VALID',
      ticketCode: ticket.ticketCode,
      bookingNumber: ticket.booking.bookingNumber,
      customerName: ticket.booking.user.fullName,
      movie: ticket.booking.show.movie.title,
      cinema: ticket.booking.show.screen.cinemaHall.name,
      screen: ticket.booking.show.screen.screenNumber,
      seats: ticket.booking.seats.map((s) => `${s.seat.rowIdentifier}${s.seat.seatNumber}`).join(', '),
      showTime: ticket.booking.show.startTime,
    });
  } catch (err) {
    next(err);
  }
};

