import {
  createHmac,
  randomInt,
  timingSafeEqual,
} from 'node:crypto';

export function generateOtp(): string {
  return randomInt(0, 1_000_000)
    .toString()
    .padStart(6, '0');
}

export function hashOtp(
  otp: string,
  secret: string,
): string {
  return createHmac('sha256', secret)
    .update(otp)
    .digest('hex');
}

export function compareOtp(
  otp: string,
  storedHash: string,
  secret: string,
): boolean {
  const actual = Buffer.from(
    hashOtp(otp, secret),
    'hex',
  );

  const expected = Buffer.from(storedHash, 'hex');

  return (
    actual.length === expected.length &&
    timingSafeEqual(actual, expected)
  );
}