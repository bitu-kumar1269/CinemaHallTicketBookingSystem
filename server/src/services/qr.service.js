import crypto from 'crypto';
import QRCode from 'qrcode';
import { ENV } from '../config/env.js';

/**
 * Generate HMAC signature for ticket data
 */
export const signTicketPayload = (data) => {
  const serialized = JSON.stringify(data);
  const signature = crypto
    .createHmac('sha256', ENV.QR_SIGNING_SECRET)
    .update(serialized)
    .digest('hex');

  return {
    data,
    signature,
  };
};

/**
 * Verify signed ticket payload
 */
export const verifyTicketPayload = (signedObject) => {
  try {
    if (!signedObject || !signedObject.data || !signedObject.signature) {
      return { valid: false, reason: 'Malformed payload structure.' };
    }

    const { data, signature } = signedObject;
    const expectedSignature = crypto
      .createHmac('sha256', ENV.QR_SIGNING_SECRET)
      .update(JSON.stringify(data))
      .digest('hex');

    if (expectedSignature !== signature) {
      return { valid: false, reason: 'Digital signature mismatch. Possible ticket forgery.' };
    }

    return { valid: true, data };
  } catch (err) {
    return { valid: false, reason: err.message };
  }
};

/**
 * Generate QR code data URL (Base64 PNG) for the ticket
 */
export const generateQRCodeDataURL = async (signedPayload) => {
  const qrString = typeof signedPayload === 'string' ? signedPayload : JSON.stringify(signedPayload);
  return await QRCode.toDataURL(qrString, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 256,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
};

