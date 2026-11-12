import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🎬 Starting Cinema Database Seeding...');

  // 1. Clean existing records (in order of relations)
  await prisma.ticketVerification.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.bookingSnack.deleteMany({});
  await prisma.bookingSeat.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.showSeat.deleteMany({});
  await prisma.show.deleteMany({});
  await prisma.seat.deleteMany({});
  await prisma.screen.deleteMany({});
  await prisma.cinemaHall.deleteMany({});
  await prisma.movie.deleteMany({});
  await prisma.snack.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🧹 Cleaned existing tables.');

  // 2. Create Users (Admin, Demo Customer, Staff)
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('Admin@12345', salt);
  const customerPassword = await bcrypt.hash('Customer@12345', salt);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@cinema.com',
      passwordHash: adminPassword,
      fullName: 'Vikramaditya Singhania',
      phone: '+919876543210',
      role: 'ADMIN',
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: 'customer@cinema.com',
      passwordHash: customerPassword,
      fullName: 'Aarav Mehta',
      phone: '+919123456780',
      role: 'CUSTOMER',
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: 'staff@cinema.com',
      passwordHash: adminPassword,
      fullName: 'Rohan Sharma (Gate Check)',
      phone: '+919811223344',
      role: 'ADMIN',
    },
  });

  console.log('👤 Users seeded (Admin: admin@cinema.com / Admin@12345, Customer: customer@cinema.com / Customer@12345)');

  // 3. Create Cinema Halls
  const cinemaMumbai = await prisma.cinemaHall.create({
    data: {
      name: 'PVR INOX Phoenix Palladium',
      city: 'Mumbai',
      address: '462 Senapati Bapat Marg, Lower Parel',
      state: 'Maharashtra',
      pinCode: '400013',
    },
  });

  const cinemaBangalore = await prisma.cinemaHall.create({
    data: {
      name: 'PVR Director\'s Cut Forum Rex',
      city: 'Bengaluru',
      address: 'Hosur Road, Koramangala',
      state: 'Karnataka',
      pinCode: '560095',
    },
  });

  const cinemaDelhi = await prisma.cinemaHall.create({
    data: {
      name: 'Cinepolis VIP DLF Avenue',
      city: 'Delhi',
      address: 'Press Enclave Road, Saket',
      state: 'Delhi',
      pinCode: '110017',
    },
  });

  console.log('🏛️ Cinema Halls seeded.');

  // 4. Create Screens and Physical Seats
  const screensData = [
    { cinema: cinemaMumbai, screenNumber: 'Screen 1 (Dolby Atmos)', sound: 'Dolby Atmos 7.1.4' },
    { cinema: cinemaMumbai, screenNumber: 'Screen 2 (IMAX Laser)', sound: 'IMAX 12-Channel Sound' },
    { cinema: cinemaBangalore, screenNumber: 'Audi 1 (4DX Experience)', sound: 'Dolby Atmos' },
    { cinema: cinemaDelhi, screenNumber: 'VIP Screen 1 (Luxe)', sound: 'Dolby 7.1' },
  ];

  const createdScreens = [];

  for (const s of screensData) {
    const screen = await prisma.screen.create({
      data: {
        cinemaHallId: s.cinema.id,
        screenNumber: s.screenNumber,
        totalCapacity: 64, // 8 rows x 8 seats
        soundSystem: s.sound,
      },
    });
    createdScreens.push(screen);

    // Generate physical seats for screen:
    // Rows A-B: RECLINER (top tiers)
    // Rows C-E: PREMIUM (middle tiers)
    // Rows F-H: REGULAR (front tiers)
    const rows = [
      { row: 'A', cat: 'RECLINER' },
      { row: 'B', cat: 'RECLINER' },
      { row: 'C', cat: 'PREMIUM' },
      { row: 'D', cat: 'PREMIUM' },
      { row: 'E', cat: 'PREMIUM' },
      { row: 'F', cat: 'REGULAR' },
      { row: 'G', cat: 'REGULAR' },
      { row: 'H', cat: 'REGULAR' },
    ];

    const seatBatch = [];
    for (const r of rows) {
      for (let num = 1; num <= 8; num++) {
        seatBatch.push({
          screenId: screen.id,
          rowIdentifier: r.row,
          seatNumber: num,
          category: r.cat,
        });
      }
    }
    await prisma.seat.createMany({ data: seatBatch });
  }

  console.log('💺 Screens and 256 physical seats seeded.');

  // 5. Create Movies with realistic posters and trailers
  const movies = await prisma.movie.createMany({
    data: [
      {
        title: 'Ramayana',
        description: 'When Rakshasa emperor Ravana, invincible to all but man, conquers the three worlds, Lord Vishnu descends as noble prince Rama. Bound by his father\'s vow, Rama enters perilous exile with virtuous Sita and devoted Lakshmana. When Ravana abducts Sita, God in human form rises to fight the greatest war ever. Accessibility through Audio Description (AD) & Closed Captions (CC) is available for this movie on the \'CineDubs\' app.',
        genre: 'Epic, Mythological',
        language: 'Hindi',
        durationMins: 165,
        releaseDate: new Date('2026-10-24'),
        director: 'Nitesh Tiwari',
        cast: 'Ranbir Kapoor, Sai Pallavi, Yash, Sunny Deol',
        rating: 9.6,
        posterUrl: '/ramayana-poster.jpg',
        backdropUrl: '/ramayana-backdrop.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
        certification: 'U',
        status: 'NOW_SHOWING',
        isFeatured: true,
      },
      {
        title: 'Spider-Man: Across the Multiverse',
        description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
        genre: 'Action / Sci-Fi / Adventure',
        language: 'English',
        durationMins: 140,
        releaseDate: new Date('2026-06-02'),
        director: 'Joaquim Dos Santos, Kemp Powers',
        cast: 'Shameik Moore, Hailee Steinfeld, Oscar Isaac',
        rating: 9.1,
        posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&auto=format&fit=crop&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1600&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
        certification: 'UA',
        status: 'NOW_SHOWING',
        isFeatured: true,
      },
      {
        title: 'Bullet Train: Neon Velocity',
        description: 'Five assassins aboard a swiftly-moving bullet train find out that their missions have something in common. A whirlwind thrill ride through modern Japan.',
        genre: 'Action / Thriller / Comedy',
        language: 'English',
        durationMins: 126,
        releaseDate: new Date('2026-08-05'),
        director: 'David Leitch',
        cast: 'Brad Pitt, Joey King, Aaron Taylor-Johnson',
        rating: 8.7,
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=0IOsk2Vlc4o',
        certification: 'A',
        status: 'NOW_SHOWING',
        isFeatured: true,
      },
      {
        title: 'Godzilla vs Kong: The New Empire',
        description: 'An all-new adventure that pits the almighty Kong and the fearsome Godzilla against a colossal undiscovered threat hidden within our world, challenging their very existence.',
        genre: 'Action / Sci-Fi / Adventure',
        language: 'English',
        durationMins: 115,
        releaseDate: new Date('2026-03-29'),
        director: 'Adam Wingard',
        cast: 'Rebecca Hall, Brian Tyree Henry, Dan Stevens',
        rating: 8.3,
        posterUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=qqrpMRDuPfc',
        certification: 'UA',
        status: 'NOW_SHOWING',
        isFeatured: true,
      },
      {
        title: 'Doctor Strange: Multiverse of Shadows',
        description: 'Doctor Strange teams up with a mysterious teenage girl from his dreams who can travel across multiverses, to battle multiple threats, including other-universe versions of himself.',
        genre: 'Action / Fantasy / Horror',
        language: 'English',
        durationMins: 126,
        releaseDate: new Date('2026-05-06'),
        director: 'Sam Raimi',
        cast: 'Benedict Cumberbatch, Elizabeth Olsen, Chiwetel Ejiofor',
        rating: 8.5,
        posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=aWzlQ2N6qqg',
        certification: 'UA',
        status: 'NOW_SHOWING',
        isFeatured: true,
      },
      {
        title: 'Wakanda Forever: Legacy of Bast',
        description: 'The people of Wakanda fight to protect their home from intervening world powers as they mourn the death of King T\'Challa and navigate an oceanic empire rising from the deep.',
        genre: 'Action / Drama / Sci-Fi',
        language: 'English',
        durationMins: 161,
        releaseDate: new Date('2026-11-11'),
        director: 'Ryan Coogler',
        cast: 'Letitia Wright, Lupita Nyong\'o, Angela Bassett',
        rating: 8.6,
        posterUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=_Z3QKfv1484',
        certification: 'UA',
        status: 'NOW_SHOWING',
        isFeatured: false,
      },
      {
        title: 'Luca: The Ocean Odyssey',
        description: 'On the Italian Riviera, an unlikely but strong friendship grows between a human being and a sea monster disguised as a human. A heartwarming adventure for the entire family.',
        genre: 'Animation / Family / Adventure',
        language: 'English',
        durationMins: 95,
        releaseDate: new Date('2026-06-18'),
        director: 'Enrico Casarosa',
        cast: 'Jacob Tremblay, Jack Dylan Grazer, Emma Berman',
        rating: 8.9,
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=mYfJxlgR2jw',
        certification: 'U',
        status: 'NOW_SHOWING',
        isFeatured: false,
      },
      {
        title: 'Prey: The Hunt Begins',
        description: 'In the Comanche Nation in 1719, a fierce and highly skilled warrior protects her tribe from a highly evolved alien predator that hunts humans for sport.',
        genre: 'Sci-Fi / Action / Horror',
        language: 'English',
        durationMins: 99,
        releaseDate: new Date('2026-08-05'),
        director: 'Dan Trachtenberg',
        cast: 'Amber Midthunder, Dakota Beavers, Dane DiLiegro',
        rating: 8.4,
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=wZ7LytagKlc',
        certification: 'A',
        status: 'NOW_SHOWING',
        isFeatured: false,
      },
      {
        title: 'Willow: The Ancient Sorcery',
        description: 'Decades after defeating Queen Bavmorda, the sorcerer Willow Ufgood leads a group of unlikely heroes on a dangerous rescue mission through a magical world.',
        genre: 'Fantasy / Adventure',
        language: 'English',
        durationMins: 110,
        releaseDate: new Date('2026-12-25'),
        director: 'Stephen Woolfenden',
        cast: 'Warwick Davis, Ellie Bamber, Ruby Cruz',
        rating: 8.1,
        posterUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=P_Vn-WkX1g8',
        certification: 'UA',
        status: 'COMING_SOON',
        isFeatured: false,
      },
    ],
  });

  console.log('🎥 Movies seeded.');

  const allMovies = await prisma.movie.findMany();
  const screen1 = createdScreens[0]; // Screen 1 at Mumbai
  const screen2 = createdScreens[1]; // Screen 2 at Mumbai
  const screen3 = createdScreens[2]; // Audi 1 at Bangalore

  // 6. Schedule Shows across Today and upcoming 5 days
  const now = new Date();
  const showTimesSlots = [
    { hour: 10, min: 0 },
    { hour: 13, min: 30 },
    { hour: 17, min: 0 },
    { hour: 20, min: 30 },
    { hour: 23, min: 0 },
  ];

  let scheduledShowsCount = 0;

  for (let dayOffset = 0; dayOffset <= 4; dayOffset++) {
    const showDate = new Date(now);
    showDate.setDate(now.getDate() + dayOffset);

    for (let i = 0; i < showTimesSlots.length; i++) {
      const slot = showTimesSlots[i];
      const startTime = new Date(showDate);
      startTime.setHours(slot.hour, slot.min, 0, 0);

      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 2, startTime.getMinutes() + 30);

      // Distribute movies across screens
      const movieForShow = allMovies[i % allMovies.length];
      const targetScreen = i % 2 === 0 ? screen1 : screen2;

      const show = await prisma.show.create({
        data: {
          movieId: movieForShow.id,
          screenId: targetScreen.id,
          startTime,
          endTime,
          basePrice: 280.0, // Base Regular price
          status: 'SCHEDULED',
        },
      });

      // Get all seats for targetScreen
      const seats = await prisma.seat.findMany({
        where: { screenId: targetScreen.id },
      });

      // Create ShowSeat records
      const showSeatBatch = seats.map((seat) => {
        let multiplier = 1.0;
        if (seat.category === 'PREMIUM') multiplier = 1.35;
        if (seat.category === 'RECLINER') multiplier = 1.8;

        return {
          showId: show.id,
          seatId: seat.id,
          status: 'AVAILABLE',
          finalPrice: Math.round(280 * multiplier),
        };
      });

      await prisma.showSeat.createMany({ data: showSeatBatch });
      scheduledShowsCount++;
    }
  }

  console.log(`📅 Scheduled ${scheduledShowsCount} shows across 5 dates with full ShowSeat maps.`);

  // 7. Seed Concession Snacks
  await prisma.snack.createMany({
    data: [
      {
        name: 'Cinema Caramel Popcorn (Tub)',
        category: 'FOOD',
        price: 260.0,
        imageUrl: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400&auto=format&fit=crop&q=80',
        description: 'Crunchy golden caramel-coated gourmet popcorn.',
      },
      {
        name: 'Salted Butter Popcorn (Regular)',
        category: 'FOOD',
        price: 190.0,
        imageUrl: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=400&auto=format&fit=crop&q=80',
        description: 'Warm freshly-popped corn with rich salted dairy butter.',
      },
      {
        name: 'Crispy Cheese Nachos with Salsa',
        category: 'FOOD',
        price: 220.0,
        imageUrl: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&auto=format&fit=crop&q=80',
        description: 'Warm tortilla chips served with melted cheddar and tangy jalapeño salsa.',
      },
      {
        name: 'Chilled Fountain Coca-Cola (Large 750ml)',
        category: 'BEVERAGE',
        price: 150.0,
        imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=80',
        description: 'Ice-cold carbonated beverage served in an insulated cup.',
      },
      {
        name: 'Movie Night Mega Combo',
        category: 'COMBO',
        price: 520.0,
        imageUrl: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=400&auto=format&fit=crop&q=80',
        description: '1 Jumbo Caramel Popcorn + 2 Large Fountain Drinks + Nachos.',
      },
    ],
  });

  console.log('🍿 Concession snacks seeded.');

  // 8. Create a sample completed Booking with Ticket & QR for demonstration
  const sampleShow = await prisma.show.findFirst({
    where: { screenId: screen1.id },
    include: { movie: true, screen: { include: { cinemaHall: true } } },
  });

  if (sampleShow) {
    const bookedSeats = await prisma.seat.findMany({
      where: {
        screenId: screen1.id,
        rowIdentifier: 'C',
        seatNumber: { in: [3, 4] },
      },
    });

    const booking = await prisma.booking.create({
      data: {
        bookingNumber: 'BKG-20261112-9841',
        userId: customer.id,
        showId: sampleShow.id,
        totalAmount: 780.0,
        convenienceFee: 30.0,
        taxAmount: 24.0,
        status: 'CONFIRMED',
        seats: {
          create: bookedSeats.map((s) => ({
            seatId: s.id,
            price: 378.0,
          })),
        },
        payment: {
          create: {
            razorpayOrderId: 'order_test_cinema_9841',
            razorpayPaymentId: 'pay_test_cinema_9841',
            razorpaySignature: 'mock_verified_signature_9841',
            amount: 780.0,
            currency: 'INR',
            status: 'SUCCESS',
            paymentMethod: 'UPI / Card',
          },
        },
        ticket: {
          create: {
            ticketCode: 'TCK-9841-B8X',
            qrPayload: JSON.stringify({
              bookingNumber: 'BKG-20261112-9841',
              ticketCode: 'TCK-9841-B8X',
              showId: sampleShow.id,
              movie: sampleShow.movie.title,
              seats: ['C3', 'C4'],
              token: 'hmac_signed_security_token_sample',
            }),
            isUsed: false,
          },
        },
      },
    });

    // Mark seats as BOOKED in ShowSeat
    await prisma.showSeat.updateMany({
      where: {
        showId: sampleShow.id,
        seatId: { in: bookedSeats.map((s) => s.id) },
      },
      data: {
        status: 'BOOKED',
      },
    });

    console.log(`🎟️ Sample Booking (${booking.bookingNumber}) & Ticket created for testing.`);
  }

  console.log('✅ All seed data inserted successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

