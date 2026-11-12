import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

export const generateTicketPDF = async (booking) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A5',
        margin: 30,
        info: {
          Title: `Ticket - ${booking.bookingNumber}`,
          Author: 'CineWave Cinema Systems',
        },
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Background color & styling
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0B0F17');

      // Golden Header Banner
      doc.rect(20, 20, doc.page.width - 40, 60).fill('#1A2333');
      doc.lineWidth(2).strokeColor('#E50914').rect(20, 20, doc.page.width - 40, 60).stroke();

      doc.fillColor('#E50914').fontSize(22).font('Helvetica-Bold').text('CINEWAVE', 35, 30);
      doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica').text('PREMIUM CINEMA PASS', 35, 56);
      doc.fillColor('#94A3B8').fontSize(10).text(`Booking Ref: ${booking.bookingNumber}`, doc.page.width - 200, 36, { align: 'right' });
      doc.fillColor('#F59E0B').fontSize(10).font('Helvetica-Bold').text(`Ticket: ${booking.ticket?.ticketCode || 'TCK-CONFIRMED'}`, doc.page.width - 200, 52, { align: 'right' });

      // Movie Details Section
      let y = 95;
      doc.fillColor('#FFFFFF').fontSize(16).font('Helvetica-Bold').text(booking.show.movie.title, 30, y);
      
      y += 24;
      const movieMeta = `${booking.show.movie.language} • ${booking.show.movie.certification} • ${booking.show.movie.durationMins} mins • ${booking.show.screen.soundSystem}`;
      doc.fillColor('#94A3B8').fontSize(9).font('Helvetica').text(movieMeta, 30, y);

      // Cinema & Screen Info
      y += 24;
      doc.rect(30, y, doc.page.width - 60, 52).fill('#121824');
      doc.fillColor('#F59E0B').fontSize(8).font('Helvetica-Bold').text('CINEMA & SCREEN', 42, y + 8);
      doc.fillColor('#FFFFFF').fontSize(11).font('Helvetica-Bold').text(`${booking.show.screen.cinemaHall.name}`, 42, y + 20);
      doc.fillColor('#94A3B8').fontSize(8).font('Helvetica').text(`${booking.show.screen.screenNumber} • ${booking.show.screen.cinemaHall.city}`, 42, y + 36);

      // Date & Time
      const showDateStr = new Date(booking.show.startTime).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const showTimeStr = new Date(booking.show.startTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

      doc.fillColor('#F59E0B').fontSize(8).font('Helvetica-Bold').text('DATE & TIME', doc.page.width - 150, y + 8);
      doc.fillColor('#FFFFFF').fontSize(11).font('Helvetica-Bold').text(showTimeStr, doc.page.width - 150, y + 20);
      doc.fillColor('#94A3B8').fontSize(8).font('Helvetica').text(showDateStr, doc.page.width - 150, y + 36);

      // Seats Info
      y += 66;
      doc.rect(30, y, doc.page.width - 60, 54).fill('#1A2333');
      doc.fillColor('#00E5FF').fontSize(8).font('Helvetica-Bold').text('ALLOCATED SEATS', 42, y + 8);
      
      const seatNames = booking.seats
        .map((s) => `${s.seat.rowIdentifier}${s.seat.seatNumber}`)
        .join(', ');
      
      doc.fillColor('#FFFFFF').fontSize(16).font('Helvetica-Bold').text(seatNames, 42, y + 22);
      doc.fillColor('#94A3B8').fontSize(8).font('Helvetica').text(`Total Seats: ${booking.seats.length}`, 42, y + 40);

      const amountStr = `₹${booking.totalAmount.toFixed(2)}`;
      doc.fillColor('#10B981').fontSize(8).font('Helvetica-Bold').text('TOTAL PAID', doc.page.width - 150, y + 8);
      doc.fillColor('#FFFFFF').fontSize(14).font('Helvetica-Bold').text(amountStr, doc.page.width - 150, y + 22);

      // QR Code Generation & Embedding
      y += 68;
      const qrData = booking.ticket?.qrPayload || JSON.stringify({
        ticketCode: booking.ticket?.ticketCode,
        bookingNumber: booking.bookingNumber,
        showId: booking.showId,
      });

      const qrBuffer = await QRCode.toBuffer(qrData, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 130,
        color: { dark: '#000000', light: '#FFFFFF' },
      });

      const qrX = (doc.page.width - 120) / 2;
      doc.image(qrBuffer, qrX, y, { width: 120, height: 120 });

      // Verification instructions
      y += 130;
      doc.fillColor('#94A3B8').fontSize(8).font('Helvetica').text('Scan this secure QR code at the cinema gate for direct entry.', 30, y, {
        align: 'center',
        width: doc.page.width - 60,
      });
      doc.fillColor('#64748B').fontSize(7).text('Non-transferable • Valid only for the specified show date and screen.', 30, y + 14, {
        align: 'center',
        width: doc.page.width - 60,
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

