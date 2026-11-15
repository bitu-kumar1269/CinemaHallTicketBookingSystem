import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { ENV } from './config/env.js';

const app = express();

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// Configured CORS Origins
const configuredOrigins = (ENV.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);

const defaultOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5005',
  'http://localhost',
];

const allowedOrigins = [...new Set([...configuredOrigins, ...defaultOrigins])];

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(new Error(`CORS origin not allowed: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root & Health check routes for Cloud Load Balancers (AWS ALB, GCP, Render, Railway, K8s)
app.get(['/', '/health', '/api/health'], (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'CineWave Cinema API',
  });
});

// Global Rate Limiting
app.use('/api', apiRateLimiter);

// API Routes
app.use('/api', routes);

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handling
app.use(errorHandler);

export default app;

