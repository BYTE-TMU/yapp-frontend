// Oct 1, 2026 is during Eastern Daylight Time (EDT, UTC-4) — DST ends Nov 1, 2026,
// so the -04:00 offset (not -05:00/EST) is correct for this date.
export const CYBER_SUMMIT_CUTOFF = new Date('2026-10-01T23:59:00-04:00');

// TODO: replace with the finalized TMU Science Society registration link
export const REGISTRATION_URL = 'https://forms.gle/VCirVx5xFjNJKYtu6?utm_source=luma';

export const ORIGINAL_PRICE = 60;
export const DISCOUNT_PERCENT = 50;
export const DISCOUNTED_PRICE = Math.round(
  ORIGINAL_PRICE * (1 - DISCOUNT_PERCENT / 100),
);

export const isCyberSummitWindowOpen = () => new Date() < CYBER_SUMMIT_CUTOFF;
