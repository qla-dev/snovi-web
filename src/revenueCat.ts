import {
  ErrorCode,
  Purchases,
  PurchasesError,
  type Package,
  type PurchaseResult,
} from '@revenuecat/purchases-js';
import { API_BASE } from './appLinks';

// Public RevenueCat Web Billing key (starts with "rcb_"). Safe to ship to the browser.
// Set VITE_REVENUECAT_WEB_API_KEY in .env before running `npm run build`.
const REVENUECAT_WEB_API_KEY = (import.meta.env.VITE_REVENUECAT_WEB_API_KEY as string | undefined)?.trim() || '';
const APP_USER_ID_STORAGE_KEY = 'snovi.rc.appUserId';

// The only thing sold on the web: a one-time voucher for one year of snovi.fm (RevenueCat product "snovi_vaucer").
const VOUCHER_PRODUCT_ID = 'snovi_vaucer';

export type VoucherProduct = {
  rcPackage: Package;
  formattedPrice: string;
  // The same price in the other local currency (KM for a EUR price, EUR for a KM price), or null.
  altPrice: string | null;
};

let purchasesInstance: Purchases | null = null;

export const hasRevenueCatWebConfig = () => Boolean(REVENUECAT_WEB_API_KEY);

function readStoredAppUserId() {
  try {
    return window.localStorage.getItem(APP_USER_ID_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeAppUserId(appUserId: string) {
  try {
    window.localStorage.setItem(APP_USER_ID_STORAGE_KEY, appUserId);
  } catch {
    // Private mode: the purchase still works, the anonymous id just isn't reused next visit.
  }
}

function getPurchases() {
  if (!REVENUECAT_WEB_API_KEY) {
    throw new Error('RevenueCat Web Billing nije konfigurisan (VITE_REVENUECAT_WEB_API_KEY).');
  }

  if (!purchasesInstance) {
    // The mobile app uses anonymous RevenueCat users, so the web buyer is anonymous too.
    // The purchase is moved to the app user through the redemption link RevenueCat returns.
    const appUserId = readStoredAppUserId() || Purchases.generateRevenueCatAnonymousAppUserId();
    storeAppUserId(appUserId);
    purchasesInstance = Purchases.configure({ apiKey: REVENUECAT_WEB_API_KEY, appUserId });
  }

  return purchasesInstance;
}

// 1 EUR = 1.95583 KM (fixed rate), shown rounded: 25 EUR is about 50 KM.
function toAltPrice(amountMicros: number, currency: string) {
  const amount = amountMicros / 1_000_000;

  if (currency === 'EUR') {
    return `${Math.round(amount * 2)} KM`;
  }
  if (currency === 'BAM') {
    return `€${Math.round(amount / 2)}`;
  }
  return null;
}

export async function loadVoucherProduct(): Promise<VoucherProduct | null> {
  const offerings = await getPurchases().getOfferings();
  const packages = [
    ...(offerings.current?.availablePackages ?? []),
    ...Object.values(offerings.all).flatMap((offering) => offering.availablePackages),
  ];
  const rcPackage = packages.find((item) => item.product.identifier === VOUCHER_PRODUCT_ID);

  if (!rcPackage) {
    return null;
  }

  const price = rcPackage.product.currentPrice;
  return {
    rcPackage,
    formattedPrice: price.formattedPrice,
    altPrice: toAltPrice(price.amountMicros, price.currency),
  };
}

export type PurchaseOutcome =
  | { status: 'success'; result: PurchaseResult }
  | { status: 'cancelled' };

export async function purchaseVoucher(product: VoucherProduct, email: string, termsUrl: string): Promise<PurchaseOutcome> {
  try {
    const result = await getPurchases().purchase({
      rcPackage: product.rcPackage,
      customerEmail: email,
      selectedLocale: 'bs',
      defaultLocale: 'hr',
      termsAndConditionsUrl: termsUrl,
      skipSuccessPage: true,
    });

    return { status: 'success', result };
  } catch (error) {
    if (error instanceof PurchasesError && error.errorCode === ErrorCode.UserCancelledError) {
      return { status: 'cancelled' };
    }

    throw error;
  }
}

export type Voucher = {
  code: string;
  link: string;
  planLabel: string;
  email: string;
  emailSent: boolean;
  expiresAt: string | null;
};

/**
 * Asks the backend for the voucher code of the purchase that was just made. The backend checks the
 * purchase with RevenueCat itself, issues the code and emails it. Retried a few times, because
 * RevenueCat can take a moment to report a fresh purchase.
 */
export async function claimVoucher(email: string): Promise<Voucher> {
  const appUserId = getPurchases().getAppUserId();
  let lastError: unknown = null;

  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => window.setTimeout(resolve, attempt * 2000));
    }

    try {
      const response = await fetch(`${API_BASE}/web-purchases/claim`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ appUserId, email }),
      });
      const body = await response.json().catch(() => ({}));

      if (response.ok && body?.data?.code) {
        return body.data as Voucher;
      }

      lastError = new Error(body?.message || `HTTP ${response.status}`);
      if (response.status === 422) {
        break;
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error('Voucher nije izdat.');
}
