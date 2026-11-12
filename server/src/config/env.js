import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5005,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'super_cinema_secret_jwt_key_2026_dev_production_grade_token',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  SEAT_LOCK_MINUTES: parseInt(process.env.SEAT_LOCK_MINUTES || '8', 10),
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_cinema123456',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'secret_cinema_razorpay_mock_key',
  QR_SIGNING_SECRET: process.env.QR_SIGNING_SECRET || 'qr_cinema_security_hmac_secret_2026',
};
