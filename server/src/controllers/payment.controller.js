import crypto from 'crypto';
import prisma from '../config/db.js';
import { ENV } from '../config/env.js';
import { getRazorpayInstance, verifyRazorpaySignature } from '../config/razorpay.js';
import { signTicketPayload } from '../services/qr.service.js';
import { emitSeatBooked } from '../services/socket.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const createOrder = async (req, res, next) => {
  try {
    const { showId, seatIds, snackItems } = req.body;
    const userId = req.user.id;
    const now = new Date();

    if (!showId || !seatIds || seatIds.length === 0) {
      return sendError(res, 'showId and seatIds are required', 400);
    }

    // 1. Verify user holds active lock on these seats
    const lockedSeats = await prisma.showSeat.findMany({
      where: {
        showId,
        seatId: { in: seatIds },
      },
      include: { seat: true },
    });

    if (lockedSeats.length !== seatIds.length) {
      return sendError(res, 'Some selected seats were not found.', 404);
    }

    for (const ls of lockedSeats) {
      const isLockedByMe = ls.status === 'LOCKED' && ls.lockedByUserId === userId && ls.lockedUntil && ls.lockedUntil > now;
      if (!isLockedByMe) {
        return sendError(res, `Seat ${ls.seat.rowIdentifier}${ls.seat.seatNumber} is no longer locked by you. Please reselect.`, 400);
      }
    }

    // 2. Calculate seat subtotal
    const seatSubtotal = lockedSeats.reduce((acc, curr) => acc + curr.finalPrice, 0);

    // 3. Calculate snacks subtotal if provided
    let snacksSubtotal = 0;
    const validatedSnackItems = [];

    if (snackItems && Array.isArray(snackItems) && snackItems.length > 0) {
      for (const item of snackItems) {
        const snack = await prisma.snack.findUnique({ where: { id: item.snackId } });
        if (snack && snack.isAvailable && item.quantity > 0) {
          const itemTotal = snack.price * item.quantity;
          snacksSubtotal += itemTotal;
          validatedSnackItems.push({
            snackId: snack.id,
            quantity: item.quantity,
            unitPrice: snack.price,
          });
        }
      }
    }

    // 4. Convenience fee and tax
    const convenienceFee = 30.0;
    const taxAmount = Math.round((convenienceFee * 0.18) * 100) / 100; // 18% GST on convenience fee
    const totalAmount = Math.round((seatSubtotal + snacksSubtotal + convenienceFee + taxAmount) * 100) / 100;

    // 5. Generate Booking Number
    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const bookingNumber = `BKG-${datePrefix}-${randomSuffix}`;

    // 6. Create Razorpay order
    const amountInPaise = Math.round(totalAmount * 100);
    let razorpayOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const razorpay = getRazorpayInstance();
    if (razorpay) {
      try {
        const order = await razorpay.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: bookingNumber,
          notes: {
            showId,
            userId,
            seatsCount: seatIds.length,
          },
        });
        razorpayOrderId = order.id;
      } catch (rzpErr) {
        console.warn('⚠️ Razorpay live order creation fallback to simulated test order:', rzpErr.message);
      }
    }

    // 7. Create Pending Booking & Payment in Transaction
    const booking = await prisma.$transaction(async (tx) => {
      const bkg = await tx.booking.create({
        data: {
          bookingNumber,
          userId,
          showId,
          totalAmount,
          convenienceFee,
          taxAmount,
          status: 'PENDING',
          seats: {
            create: lockedSeats.map((ls) => ({
              seatId: ls.seatId,
              price: ls.finalPrice,
            })),
          },
          ...(validatedSnackItems.length > 0 && {
            snacks: {
              create: validatedSnackItems,
            },
          }),
          payment: {
            create: {
              razorpayOrderId,
              amount: totalAmount,
              currency: 'INR',
              status: 'INITIATED',
            },
          },
        },
        include: {
          payment: true,
          show: {
            include: {
              movie: true,
              screen: { include: { cinemaHall: true } },
            },
          },
        },
      });

      return bkg;
    });

    return sendSuccess(res, 'Order created successfully', {
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      razorpayOrderId,
      amount: totalAmount,
      amountInPaise,
      currency: 'INR',
      keyId: ENV.RAZORPAY_KEY_ID,
      show: {
        movieTitle: booking.show.movie.title,
        cinemaName: booking.show.screen.cinemaHall.name,
        screenNumber: booking.show.screen.screenNumber,
        startTime: booking.show.startTime,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const userId = req.user.id;

    if (!bookingId || !razorpayOrderId) {
      return sendError(res, 'bookingId and razorpayOrderId are required', 400);
    }

    // 1. Verify Payment Signature
    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      return sendError(res, 'Payment verification failed: Invalid cryptographic signature.', 400);
    }

    // 2. Fetch Pending Booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        seats: { include: { seat: true } },
        show: {
          include: {
            movie: true,
            screen: { include: { cinemaHall: true } },
          },
        },
        payment: true,
      },
    });

    if (!booking) {
      return sendError(res, 'Booking record not found', 404);
    }

    if (booking.status === 'CONFIRMED') {
      return sendSuccess(res, 'Booking is already confirmed', { bookingId: booking.id, ticketCode: booking.ticket?.ticketCode });
    }

    // 3. Atomically Confirm Booking, Book Seats, and Issue Cryptographically Signed Ticket
    const ticketCode = `TCK-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    const signedTicketData = signTicketPayload({
      ticketCode,
      bookingNumber: booking.bookingNumber,
      showId: booking.showId,
      movieTitle: booking.show.movie.title,
      screen: booking.show.screen.screenNumber,
      cinema: booking.show.screen.cinemaHall.name,
      seats: booking.seats.map((s) => `${s.seat.rowIdentifier}${s.seat.seatNumber}`),
      customerEmail: req.user.email,
      confirmedAt: new Date().toISOString(),
    });

    const seatIds = booking.seats.map((s) => s.seatId);

    const updatedBooking = await prisma.$transaction(async (tx) => {
      // a. Mark payment as SUCCESS
      await tx.payment.update({
        where: { bookingId },
        data: {
          razorpayPaymentId: razorpayPaymentId || `pay_mock_${Date.now()}`,
          razorpaySignature: razorpaySignature || 'mock_verified_signature',
          status: 'SUCCESS',
          paymentMethod: 'Razorpay / Online',
        },
      });

      // b. Mark booking as CONFIRMED
      const confirmed = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CONFIRMED',
        },
      });

      // c. Convert seats in ShowSeat from LOCKED to BOOKED
      await tx.showSeat.updateMany({
        where: {
          showId: booking.showId,
          seatId: { in: seatIds },
        },
        data: {
          status: 'BOOKED',
          lockedByUserId: null,
          lockedUntil: null,
        },
      });

      // d. Create Ticket
      const ticket = await tx.ticket.create({
        data: {
          bookingId: booking.id,
          ticketCode,
          qrPayload: JSON.stringify(signedTicketData),
        },
      });

      return { booking: confirmed, ticket };
    });

    // 4. Emit real-time WebSocket update to all users
    emitSeatBooked(booking.showId, seatIds);

    return sendSuccess(res, 'Payment verified and ticket generated successfully!', {
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      ticketCode: updatedBooking.ticket.ticketCode,
      status: 'CONFIRMED',
    });
  } catch (err) {
    next(err);
  }
};

