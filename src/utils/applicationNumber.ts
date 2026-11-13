import { schoolConfig } from '../config/schoolConfig';

/**
 * Generates an official application tracking number using cryptographically secure values.
 * Format: {PREFIX}-{YYYY}-{XXXXXX}
 * Alphabet: ABCDEFGHJKLMNPQRSTUVWXYZ23456789 (excludes easily confused 0/O, 1/I).
 */
export function generateApplicationNumber(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const prefix = schoolConfig.applicationPrefix;
  const now = new Date();
  const yyyy = now.getFullYear();

  const bytes = new Uint8Array(6);
  const cryptoObj = typeof globalThis !== 'undefined' ? globalThis.crypto : (typeof window !== 'undefined' ? window.crypto : null);

  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    cryptoObj.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 6; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  let token = '';
  for (let i = 0; i < 6; i++) {
    token += alphabet[bytes[i] % alphabet.length];
  }

  return `${prefix}-${yyyy}-${token}`;
}

/**
 * Computes SHA-256 hash of "NUMBER:PHONE" (phone digits only)
 * for secure public status verification without leaking private data.
 */
export async function computeStatusVerifyHash(appNumber: string, phone: string): Promise<string> {
  const cleanPhone = phone.replace(/\D/g, '');
  const cleanAppNo = appNumber.trim().toUpperCase();
  const raw = `${cleanAppNo}:${cleanPhone}`;

  const subtleCrypto =
    typeof globalThis !== 'undefined' && globalThis.crypto?.subtle
      ? globalThis.crypto.subtle
      : typeof window !== 'undefined' && window.crypto?.subtle
      ? window.crypto.subtle
      : null;

  if (subtleCrypto) {
    const encoder = new TextEncoder();
    const data = encoder.encode(raw);
    const hashBuffer = await subtleCrypto.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback hash implementation if SubtleCrypto is unavailable
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}
