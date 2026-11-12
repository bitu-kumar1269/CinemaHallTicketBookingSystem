# 🎬 CineWave | Modern Cinema Hall Ticket Booking System

A production-ready, full-stack cinema ticketing platform featuring real-time concurrency-safe seat locking, Razorpay payment processing, cryptographically signed QR tickets, live theatre hall visualizers, and a comprehensive administrative management dashboard.

![CineWave Cinema Architecture](https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=80)

---

## 🌟 Key Features

### 👤 Customer Experience
- **Cinematic Discovery**: High-impact hero carousel with trailer popups, 7-day showtime pill filter, Now Showing, Coming Soon, and curated collections (Action, Sci-Fi, For Kids & Families).
- **Real-Time Interactive Seat Selection**: 3D curved glowing theatre screen graphic with color-coded seat tiers (**Recliner**, **Premium**, **Regular**).
- **Concurrency-Safe Seat Locking**: Temporary 8-minute optimistic locks via WebSocket synchronization and PostgreSQL ACID row-locking (`SELECT ... FOR UPDATE`), preventing double bookings under high traffic.
- **Concessions & Snacks Add-on**: Pre-order movie snacks (Caramel Popcorn, Nachos, Fountain Coca-Cola, Combos) with live subtotal calculation.
- **Payment Gateway Integration**: Razorpay test mode checkout supporting Cards, UPI (GPay/PhonePe), and Net Banking.
- **Digital Golden Ticket & PDF**: Instant delivery of a golden ticket pass with embedded QR code and one-click PDF download for offline entry.
- **Customer Self-Service**: Booking history, ticket access, and flexible cancellation with automated seat release and refund initiation.

### 🛡️ Administrative Console
- **Business Analytics**: Real-time KPI dashboard tracking viewers today, gross revenue, occupancy rate %, and weekly revenue trajectory charts.
- **Screen Occupancy Visualizer**: Live interactive miniature dot-matrix heatmap of every scheduled showtime (Available, Pending, Booked seats).
- **Movie Catalog Manager**: Add, edit, or deactivate movies with poster previews, duration, certificate, and trailer links.
- **Multiplex & Screen Architect**: Configure cinema locations, screen sound systems (Dolby Atmos 7.1.4, IMAX Laser), and auto-generate seat layouts.
- **Show Scheduler**: Schedule shows with time slot pickers and automated pricing multipliers.
- **QR Gate Check-in Scanner**: Dedicated gatekeeper station validating cryptographic HMAC-SHA256 signatures on tickets to prevent counterfeit entries and block double admissions.

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v7, Axios, Lucide Icons, Socket.IO Client, Canvas Confetti |
| **Backend** | Node.js, Express.js, Socket.IO, Prisma ORM, JWT, bcryptjs, Zod, Helmet, Express Rate Limit |
| **Database** | PostgreSQL 16 (Relational, Foreign Keys, Unique Composite Constraints, Indexed Queries) |
| **Integrations** | Razorpay SDK (Test Mode), PDFKit (PDF Tickets), QRCode (Base64 + Vector), HMAC-SHA256 |
| **DevOps & CI/CD**| Docker, Docker Compose, GitHub Actions, Nginx Reverse Proxy |

---

## 📁 Clean Monorepo Architecture

