import {
  ErrorCode,
  PackageType,
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

export type SubscriptionPlanId = 'yearly' | 'monthly';

export type SubscriptionPlan = {
  id: SubscriptionPlanId;
  rcPackage: Package;
  title: string;
  formattedPrice: string;
  pricePerMonth: string | null;
  trialLabel: string | null;
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

function formatTrial(rcPackage: Package) {
  const duration = rcPackage.product.freeTrialPhase?.periodDuration;
  const match = duration?.match(/^P(\d+)([DWMY])$/);

  if (!match) {
    return null;
  }

  const count = Number(match[1]);
  const unit = match[2] as 'D' | 'W' | 'M' | 'Y';
  const label = {
    D: `${count} dana`,
    W: `${count * 7} dana`,
    M: count === 1 ? '1 mjesec' : `${count} mjeseca`,
    Y: count === 1 ? '1 godina' : `${count} godine`,
  }[unit];
  return `${label} besplatno`;
}

function toPlan(id: SubscriptionPlanId, rcPackage: Package): SubscriptionPlan {
  const product = rcPackage.product;
  const basePhase = product.defaultSubscriptionOption?.base;

  return {
    id,
    rcPackage,
    title: id === 'yearly' ? 'Godišnja pretplata' : 'Mjesečna pretplata',
    formattedPrice: product.currentPrice.formattedPrice,
    pricePerMonth: id === 'yearly' ? basePhase?.pricePerMonth?.formattedPrice ?? null : null,
    trialLabel: formatTrial(rcPackage),
  };
}

export async function loadSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const offerings = await getPurchases().getOfferings();
  const packages = offerings.current?.availablePackages ?? [];
  const yearly = packages.find((item) => item.packageType === PackageType.Annual)
    ?? packages.find((item) => /(annual|year|yearly|12m)/i.test(item.product.identifier));
  const monthly = packages.find((item) => item.packageType === PackageType.Monthly)
    ?? packages.find((item) => /(month|monthly|1m)/i.test(item.product.identifier));

  return [
    yearly ? toPlan('yearly', yearly) : null,
    monthly ? toPlan('monthly', monthly) : null,
  ].filter((plan): plan is SubscriptionPlan => Boolean(plan));
}

export type PurchaseOutcome =
  | { status: 'success'; result: PurchaseResult }
  | { status: 'cancelled' };

export async function purchaseSubscriptionPlan(plan: SubscriptionPlan, email: string, termsUrl: string): Promise<PurchaseOutcome> {
  try {
    const result = await getPurchases().purchase({
      rcPackage: plan.rcPackage,
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
