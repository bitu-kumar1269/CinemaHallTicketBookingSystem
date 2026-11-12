import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const extraMovies = [
    {
      title: 'Pyre',
      description: 'In an isolated Himalayan village, an aging couple battles memory and isolation. An emotional cinematic journey of love, endurance, and closure.',
      genre: 'Drama / Indie',
      language: 'Hindi',
      durationMins: 112,
      releaseDate: new Date('2026-10-15'),
      director: 'Vinod Kapri',
      cast: 'Padam Singh, Hira Devi',
      rating: 8.8,
      posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
      certification: 'U',
      status: 'NOW_SHOWING',
      isFeatured: false,
    },
    {
      title: 'Udta Teer',
      description: 'A satirical comedy set across Punjab where two runaway brothers find themselves accidentally caught in an international covert misadventure.',
      genre: 'Comedy / Satire',
      language: 'Hindi',
      durationMins: 130,
      releaseDate: new Date('2026-09-20'),
      director: 'Abhishek Chaubey',
      cast: 'Diljit Dosanjh, Rajkummar Rao',
      rating: 8.4,
      posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=0IOsk2Vlc4o',
      certification: 'UA',
      status: 'NOW_SHOWING',
      isFeatured: false,
    },
    {
      title: 'Scene',
      description: 'An edge-of-the-seat Tamil investigative thriller about a forensic audio specialist uncovering a secret syndicate through sonic signatures.',
      genre: 'Crime / Mystery / Thriller',
      language: 'Tamil',
      durationMins: 145,
      releaseDate: new Date('2026-10-02'),
      director: 'Lokesh Kanagaraj',
      cast: 'Karthi, Fahadh Faasil',
      rating: 8.9,
      posterUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=aWzlQ2N6qqg',
      certification: 'A',
      status: 'NOW_SHOWING',
      isFeatured: false,
    },
    {
      title: 'Wildwood',
      description: 'Beyond Portland city limits lies the Impassable Wilderness. When her baby brother is abducted, Prue McKeel enters a mysterious woodland world.',
      genre: 'Animation / Fantasy / Adventure',
      language: 'English',
      durationMins: 108,
      releaseDate: new Date('2026-10-18'),
      director: 'Travis Knight',
      cast: 'Carey Mulligan, Mahershala Ali, Awkwafina',
      rating: 8.7,
      posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=mYfJxlgR2jw',
      certification: 'UA',
      status: 'NOW_SHOWING',
      isFeatured: false,
    },
    {
      title: 'Doraemon the Movie: New Nobita and the Undersea Devil',
      description: 'Nobita and his friends embark on an underwater camping trip in the Bermuda Triangle, stumbling upon an ancient sunken civilization.',
      genre: 'Animation / Kids / Family',
      language: 'Hindi',
      durationMins: 104,
      releaseDate: new Date('2026-08-12'),
      director: 'Tsutomu Shibayama',
      cast: 'Wasabi Mizuta, Megumi Ohara',
      rating: 8.5,
      posterUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=mYfJxlgR2jw',
      certification: 'U',
      status: 'NOW_SHOWING',
      isFeatured: false,
    },
    {
      title: 'Clayface',
      description: 'A disfigured former actor transforms into a shape-shifting entity in Gotham City, seeking vengeance against those who destroyed his career.',
      genre: 'Dark Fantasy / Horror / Action',
      language: 'English',
      durationMins: 128,
      releaseDate: new Date('2026-11-05'),
      director: 'Mike Flanagan',
      cast: 'Bill Skarsgard, Mia Goth',
      rating: 8.6,
      posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&auto=format&fit=crop&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1600&auto=format&fit=crop&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=_Z3QKfv1484',
      certification: 'A',
      status: 'NOW_SHOWING',
      isFeatured: false,
    },
  ];

  // Check if they exist, else create
  const screens = await prisma.screen.findMany();
  const screen1 = screens[0];
  const screen2 = screens[1] || screens[0];

  for (const mData of extraMovies) {
    const existing = await prisma.movie.findFirst({ where: { title: mData.title } });
    if (!existing) {
      const createdMovie = await prisma.movie.create({ data: mData });
      console.log('Added movie:', createdMovie.title);

      // Add a couple of showtimes for today and tomorrow
      const now = new Date();
      for (let dayOffset = 0; dayOffset <= 3; dayOffset++) {
        const d = new Date(now);
        d.setDate(now.getDate() + dayOffset);
        d.setHours(14, 0, 0, 0);
        const endD = new Date(d);
        endD.setHours(16, 30, 0, 0);

        const targetScreen = dayOffset % 2 === 0 ? screen1 : screen2;
        if (targetScreen) {
          const show = await prisma.show.create({
            data: {
              movieId: createdMovie.id,
              screenId: targetScreen.id,
              startTime: d,
              endTime: endD,
              basePrice: 280.0,
              status: 'SCHEDULED',
            },
          });

          // Create show seats
          const physicalSeats = await prisma.seat.findMany({ where: { screenId: targetScreen.id } });
          const showSeats = physicalSeats.map((ps) => {
            let mult = 1.0;
            if (ps.category === 'PREMIUM') mult = 1.35;
            if (ps.category === 'RECLINER') mult = 1.8;
            return {
              showId: show.id,
              seatId: ps.id,
              finalPrice: Math.round(280.0 * mult * 100) / 100,
              status: 'AVAILABLE',
            };
          });
          await prisma.showSeat.createMany({ data: showSeats });
        }
      }
    }
  }

  console.log('Done adding extra movies!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