```
CinemaHallTicketBookingSystem/
├── .github/
│   └── workflows/
│       └── ci-cd.yml                # Automated CI pipeline (DB, Tests, Build)
├── docker-compose.yml               # Multi-container orchestration (DB, API, Web)
├── .env.example                     # Environment template
├── client/                          # React + Tailwind Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/              # Navbar, Footer, ProtectedRoute, Modal
│   │   │   ├── customer/            # HeroBanner, MovieCard, SeatGrid, SnackSelector, TicketCard
│   │   │   └── admin/               # AdminSidebar, ScreenOccupancyMini
│   │   ├── context/                 # AuthContext, SocketContext
│   │   ├── pages/
│   │   │   ├── customer/            # HomePage, MoviesPage, MovieDetailPage, SeatBookingPage, CheckoutPage, MyBookingsPage
│   │   │   └── admin/               # DashboardOverview, ManageMovies, ManageCinemas, ManageShows, ManageBookings, VerifyTicket
│   │   └── services/api.js          # Centralized Axios client
│   ├── Dockerfile
│   └── vite.config.js
└── server/                          # Express + Prisma Backend
    ├── prisma/
    │   ├── schema.prisma            # 13 normalized tables & enums
    │   └── seed.js                  # Comprehensive demo seed script
    ├── src/
    │   ├── config/                  # Prisma client, Razorpay, Environment
    │   ├── controllers/             # Auth, Movies, Cinemas, Shows, Bookings, Payments, Tickets, Admin
    │   ├── middleware/              # Auth, RBAC, Zod validate, Rate limiter, Error handler
    │   ├── routes/                  # Express API routers
    │   └── services/                # Concurrency SeatLock manager, Socket.IO, PDFKit, QR signer
    ├── tests/
    │   └── api.test.js              # Integration test suite (9 test suites)
    ├── Dockerfile
    └── server.js                    # Server entry & Socket.IO server
```

---

## 🔑 Pre-Seeded Demo Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin@cinema.com` | `Admin@12345` | Full Admin Console, Analytics, QR Gate Scanner |
| **Demo Customer** | `customer@cinema.com` | `Customer@12345` | Booking, Tickets, Concessions, Cancellation |

*(Quick-fill demo buttons are provided on the Sign-In page for instant testing)*

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js `v20+` & npm `10+`
- PostgreSQL `16+`

### 1. Database Setup
```bash
# Create database in PostgreSQL
createdb cinema_booking_db
```

### 2. Backend Setup
```bash
cd server

# Install dependencies
npm install

# Configure environment (.env is pre-configured for local dev)
# DATABASE_URL="postgresql://username@localhost:5432/cinema_booking_db?schema=public"

# Sync Prisma Schema & Generate Client
npx prisma db push

# Seed realistic cinema halls, screens, movies, shows, and snacks
node prisma/seed.js

# Start backend development server (runs on port 5005)
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client

# Install dependencies
npm install

# Start Vite React server (runs on port 5173 with auto-proxy to 5005)
npm run dev
```

Open `http://localhost:5173` in your browser!

---

## 🐳 Docker Compose (Single-Command Run)

Run the entire full-stack platform including PostgreSQL, Backend API, and Nginx Client with Docker:

```bash
docker-compose up --build
```
- Frontend: `http://localhost`
- Backend API: `http://localhost:5005/api`

---

## 🧪 Running Automated Tests

A comprehensive integration test suite verifies:
- Health check
- User registration and login
- Invalid credentials rejection
- Session authentication (`/api/auth/me`)
- Movies catalog and hero sections
- Show seating map generation
- Concurrency-safe seat locking (`POST /api/bookings/lock-seats`)
- Admin authorization gates (HTTP `403` vs `200`)

```bash
cd server
npm test
```

---

## 🔒 Concurrency & Anti-Double-Booking Architecture

1. **Optimistic Locking with 8-Minute TTL**: When a user selects a seat, the backend records `status = 'LOCKED'` with `expires_at = NOW() + 8 min` and emits a `seat_locked` event via Socket.IO to everyone in that show room.
2. **Pessimistic DB Transactions**: Checkout validation locks the row with `SELECT ... FOR UPDATE` inside an ACID PostgreSQL transaction. Conflicting seat attempts are rejected with `409 Conflict`.
3. **Automated Background Reaper**: A recurring background process cleans up abandoned locks every 15 seconds and broadcasts `seat_released` to active clients.
4. **Cryptographic QR Validation**: Digital passes are signed with HMAC-SHA256. Scanning a ticket at `/admin/verify-qr` verifies the signature and marks `isUsed = true` to prevent duplicate entry attempts.

