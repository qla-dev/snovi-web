export const API_BASE = 'https://snovi.qla.dev/api';
export const APP_STORE_URL = 'https://apps.apple.com/app/snovi-fm/id6758638251';
export const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=snovi.qla.dev';

export type MobilePlatform = 'ios' | 'android' | null;

export function detectMobilePlatform(): MobilePlatform {
  if (typeof navigator === 'undefined') {
    return null;
  }

  const userAgent = navigator.userAgent || '';
  if (/Android/i.test(userAgent)) {
    return 'android';
  }
  if (/iPhone|iPad|iPod/i.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    return 'ios';
  }

  return null;
}

/** https link: opens the app through universal/app links, otherwise the /promo-code page. */
export const promoCodeUrl = (code: string) => `https://snovi.fm/promo-code/${code}`;

/** Custom scheme, for opening the app from a page that is already on snovi.fm. */
export const promoCodeAppUrl = (code: string) => `snovi://promo-code/${code}`;

export const qrImageUrl = (data: string, size = 320) =>
  `https://api.qrserver.com/v1/create-qr-code/?format=png&size=${size}x${size}&margin=10&color=1e1b4b&data=${encodeURIComponent(data)}`;

/**
 * Tries to open the app with the code. A link to snovi.fm from a snovi.fm page stays in the browser
 * (iOS does not hand same-site links to the app), so the custom scheme is used; when the app is not
 * installed nothing happens and onMissing runs once the page is still visible.
 */
export function openAppWithCode(code: string, onMissing: () => void) {
  let left = false;
  const markLeft = () => {
    if (document.visibilityState === 'hidden') {
      left = true;
    }
  };

  document.addEventListener('visibilitychange', markLeft);
  window.location.href = promoCodeAppUrl(code);

  window.setTimeout(() => {
    document.removeEventListener('visibilitychange', markLeft);
    if (!left) {
      onMissing();
    }
  }, 1600);
}
