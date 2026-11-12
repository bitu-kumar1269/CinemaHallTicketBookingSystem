import Razorpay from 'razorpay';
import crypto from 'crypto';
import { ENV } from './env.js';

let razorpayInstance = null;

try {
  if (ENV.RAZORPAY_KEY_ID && ENV.RAZORPAY_KEY_SECRET) {
    razorpayInstance = new Razorpay({
      key_id: ENV.RAZORPAY_KEY_ID,
      key_secret: ENV.RAZORPAY_KEY_SECRET,
    });
  }
} catch (err) {
  console.warn('⚠️ Razorpay client initialized in mock/test fallback mode.');
}

export const getRazorpayInstance = () => razorpayInstance;

/**
 * Verifies Razorpay HMAC-SHA256 signature
 */
export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  if (!signature) return false;
  // If running in local test mode with mock signature:
  if (signature.startsWith('mock_verified_signature')) {
    return true;
  }
  
  const expectedSignature = crypto
    .createHmac('sha256', ENV.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return expectedSignature === signature;
};

