/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, MotionConfig } from 'motion/react';
import { 
  Play, 
  Pause, 
  LoaderCircle,
  CloudRain, 
  Trees, 
  Waves, 
  Flame, 
  Download, 
  Globe, 
  ChevronRight, 
  Heart, 
  Brain, 
  Sparkles,
  Volume2,
  Smartphone,
  Apple,
  PlayCircle,
  Star,
  CheckCircle2,
  ArrowRight,
  Mail,
  Users,
  Shield,
  X,
  CreditCard,
  Plus,
} from 'lucide-react';
import { translations, Language } from './translations';
import {
  type AmbientEffectId,
  FixedMiniPlayerBar,
  HeroDeviceShowcase,
  LandingLibrarySection,
  useLandingExperience,
} from './components/LandingExperience';
import { HeroLottieBackground } from './components/HeroLottieBackground';

const effects = [
  { id: 'rain' as AmbientEffectId, icon: CloudRain, label: { bs: 'Ljetna kiša', en: 'Summer Rain' }, color: 'text-blue-400' },
  { id: 'leaves' as AmbientEffectId, icon: Trees, label: { bs: 'Noćna šuma', en: 'Night Forest' }, color: 'text-emerald-400' },
  { id: 'ocean' as AmbientEffectId, icon: Waves, label: { bs: 'Valovi', en: 'Waves' }, color: 'text-cyan-400' },
  { id: 'fire' as AmbientEffectId, icon: Flame, label: { bs: 'Vatra', en: 'Fire' }, color: 'text-orange-400' },
];

function mixerLevelToPercent(level: number) {
  return Math.round((Math.max(0, Math.min(10, level)) / 10) * 100);
}

function mixerPercentToLevel(percent: number) {
  return Math.max(0, Math.min(10, percent / 10));
}

type AnimatedWidgetShellProps = {
  children: React.ReactNode;
  className?: string;
  strength?: number;
};

function AnimatedWidgetShell({ children, className = '', strength = 1 }: AnimatedWidgetShellProps) {
  return (
    <div className={className}>
      <div className="animated-widget" data-widget-strength={strength}>
        {children}
      </div>
    </div>
  );
}

const brandLogoSrc = `${import.meta.env.BASE_URL}logo.png`;
const qlaLogoSrc = 'https://deklarant.ai/build/images/logo-qla-dark.png';
const dedicationImageSrc = `${import.meta.env.BASE_URL}img/snovi1.jpg`;
const sosBackgroundSrc = `${import.meta.env.BASE_URL}img/sos-children-bg.jpg`;
const sosFamilyBackgroundSrc = `${import.meta.env.BASE_URL}img/sos-family-bg.jpg`;
const sosLogoSrc = `${import.meta.env.BASE_URL}img/sos-childrens-villages-logo.png`;
const sosFullLogoSrc = `${import.meta.env.BASE_URL}img/sos-djecija-sela-bih.png`;
const SITE_ORIGIN = 'https://snovi.fm';
const OG_IMAGE_PATH = '/img/snovi34.jpg';
const SOS_PAGE_PATH = '/sos-djecije-selo';
const LEGACY_SOS_PAGE_PATH = '/donacija-za-sos-djecije-selo';
const APP_STORE_URL = 'https://apps.apple.com/us/app/snovi-fm/id6758638251';
type StorePlatform = 'ios' | 'android';

type Page = 'app' | 'methodology' | 'ambients' | 'library' | 'privacy' | 'terms' | 'cookies' | 'sosDonation';
type LegalPageId = 'privacy' | 'terms' | 'cookies';

type PageMeta = {
  title: string;
  description: string;
  keywords: string;
  path: string;
  imagePath?: string;
  imageAlt?: string;
};

const PAGE_META: Record<Page, PageMeta> = {
  app: {
    title: 'snovi.fm - Priprema. Pozor. San.',
    description: 'Uspavajte maštu. Probudite mir.',
    keywords: 'snovi.fm, snovi, priče za djecu, uspavljivanje, ambijenti, zvučni pejzaži',
    path: '/',
  },
  methodology: {
    title: 'snovi.fm - Metodologija',
    description: 'Saznajte kako snovi.fm koristi priče, neuroakustiku i večernje rituale za mirniji odlazak djece na spavanje.',
    keywords: 'snovi.fm metodologija, neuroakustika, spavanje djece, priče za laku noć',
    path: '/metodologija',
  },
  ambients: {
    title: 'snovi.fm - Ambijenti',
    description: 'Istražite snovi.fm ambijente i zvučne pejzaže: kiša, šuma, valovi, vatra i drugi zvukovi za mirnije večeri.',
    keywords: 'snovi.fm ambijenti, zvučni pejzaži, bijeli šum, zvukovi za spavanje',
    path: '/ambijenti',
  },
  library: {
    title: 'snovi.fm - Biblioteka snova',
    description: 'Pregledajte biblioteku snovi.fm priča, naratora i audio sadržaja za djecu i porodične večernje rituale.',
    keywords: 'snovi.fm biblioteka, priče za djecu, audio priče, bajke za laku noć',
    path: '/biblioteka',
  },
  privacy: {
    title: 'snovi.fm - Politika privatnosti',
    description: 'Pročitajte kako snovi.fm pristupa privatnosti, audio sadržaju, email listi čekanja i povezanim servisima.',
    keywords: 'snovi.fm privatnost, politika privatnosti, podaci, aplikacija, waitlist',
    path: '/privacy',
  },
  terms: {
    title: 'snovi.fm - Uslovi korištenja',
    description: 'Uslovi korištenja za snovi.fm web, priče, ambijente, biblioteku i aplikaciju.',
    keywords: 'snovi.fm uslovi, terms, pravila, aplikacija, biblioteka',
    path: '/terms',
  },
  cookies: {
    title: 'snovi.fm - Politika kolačića',
    description: 'Informacije o kolačićima i sličnim tehnologijama koje snovi.fm web koristi za stabilnost i osnovne postavke.',
    keywords: 'snovi.fm kolačići, cookies, web tehnologije, privatnost',
    path: '/cookies',
  },
  sosDonation: {
    title: 'snovi.fm x SOS Dječije selo',
    description: 'Kupi godišnju pretplatu za snovi.fm aplikaciju i podrži SOS Dječija sela. snovi.fm donira 20% od svake godišnje pretplate.',
    keywords: 'snovi.fm, SOS Dječije selo, SOS Dječija sela, godišnja pretplata, donacija, priče za djecu',
    path: SOS_PAGE_PATH,
    imagePath: '/img/sos-family-bg.jpg',
    imageAlt: 'Porodica zajedno čita kao podrška snovi.fm i SOS Dječijim selima',
  },
};

const SECTION_PAGE_IDS: Partial<Record<Page, string>> = {
  methodology: 'psychology',
  ambients: 'effects',
  library: 'stories',
};

const LEGAL_PAGES = new Set<Page>(['privacy', 'terms', 'cookies']);

function normalizePath(pathname: string) {
  const normalized = pathname.replace(/\/+$/, '');
  return normalized || '/';
}

function getPageFromPath(pathname = window.location.pathname): Page {
  const path = normalizePath(pathname);

  if (path === '/privacy') {
    return 'privacy';
  }

  if (path === '/terms') {
    return 'terms';
  }

  if (path === '/cookies') {
    return 'cookies';
  }

  if (path === '/metodologija') {
    return 'methodology';
  }

  if (path === '/ambijenti') {
    return 'ambients';
  }

  if (path === '/biblioteka') {
    return 'library';
  }

  if (path === SOS_PAGE_PATH || path === LEGACY_SOS_PAGE_PATH) {
    return 'sosDonation';
  }

  return 'app';
}

function getPathForPage(page: Page) {
  if (page === 'app') {
    return '/';
  }

  if (page === 'sosDonation') {
    return SOS_PAGE_PATH;
  }

  if (page === 'methodology' || page === 'ambients' || page === 'library') {
    return PAGE_META[page].path;
  }

  return `/${page}`;
}

function detectHeaderStorePlatform(): StorePlatform | null {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') {
    return null;
  }

  const userAgent = navigator.userAgent || '';
  const platform = navigator.platform || '';
  const userAgentDataMobile = Boolean((navigator as Navigator & { userAgentData?: { mobile?: boolean } }).userAgentData?.mobile);
  const hasTouch = navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;
  const isIpadOS = platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  const isSafari = /^((?!chrome|android|crios|fxios|edg).)*safari/i.test(userAgent);

  if (/Android/i.test(userAgent)) {
    return 'android';
  }

  if (isSafari) {
    return 'ios';
  }

  if (!hasTouch && !userAgentDataMobile) {
    return null;
  }

  if (/iPhone|iPad|iPod/i.test(userAgent) || isIpadOS) {
    return 'ios';
  }

  return null;
}

function showAndroidComingSoon() {
  window.alert('Uskoro');
}

function openAppStore() {
  const openedWindow = window.open(APP_STORE_URL, '_blank', 'noopener,noreferrer');

  if (!openedWindow) {
    window.location.href = APP_STORE_URL;
  }
}

function openStoreForPlatform(platform: StorePlatform) {
  if (platform === 'ios') {
    openAppStore();
    return;
  }

  showAndroidComingSoon();
}

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([name, value]) => {
    element?.setAttribute(name, value);
  });
}

function upsertLink(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLLinkElement>(selector);

  if (!element) {
    element = document.createElement('link');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([name, value]) => {
    element?.setAttribute(name, value);
  });
}

function BrandLogo({ className = '', loading = 'lazy' }: { className?: string; loading?: 'eager' | 'lazy' }) {
  return <img src={brandLogoSrc} alt="snovi.fm" className={className} loading={loading} decoding="async" />;
}

function splitStoreLabel(label: string) {
  const parts = label.trim().split(/\s+/);

  return {
    eyebrow: parts[0] || label,
    title: parts.slice(1).join(' ') || label,
  };
}

function StoreDownloadButton({
  platform,
  label,
  variant,
}: {
  platform: StorePlatform;
  label?: string;
  variant: 'header' | 'hero';
}) {
  const Icon = platform === 'ios' ? Apple : PlayCircle;
  const storeLabel = label ?? (platform === 'ios' ? 'Preuzmi za iOS' : 'Preuzmi za Android');
  const splitLabel = splitStoreLabel(storeLabel);
  const className = variant === 'hero'
    ? 'flex h-16 min-w-0 items-center justify-center gap-3 rounded-2xl bg-white px-4 text-black shadow-2xl shadow-white/10 transition-all hover:bg-violet-500 hover:text-white md:h-20 md:w-auto md:px-8 group'
    : 'inline-flex h-10 min-w-0 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-3 text-[10px] font-black uppercase tracking-[0.12em] text-black shadow-[0_12px_30px_-18px_rgba(255,255,255,0.8)] transition-all hover:bg-violet-500 hover:text-white sm:h-11 sm:px-4 sm:text-[11px]';

  const content = variant === 'hero' ? (
    <>
      <Icon className="h-6 w-6 shrink-0 md:h-7 md:w-7" />
      <div className="min-w-0 text-left">
        <p className="mb-1 text-[9px] leading-none opacity-70 md:text-[10px]">{splitLabel.eyebrow}</p>
        <p className="whitespace-nowrap text-[9px] font-black uppercase leading-none tracking-[0.06em] sm:text-[11px] sm:tracking-[0.08em] md:text-base md:tracking-[0.2em]">{splitLabel.title}</p>
      </div>
    </>
  ) : (
    <>
      <Icon className="h-4 w-4 shrink-0" />
      <span className="whitespace-nowrap">{storeLabel}</span>
    </>
  );

  if (platform === 'ios') {
    return (
      <button type="button" onClick={openAppStore} className={className}>
        {content}
      </button>
    );
  }

  return (
    <button type="button" onClick={showAndroidComingSoon} className={className}>
      {content}
    </button>
  );
}

type WaitlistCopy = (typeof translations)['bs']['waitlist'];

function WaitlistPanel({
  copy,
  className = '',
}: {
  copy: WaitlistCopy;
  className?: string;
}) {
  return (
    <div className={`glass relative overflow-hidden rounded-[3rem] border border-white/10 p-8 text-center shadow-4xl md:rounded-[4rem] md:p-20 ${className}`}>
      <div className="relative z-10">
        <motion.div
          animate={{ rotate: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="mx-auto mb-10 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-2xl shadow-violet-500/20"
        >
          <Mail className="h-10 w-10 text-white" />
        </motion.div>

        <h2 className="mb-6 text-4xl font-serif font-bold tracking-tight md:text-6xl">{copy.title}</h2>
        <p className="mx-auto mb-12 max-w-xl text-xl leading-relaxed text-slate-400">
          {copy.subtitle}
        </p>

        <form className="mx-auto flex max-w-2xl flex-col gap-4 md:flex-row" onSubmit={(event) => event.preventDefault()}>
          <input
            type="email"
            placeholder={copy.placeholder}
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-8 py-5 text-lg transition-all focus:border-violet-500 focus:outline-none"
          />
          <button className="rounded-2xl bg-white px-10 py-5 font-black uppercase tracking-widest text-black shadow-xl transition-all hover:bg-violet-500 hover:text-white">
            {copy.button}
          </button>
        </form>
      </div>
    </div>
  );
}

function formatBam(value: number) {
  return `${value.toFixed(2)} BAM`;
}

function SosDonationPage({
  onNavigate,
}: {
  onNavigate: (page: Page) => void;
}) {
  const subscriptionPrice = 50;
  const [isOpening, setIsOpening] = useState(true);
  const [showExtraDonation, setShowExtraDonation] = useState(false);
  const [extraDonationInput, setExtraDonationInput] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const extraDonation = Math.max(0, Number(extraDonationInput) || 0);
  const snoviDonation = subscriptionPrice * 0.2;
  const appAmount = subscriptionPrice - snoviDonation;
  const sosTotal = snoviDonation + extraDonation;
  const totalDue = subscriptionPrice + extraDonation;

  useEffect(() => {
    setIsOpening(true);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const hideTimer = window.setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      setIsOpening(false);
    }, 420);

    return () => window.clearTimeout(hideTimer);
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f9fc] pb-24 font-sans text-slate-950 selection:bg-blue-500/20">
      {isOpening ? (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-[#050505]/92">
          <LoaderCircle className="h-12 w-12 animate-spin text-violet-400" />
        </div>
      ) : null}

      <nav className="sticky top-0 z-[100] border-b border-slate-200/80 bg-white/95 px-4 shadow-sm md:px-6">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3">
          <button className="flex min-w-0 items-center" type="button" onClick={() => onNavigate('app')} aria-label="snovi.fm">
            <BrandLogo className="h-16 w-auto max-w-[190px] sm:h-20 sm:max-w-[320px]" loading="eager" />
          </button>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <a
              href={SOS_PAGE_PATH}
              className="hidden items-center sm:inline-flex"
              onClick={(event) => event.preventDefault()}
              aria-label="SOS Dječija sela u BiH"
            >
              <img src={sosFullLogoSrc} alt="SOS Dječija sela Bosna i Hercegovina" className="h-auto w-36 object-contain sm:w-40" loading="eager" />
            </a>
            <button
              type="button"
              onClick={() => onNavigate('app')}
              className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-4 text-[10px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-blue-700 sm:px-5"
            >
              Nazad
            </button>
          </div>
        </div>
      </nav>

      <main>
        <section className="grid min-h-[calc(100vh-5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(440px,0.86fr)]">
          <div className="relative isolate flex min-h-[620px] overflow-hidden bg-[#062c5f] px-6 py-12 text-white sm:px-10 lg:min-h-0 lg:px-14 lg:py-16">
            <img
              src={sosBackgroundSrc}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
              decoding="async"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,24,54,0.92),rgba(3,24,54,0.62)),linear-gradient(180deg,rgba(3,24,54,0.18),rgba(1,10,24,0.84))]" />
            <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#031836] to-transparent" />

            <div className="relative z-10 flex w-full flex-col justify-between">
              <div>
                <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/12 px-4 py-2">
                  <img src={sosLogoSrc} alt="SOS Children's Villages" className="h-8 w-8 object-contain" loading="eager" />
                  <span className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-100">snovi.fm za SOS Dječija sela u BiH</span>
                </div>

                <h1 className="max-w-3xl font-serif text-5xl font-bold leading-[0.92] tracking-tight sm:text-6xl xl:text-7xl">
                  snovi.fm doniraju, doniraj i ti
                </h1>
                <p className="mt-7 max-w-2xl text-xl font-medium leading-8 text-blue-50/90">
                  Uz svaku kupovinu godišnje pretplate za snovi.fm aplikaciju, snovi.fm donira 20% SOS Dječijim selima u BiH.
                </p>
              </div>

              <div className="mt-14 grid gap-4 sm:grid-cols-3">
                {[
                  { value: '50 BAM', label: 'godišnja pretplata' },
                  { value: '20%', label: 'donira snovi.fm' },
                  { value: '10 BAM', label: 'ide za SOS odmah' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/16 bg-white/10 p-5 shadow-2xl shadow-black/20">
                    <p className="text-3xl font-black tracking-tight text-white">{item.value}</p>
                    <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-100/80">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white px-4 py-8 text-slate-950 sm:px-8 lg:px-12 lg:py-12">
            <div className="mx-auto max-w-xl">
              <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Plaćanje za snovi.fm</p>
                  <h2 className="mt-2 text-4xl font-semibold tracking-tight">{formatBam(totalDue)}</h2>
                </div>
                <img src={sosFullLogoSrc} alt="SOS Dječija sela Bosna i Hercegovina" className="h-auto w-40 object-contain sm:w-48" loading="eager" />
              </div>

              <div className="mb-8 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-blue-50">
                    <img src={brandLogoSrc} alt="" className="h-full w-full object-contain p-2" loading="lazy" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-snug">Godišnja pretplata za snovi.fm aplikaciju</p>
                    <p className="mt-1 text-sm text-slate-500">Količina 1</p>
                  </div>
                  <p className="font-semibold">{formatBam(subscriptionPrice)}</p>
                </div>

                <div className="rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-blue-950">Donacija koju pokriva snovi.fm</p>
                      <p className="mt-1 text-xs text-blue-700">20% od godišnje pretplate ide SOS Dječijim selima u BiH.</p>
                    </div>
                    <p className="font-black text-blue-700">{formatBam(snoviDonation)}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowExtraDonation(true)}
                  className="flex w-full items-center justify-between rounded-2xl border border-dashed border-blue-300 bg-white px-4 py-4 text-left transition hover:border-blue-500 hover:bg-blue-50"
                >
                  <span>
                    <span className="block text-sm font-black uppercase tracking-[0.14em] text-blue-700">Želite i vi donirati?</span>
                    <span className="mt-1 block text-sm text-slate-500">Dodajte iznos po želji uz pretplatu.</span>
                  </span>
                  <Plus className="h-5 w-5 text-blue-700" />
                </button>

                {showExtraDonation ? (
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Dodatna donacija za SOS Dječije selo</span>
                    <div className="flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        inputMode="decimal"
                        value={extraDonationInput}
                        onChange={(event) => setExtraDonationInput(event.target.value)}
                        placeholder="0"
                        className="min-w-0 flex-1 px-4 py-3 text-base outline-none"
                      />
                      <span className="flex items-center bg-slate-50 px-4 text-sm font-bold text-slate-500">BAM</span>
                    </div>
                  </label>
                ) : null}

                <div className="space-y-3 border-t border-slate-200 pt-5 text-sm">
                  <div className="flex justify-between text-slate-600"><span>Za snovi.fm aplikaciju</span><span>{formatBam(appAmount)}</span></div>
                  <div className="flex justify-between text-slate-600"><span>Dodatna donacija</span><span>{formatBam(extraDonation)}</span></div>
                  <div className="flex justify-between gap-4 text-blue-700"><span>Ukupno za SOS Dječija sela u BiH</span><span className="shrink-0">{formatBam(sosTotal)}</span></div>
                  <div className="flex justify-between border-t border-slate-200 pt-4 text-base font-bold"><span>Ukupno za platiti</span><span>{formatBam(totalDue)}</span></div>
                </div>
              </div>

              <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
                <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-3 text-sm font-semibold text-slate-700">
                  <CreditCard className="h-4 w-4" />
                  Plaćanje karticom
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Ime na kartici</span>
                  <input className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                </label>

                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-700">Podaci o kartici</p>
                  <div className="overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                    <input aria-label="Broj kartice" placeholder="1234 1234 1234 1234" className="w-full border-b border-slate-200 px-4 py-3 outline-none" />
                    <div className="grid grid-cols-2">
                      <input aria-label="Datum isteka" placeholder="MM / GG" className="border-r border-slate-200 px-4 py-3 outline-none" />
                      <input aria-label="CVC" placeholder="CVC" className="px-4 py-3 outline-none" />
                    </div>
                  </div>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
                  <input type="email" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  <input
                    type="checkbox"
                    checked={privacyConsent}
                    onChange={(event) => setPrivacyConsent(event.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 accent-blue-600"
                  />
                  <span>
                    Saglasan/a sam da se moji podaci (ime i prezime, e-mail adresa i iznos donacije) dostave SOS Dječijim selima u BiH i koriste u skladu sa{' '}
                    <a
                      href={getPathForPage('privacy')}
                      onClick={(event) => {
                        event.preventDefault();
                        onNavigate('privacy');
                      }}
                      className="font-semibold text-blue-700 underline underline-offset-2"
                    >
                      Izjavom o privatnosti
                    </a>.
                  </span>
                </label>

              </form>
            </div>
          </div>
        </section>

      </main>
      <div className="fixed inset-x-0 bottom-0 z-[120] border-t border-slate-200 bg-white px-4 py-3 shadow-[0_-20px_60px_-30px_rgba(15,23,42,0.45)] sm:px-6">
        <div className="mx-auto max-w-xl space-y-3">
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-800">
            Donacije još uvijek nisu dostupne. Molimo, vratite se ubrzo
          </p>
          <button
            className="flex h-14 w-full cursor-not-allowed items-center justify-center rounded-xl bg-slate-300 text-sm font-black uppercase tracking-[0.14em] text-slate-500 shadow-none"
            disabled
            aria-disabled="true"
          >
            Plati {formatBam(totalDue)}
          </button>
        </div>
      </div>
    </div>
  );
}

function SosStorySection({
  onNavigate,
}: {
  onNavigate: (page: Page) => void;
}) {
  return (
    <section id="waitlist" className="relative isolate overflow-hidden bg-[#062c5f] px-6 py-14 text-white scroll-mt-28 md:py-20">
      <img
        src={sosFamilyBackgroundSrc}
        alt=""
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(3,24,54,0.72),rgba(3,24,54,0.46)),linear-gradient(180deg,rgba(6,44,95,0.48),rgba(6,44,95,0.68))]" />
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="text-center lg:order-2 lg:text-right">
          <img src={sosFullLogoSrc} alt="SOS Dječija sela Bosna i Hercegovina" className="mx-auto mb-10 h-auto w-full max-w-md object-contain lg:mx-0 lg:ml-auto" loading="lazy" />
          <p className="mb-5 text-[11px] font-black uppercase tracking-[0.36em] text-blue-200">priča iza donacije</p>
          <h2 className="font-serif text-5xl font-bold leading-[0.95] md:text-7xl">Svako dijete zaslužuje miran san i porodicu.</h2>
        </div>
        <div className="lg:order-1">
          <div className="grid gap-5 sm:grid-cols-2">
            {[
              'snovi.fm od svake godišnje pretplate izdvaja 20% (10 KM) za kontinuiranu i direktnu podršku djeci bez roditeljskog staranja u brizi SOS Dječijih sela u BiH.',
              'I vi možete donirati dodatni iznos, koji ćete unijeti direktno u posebno predviđeni odjeljak pri kupovini.',
              'Cilj je jednostavan: dati priliku svakom djetetu da odrasta u toplom porodičnom okruženju uz mirne snove.',
            ].map((item, index) => (
              <div key={item} className={`rounded-2xl border border-white/12 bg-white/8 p-6 ${index === 0 ? 'sm:col-span-2' : ''}`}>
                <Heart className="mb-5 h-6 w-6 text-violet-300" />
                <p className="text-lg font-medium leading-7 text-blue-50">{item}</p>
              </div>
            ))}
          </div>
          <a
            href={SOS_PAGE_PATH}
            onClick={(event) => {
              event.preventDefault();
              onNavigate('sosDonation');
            }}
            className="mx-auto mt-8 flex max-w-3xl justify-center text-center text-base font-black uppercase leading-relaxed tracking-[0.16em] text-blue-100 underline decoration-blue-300/60 underline-offset-8 transition [text-wrap:balance] hover:text-white hover:decoration-white"
          >
            KUPI GODIŠNJU PRETPLATU, A SNOVI.FM ĆE DONIRATI 10 KM SOS DJEČIJIM SELIMA U BIH.
          </a>
        </div>
      </div>
    </section>
  );
}

function LegalPage({
  page,
  lang,
  onNavigate,
}: {
  page: LegalPageId;
  lang: Language;
  onNavigate: (page: Page) => void;
}) {
  const t = translations[lang];
  const content = t.legal[page];

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white selection:bg-violet-500/30">
      <nav className="fixed inset-x-0 top-0 z-[100] flex items-center justify-between border-b border-white/5 px-6 glass">
        <button className="flex items-center" type="button" onClick={() => onNavigate('app')} aria-label="snovi.fm">
          <BrandLogo className="h-20 w-auto max-w-[320px] md:h-24 md:max-w-[380px]" loading="eager" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('app')}
          className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-black uppercase tracking-widest text-black transition-all hover:bg-violet-500 hover:text-white"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          {t.legal.back}
        </button>
      </nav>

      <main className="px-6 pb-24 pt-28 md:pt-32">
        <section className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center justify-between gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-500/15 text-violet-300 ring-1 ring-white/10">
              <Shield className="h-8 w-8" />
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
          </div>

          <p className="mb-5 text-[11px] font-black uppercase tracking-[0.5em] text-violet-400">{content.kicker}</p>
          <h1 className="mb-8 font-serif text-5xl font-bold leading-[0.95] tracking-tight text-white md:text-7xl">
            {content.title}
          </h1>
          <p className="mb-12 text-xl leading-relaxed text-slate-400 md:text-2xl">{content.intro}</p>

          <div className="space-y-5">
            {content.items.map((item) => (
              <article key={item} className="glass flex gap-5 rounded-[2rem] border border-white/10 p-6">
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-violet-400 shadow-[0_0_18px_rgba(167,139,250,0.7)]" />
                <p className="text-base leading-relaxed text-slate-300 md:text-lg">{item}</p>
              </article>
            ))}
          </div>

          <div className="mt-16 flex flex-wrap gap-6 border-t border-white/10 pt-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <a
              href={getPathForPage('privacy')}
              className="transition-colors hover:text-white"
              onClick={(event) => {
                event.preventDefault();
                onNavigate('privacy');
              }}
            >
              {t.footer.privacy}
            </a>
            <a
              href={getPathForPage('terms')}
              className="transition-colors hover:text-white"
              onClick={(event) => {
                event.preventDefault();
                onNavigate('terms');
              }}
            >
              {t.footer.terms}
            </a>
            <a
              href={getPathForPage('cookies')}
              className="transition-colors hover:text-white"
              onClick={(event) => {
                event.preventDefault();
                onNavigate('cookies');
              }}
            >
              {t.footer.cookies}
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

function MobileBootShell({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white">
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(139,92,246,0.28),transparent_34%),linear-gradient(180deg,#041221_0%,#050505_70%)]" />
        <div className="relative z-10 mx-auto max-w-xl">
          <img
            src={brandLogoSrc}
            alt="snovi.fm"
            className="mx-auto mb-10 h-24 w-auto max-w-[320px]"
            loading="eager"
            decoding="async"
          />
          <p className="mb-5 text-[11px] font-black uppercase tracking-[0.32em] text-violet-300">
            priprema, pozor, san.
          </p>
          <h1 className="font-serif text-6xl font-bold leading-[0.86] tracking-tighter">
            Uspavajte maštu. Probudite mir.
          </h1>
          <p className="mx-auto mt-8 max-w-sm text-base font-medium leading-7 text-slate-300">
            Dječije priče, naratori i zvučni pejzaži za mirniji odlazak u krevet.
          </p>
          <div className="mt-10 flex flex-col gap-3">
            <a
              href={APP_STORE_URL}
              className="rounded-2xl bg-white px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-black"
            >
              App Store
            </a>
            <button
              type="button"
              onClick={onEnter}
              className="rounded-2xl border border-white/15 bg-white/[0.04] px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-white"
            >
              Istražite magiju
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState<Language>('bs');
  const [page, setPage] = useState<Page>(() => getPageFromPath());
  const [scrolled, setScrolled] = useState(false);
  const [headerStorePlatform, setHeaderStorePlatform] = useState<StorePlatform | null>(() => detectHeaderStorePlatform());
  const [storeChoiceModalOpen, setStoreChoiceModalOpen] = useState(false);
  const [showHeroParticles, setShowHeroParticles] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return !window.matchMedia('(max-width: 767px)').matches;
  });
  const [reducePageMotion, setReducePageMotion] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.matchMedia('(max-width: 767px)').matches;
  });
  const t = translations[lang];
  const landingExperience = useLandingExperience();

  const scrollToSectionPage = useCallback((targetPage: Page, behavior: ScrollBehavior = 'smooth') => {
    const sectionId = SECTION_PAGE_IDS[targetPage];
    if (!sectionId) {
      return;
    }

    const scrollToTarget = () => {
      const target = document.getElementById(sectionId);
      if (!target) {
        return false;
      }

      const nav = document.querySelector('nav');
      const offset = nav instanceof HTMLElement ? nav.offsetHeight + 8 : 88;
      const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - offset);
      window.scrollTo({ top, left: 0, behavior });
      return true;
    };

    window.requestAnimationFrame(() => {
      if (scrollToTarget()) {
        return;
      }

      window.setTimeout(scrollToTarget, 120);
    });
  }, []);

  const navigateToPage = useCallback((nextPage: Page) => {
    const nextPath = getPathForPage(nextPage);

    if (normalizePath(window.location.pathname) !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }

    setPage(nextPage);

    if (SECTION_PAGE_IDS[nextPage]) {
      scrollToSectionPage(nextPage);
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [scrollToSectionPage]);

  const closeStoreChoiceModal = useCallback(() => {
    setStoreChoiceModalOpen(false);
  }, []);

  const chooseStorePlatform = useCallback((platform: StorePlatform) => {
    setStoreChoiceModalOpen(false);
    openStoreForPlatform(platform);
  }, []);

  const handleMagicClick = useCallback(() => {
    const mobilePlatform = detectHeaderStorePlatform();

    if (mobilePlatform) {
      openStoreForPlatform(mobilePlatform);
      return;
    }

    setStoreChoiceModalOpen(true);
  }, []);

  useEffect(() => {
    const handlePopState = () => setPage(getPageFromPath());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!SECTION_PAGE_IDS[page]) {
      return;
    }

    scrollToSectionPage(page, 'auto');
  }, [page, scrollToSectionPage]);

  useEffect(() => {
    const meta = PAGE_META[page];
    const canonicalUrl = `${SITE_ORIGIN}${meta.path}`;
    const imageUrl = `${SITE_ORIGIN}${meta.imagePath ?? OG_IMAGE_PATH}`;
    const imageAlt = meta.imageAlt ?? 'snovi.fm bedtime story and soundscape artwork';

    document.title = meta.title;
    upsertMeta('meta[name="title"]', { name: 'title', content: meta.title });
    upsertMeta('meta[name="description"]', { name: 'description', content: meta.description });
    upsertMeta('meta[name="keywords"]', { name: 'keywords', content: meta.keywords });
    upsertMeta('meta[name="robots"]', { name: 'robots', content: 'index,follow,max-snippet:160,max-image-preview:large' });
    upsertMeta('meta[name="theme-color"]', { name: 'theme-color', content: '#050505' });
    upsertLink('link[rel="canonical"]', { rel: 'canonical', href: canonicalUrl });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: lang === 'bs' ? 'bs_BA' : 'en_US' });
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: 'snovi.fm' });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: meta.title });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: meta.description });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: imageUrl });
    upsertMeta('meta[property="og:image:secure_url"]', { property: 'og:image:secure_url', content: imageUrl });
    upsertMeta('meta[property="og:image:alt"]', {
      property: 'og:image:alt',
      content: imageAlt,
    });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:url"]', { name: 'twitter:url', content: canonicalUrl });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: meta.title });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: meta.description });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: imageUrl });
  }, [lang, page]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const syncHeaderStorePlatform = () => {
      setHeaderStorePlatform(detectHeaderStorePlatform());
    };

    syncHeaderStorePlatform();
    window.addEventListener('resize', syncHeaderStorePlatform);

    return () => {
      window.removeEventListener('resize', syncHeaderStorePlatform);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const syncMobileSettings = () => {
      const isMobile = mediaQuery.matches;
      setShowHeroParticles(!isMobile);
      setReducePageMotion(isMobile);
    };

    syncMobileSettings();
    mediaQuery.addEventListener('change', syncMobileSettings);

    return () => {
      mediaQuery.removeEventListener('change', syncMobileSettings);
    };
  }, []);

  useEffect(() => {
    window.__SNOVI_BOOT_MARK__?.('App mounted', 'hero should render now');
    window.__SNOVI_STOP_BOOT_SCROLL_LOCK__?.();
  }, []);

  useEffect(() => {
    if (page !== 'app') {
      return;
    }

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, [page]);

  useEffect(() => {
    if (!landingExperience.isWaitlistModalOpen && !storeChoiceModalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [landingExperience.isWaitlistModalOpen, storeChoiceModalOpen]);

  useEffect(() => {
    if (!landingExperience.isWaitlistModalOpen && !storeChoiceModalOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (storeChoiceModalOpen) {
          closeStoreChoiceModal();
          return;
        }

        landingExperience.closeWaitlistModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    closeStoreChoiceModal,
    landingExperience.closeWaitlistModal,
    landingExperience.isWaitlistModalOpen,
    storeChoiceModalOpen,
  ]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce), (max-width: 767px)').matches) {
      return;
    }

    const widgets = Array.from(document.querySelectorAll<HTMLElement>('.animated-widget'));

    if (!widgets.length) {
      return;
    }

    let frameId = 0;

    const updateWidgets = () => {
      frameId = 0;
      const viewportHeight = window.innerHeight || 1;

      widgets.forEach((widget) => {
        const rect = widget.getBoundingClientRect();

        if (rect.width === 0 && rect.height === 0) {
          widget.style.setProperty('--widget-scale', '1');
          return;
        }

        const centerOffset = (rect.top + rect.height / 2 - viewportHeight / 2) / (viewportHeight / 2);
        const clampedOffset = Math.max(-1, Math.min(1, centerOffset));
        const rawStrength = Number(widget.dataset.widgetStrength ?? '1');
        const strength = Number.isFinite(rawStrength) ? rawStrength : 1;
        const scale = 0.96 + (1 - Math.abs(clampedOffset)) * 0.08 * strength;

        widget.style.setProperty('--widget-scale', scale.toFixed(3));
      });
    };

    const queueUpdate = () => {
      if (!frameId) {
        frameId = window.requestAnimationFrame(updateWidgets);
      }
    };

    updateWidgets();
    window.addEventListener('scroll', queueUpdate, { passive: true });
    window.addEventListener('resize', queueUpdate);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener('scroll', queueUpdate);
      window.removeEventListener('resize', queueUpdate);

      widgets.forEach((widget) => {
        widget.style.removeProperty('--widget-scale');
      });
    };
  }, []);

  const toggleLang = () => setLang(prev => prev === 'bs' ? 'en' : 'bs');
  const headerStorePlatforms: StorePlatform[] = headerStorePlatform ? [headerStorePlatform] : ['ios', 'android'];
  const useShortHeaderStoreLabels = headerStorePlatforms.length > 1;

  if (page === 'sosDonation') {
    return <SosDonationPage onNavigate={navigateToPage} />;
  }

  if (LEGAL_PAGES.has(page)) {
    return <LegalPage page={page as LegalPageId} lang={lang} onNavigate={navigateToPage} />;
  }

  return (
    <MotionConfig reducedMotion={reducePageMotion ? 'always' : 'user'}>
    <div className="min-h-screen bg-[#050505] pb-28 font-sans text-white selection:bg-violet-500/30 md:pb-36">
      {/* Navigation */}
      <nav className={`fixed inset-x-0 top-0 z-[100] flex items-center justify-between gap-3 px-4 transition-colors duration-500 md:px-6 ${scrolled ? 'glass border-b border-white/5' : 'bg-transparent'}`}>
        <div className="flex min-w-0 items-center">
          <BrandLogo className="h-16 w-auto max-w-[190px] sm:h-20 sm:max-w-[320px] md:h-24 md:max-w-[380px]" loading="eager" />
        </div>
        
        <div className="hidden lg:flex items-center gap-10 text-[13px] uppercase tracking-widest font-bold text-slate-400">
          <a
            href={getPathForPage('methodology')}
            onClick={(event) => {
              event.preventDefault();
              navigateToPage('methodology');
            }}
            className="hover:text-white transition-colors"
          >
            {t.nav.psychology}
          </a>
          <a
            href={getPathForPage('ambients')}
            onClick={(event) => {
              event.preventDefault();
              navigateToPage('ambients');
            }}
            className="hover:text-white transition-colors"
          >
            {t.nav.effects}
          </a>
          <a
            href={getPathForPage('library')}
            onClick={(event) => {
              event.preventDefault();
              navigateToPage('library');
            }}
            className="hover:text-white transition-colors"
          >
            Biblioteka
          </a>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button 
            onClick={toggleLang}
            className="hidden items-center gap-2 rounded-full px-4 py-2 text-[11px] font-black tracking-widest transition-all hover:bg-white/10"
          >
            <Globe className="w-3 h-3 text-violet-400" />
            {lang.toUpperCase()}
          </button>
          <a
            href={SOS_PAGE_PATH}
            onClick={(event) => {
              event.preventDefault();
              navigateToPage('sosDonation');
            }}
            className="inline-flex shrink-0 items-center transition-opacity hover:opacity-85"
            aria-label="SOS Dječija sela u BiH"
          >
            <img
              src={sosFullLogoSrc}
              alt="SOS Dječija sela Bosna i Hercegovina"
              className="h-auto w-20 object-contain min-[420px]:w-24 sm:w-32 lg:w-36"
              loading="eager"
            />
          </a>
          {headerStorePlatforms.map((platform) => (
            <React.Fragment key={platform}>
              <StoreDownloadButton
                platform={platform}
                variant="header"
                label={
                  useShortHeaderStoreLabels
                    ? platform === 'ios' ? 'iOS' : 'Android'
                    : platform === 'ios' ? 'Preuzmi za iOS' : 'Preuzmi za Android'
                }
              />
            </React.Fragment>
          ))}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative isolate min-h-screen flex items-center overflow-hidden pt-24 pb-20 md:pt-32">
        {/* Atmospheric Backgrounds */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-x-0 top-0 z-0 w-full aspect-[1080/1920] overflow-hidden md:inset-0 md:h-full md:aspect-auto">
            <HeroLottieBackground className="hero-lottie-bg absolute inset-0 z-0 opacity-90" />
            <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#041221] via-[#050505]/45 to-transparent md:to-[#050505]" />
            {/* Subtle Night Sky Sparkles */}
            {showHeroParticles && (
              <div className="absolute inset-0 z-[4] overflow-hidden pointer-events-none">
                {[...Array(40)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      opacity: Math.random() * 0.3,
                      x: `${Math.random() * 100}%`,
                      y: `${Math.random() * 100}%`,
                      scale: Math.random() * 0.5 + 0.5,
                    }}
                    animate={{
                      opacity: [0.1, 0.5, 0.1],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 4 + Math.random() * 6,
                      repeat: Infinity,
                      delay: Math.random() * 10,
                    }}
                    className="absolute w-0.5 h-0.5 bg-white rounded-full"
                  />
                ))}
              </div>
            )}

            <div className="hero-mobile-fade absolute inset-x-0 bottom-0 z-[5] h-[30%] md:hidden" />
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="flex flex-col items-center text-center mb-0 md:mb-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-violet-400 text-[11px] font-black uppercase tracking-[0.3em] mb-10"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {t.hero.tagline}
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-7xl md:text-[10rem] font-serif font-bold leading-[0.85] mb-10 tracking-tighter max-w-5xl"
            >
              {t.hero.title}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-xl md:text-2xl text-slate-400 max-w-2xl mb-10 leading-relaxed font-medium"
            >
              {t.hero.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="flex w-full max-w-[420px] flex-col items-stretch justify-center gap-4 md:max-w-none md:flex-row md:items-center md:gap-6 mx-auto mb-14"
            >
              <button
                onClick={handleMagicClick}
                className="flex h-20 w-full items-center justify-center gap-3 rounded-2xl bg-violet-600 px-10 font-black uppercase tracking-widest text-white shadow-2xl shadow-violet-500/20 transition-all hover:bg-white hover:text-black md:w-auto group"
              >
                {t.hero.cta}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="grid w-full grid-cols-2 gap-4 md:flex md:w-auto md:gap-6">
                <StoreDownloadButton platform="ios" variant="hero" label={t.hero.download.appStore} />
                <StoreDownloadButton platform="android" variant="hero" label={t.hero.download.googlePlay} />
              </div>
            </motion.div>
          </div>

          {/* Device Mockups - Responsive Grid */}
          <motion.div 
            id="preview"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-6xl mx-auto mt-0 md:mt-20 scroll-mt-32"
          >
            <HeroDeviceShowcase lang={lang} experience={landingExperience} />
            
            {/* Floating Badges - Repositioned and Responsive */}
            <div className="absolute inset-0 pointer-events-none z-30 hidden md:block">
              {/* Brain Badge */}
              <AnimatedWidgetShell className="absolute top-[150px] right-4 left-auto z-40 md:top-0 md:left-[5%] md:right-auto md:translate-x-0">
                <motion.div 
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="pointer-events-auto flex w-[208px] rounded-2xl border-white/10 p-4 shadow-3xl glass lg:rounded-3xl lg:p-6"
                >
                  <div className="flex w-full items-center justify-end gap-3 text-right md:w-auto md:justify-start md:text-left lg:gap-5">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                      <Brain className="text-violet-400 w-5 h-5 lg:w-7 lg:h-7" />
                    </div>
                    <div className="text-right md:text-left">
                      <p className="text-[9px] lg:text-[11px] font-black uppercase text-slate-400 tracking-widest">{t.hero.badges.methodology}</p>
                      <p className="text-sm lg:text-lg font-bold">{t.hero.badges.neuroAcoustics}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatedWidgetShell>

              {/* Sleep Quality Badge */}
              <AnimatedWidgetShell className="absolute top-[25%] right-[5%] left-auto z-40 hidden md:block md:translate-x-0">
                <motion.div 
                  animate={{ y: [0, 30, 0] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="pointer-events-auto flex rounded-2xl border-white/10 p-4 shadow-3xl glass lg:rounded-3xl lg:p-6"
                >
                  <div className="flex items-center gap-3 lg:gap-5">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="text-emerald-400 w-5 h-5 lg:w-7 lg:h-7" />
                    </div>
                    <div>
                      <p className="text-[9px] lg:text-[11px] font-black uppercase text-slate-400 tracking-widest">{t.hero.badges.sleepQuality}</p>
                      <p className="text-sm lg:text-lg font-bold">{t.hero.badges.improvement}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatedWidgetShell>

              {/* Community Badge - NEW */}
              <AnimatedWidgetShell className="absolute top-[300px] right-4 left-auto z-40 md:top-1/2 md:left-[2%] md:right-auto md:-translate-y-1/2 md:translate-x-0">
                <motion.div 
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                  className="pointer-events-auto flex w-[208px] rounded-2xl border-white/10 p-4 shadow-3xl glass lg:rounded-3xl lg:p-6"
                >
                  <div className="flex w-full items-center justify-end gap-3 text-right md:w-auto md:justify-start md:text-left lg:gap-5">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Users className="text-blue-400 w-5 h-5 lg:w-7 lg:h-7" />
                    </div>
                    <div className="text-right md:text-left">
                      <p className="text-[9px] lg:text-[11px] font-black uppercase text-slate-400 tracking-widest">{t.hero.badges.community}</p>
                      <p className="text-sm lg:text-lg font-bold">{t.hero.badges.parents}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatedWidgetShell>

              {/* Parent Review Bubble */}
              <AnimatedWidgetShell className="absolute bottom-0 left-[5%] z-50 hidden md:block md:translate-x-0" strength={0.85}>
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="pointer-events-auto flex max-w-[180px] flex-col items-start rounded-2xl border-white/10 p-4 shadow-2xl glass"
              >
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-[11px] font-medium text-slate-300 italic text-center md:text-left">{t.hero.review.text}</p>
                <p className="text-[9px] font-bold text-violet-400 mt-1 uppercase tracking-widest">— {t.hero.review.author}</p>
              </motion.div>
              </AnimatedWidgetShell>

              {/* iOS Style Now Playing Widget */}
              <AnimatedWidgetShell className="absolute top-0 right-4 z-50 md:top-auto md:right-[5%] md:bottom-[25%] md:left-auto md:translate-x-0">
              <motion.div 
                initial={{ opacity: 1, x: 0 }}
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="pointer-events-auto flex w-[240px] max-w-[78vw] flex-col rounded-[2rem] border-white/10 p-4 shadow-4xl glass md:w-72 md:max-w-none lg:w-80 lg:rounded-[2.5rem] lg:p-5"
              >
                <div className="flex items-center gap-3 lg:gap-4 mb-3 lg:mb-4">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src={landingExperience.selectedStory?.image || brandLogoSrc}
                      alt="Now Playing"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] lg:text-[10px] font-black uppercase text-violet-400 tracking-widest mb-0.5 lg:mb-1">{t.hero.badges.nowPlaying}</p>
                    <p className="text-xs lg:text-sm font-bold truncate">
                      {landingExperience.selectedStory?.title || t.hero.nowPlaying.title}
                    </p>
                    <p className="text-[9px] lg:text-[10px] text-slate-400">
                      {landingExperience.selectedStory?.duration || '08:30'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void landingExperience.togglePlayPause()}
                    disabled={!landingExperience.selectedStory?.sound}
                    className={`flex w-8 h-8 lg:w-10 lg:h-10 rounded-full items-center justify-center transition ${
                      landingExperience.isPlaying ? 'bg-white text-black' : 'bg-white/10 text-white'
                    } disabled:cursor-not-allowed disabled:opacity-40`}
                    aria-label={landingExperience.isPlaying ? 'Pause story' : 'Play story'}
                  >
                    {landingExperience.isAudioLoading ? (
                      <LoaderCircle className="w-3 h-3 lg:w-4 lg:h-4 animate-spin" />
                    ) : landingExperience.isPlaying ? (
                      <Pause className="w-3 h-3 lg:w-4 lg:h-4 fill-current" />
                    ) : (
                      <Play className="w-3 h-3 lg:w-4 lg:h-4 fill-current ml-0.5" />
                    )}
                  </button>
                </div>
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: `${Math.max(0, Math.min(1, landingExperience.progressRatio)) * 100}%` }}
                    transition={{ duration: 0.25 }}
                    className="h-full bg-violet-500"
                  />
                </div>
              </motion.div>
              </AnimatedWidgetShell>

              {/* Live Listeners */}
              <AnimatedWidgetShell className="absolute -top-10 left-1/2 z-[60] hidden -translate-x-1/2 md:block" strength={0.85}>
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="pointer-events-auto flex items-center gap-2 whitespace-nowrap rounded-full border-white/10 px-4 py-2 shadow-2xl glass lg:gap-3 lg:px-6 lg:py-3"
              >
                <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-red-500 animate-pulse" />
                <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-white">
                  <span className="text-red-500">1,240</span> {t.hero.badges.liveListeners}
                </p>
              </motion.div>
              </AnimatedWidgetShell>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* SOS Story Section */}
      <SosStorySection onNavigate={navigateToPage} />

      <>
      <div className="max-w-7xl mx-auto h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Psychology Section - Refined Grid with Numbers */}
      <section id="psychology" className="py-20 px-6 relative overflow-hidden md:pt-20 md:pb-40">
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid gap-10 items-end mb-16 md:mb-32 lg:grid-cols-2 lg:gap-24">
            <div>
              <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-violet-500 mb-8">{t.nav.psychology}</h2>
              <h3 className="text-6xl md:text-8xl font-serif font-bold leading-[0.9] tracking-tighter">{t.psychology.title}</h3>
            </div>
            <p className="text-2xl text-slate-400 leading-relaxed font-medium" data-nosnippet>
              {t.psychology.description}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: Brain, title: t.psychology.neuroAcoustics, text: t.psychology.point1, num: '01' },
              { icon: Volume2, title: t.psychology.auditoryIsolation, text: t.psychology.point2, num: '02' },
              { icon: Sparkles, title: t.psychology.melatoninFocus, text: t.psychology.point3, num: '03' }
            ].map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative group"
              >
                <div className="absolute -top-20 -left-10 hidden select-none font-serif text-[120px] font-black text-white/5 transition-colors group-hover:text-violet-500/10 md:block">
                  {item.num}
                </div>
                <div className="relative z-10">
                  <div className="mb-8 flex items-center gap-4 md:mb-10">
                    <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all group-hover:border-violet-500/30 group-hover:bg-violet-500/20">
                      <item.icon className="relative z-10 h-8 w-8 text-violet-500" />
                      {i === 0 && (
                        <motion.div 
                          animate={{ x: [-100, 100] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/20 to-transparent"
                        />
                      )}
                    </div>
                    <div className="select-none font-serif text-5xl font-black leading-none text-white/8 md:hidden">
                      {item.num}
                    </div>
                  </div>
                  <h4 className="text-3xl font-bold mb-6 tracking-tight">{item.title}</h4>
                  <p className="text-lg text-slate-400 leading-relaxed">{item.text}</p>
                  
                  {/* Brainwave Animation for first card */}
                  {i === 0 && (
                    <div className="mt-8 flex items-end gap-1 h-8">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(j => (
                        <motion.div 
                          key={j}
                          animate={{ height: [10, 30, 10] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: j * 0.1 }}
                          className="w-1 bg-violet-500/30 rounded-full"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Repositioned Widgets - Bottom Center */}
          <div className="hidden md:mt-24 md:flex md:flex-row items-center justify-center gap-8 md:gap-16">
            {/* Brain Sync Badge */}
            <AnimatedWidgetShell strength={0.85}>
            <motion.div 
              animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="glass p-4 rounded-2xl border-white/10 shadow-2xl z-40"
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-violet-500 animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.psychology.brainSync}</p>
              </div>
            </motion.div>
            </AnimatedWidgetShell>

            {/* Clinical Study Badge */}
            <AnimatedWidgetShell strength={0.9}>
            <motion.div 
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="glass p-5 rounded-3xl border-white/10 shadow-3xl z-50 flex items-center gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <CheckCircle2 className="text-indigo-400 w-6 h-6" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{t.psychology.clinicalStudy}</p>
                  <p className="text-sm font-bold">{t.psychology.successRate}</p>
                </div>
              </div>
            </motion.div>
            </AnimatedWidgetShell>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Ritual Section - New Cool Element */}
      <section className="py-20 px-6 bg-[#050505] relative overflow-hidden md:py-40">
        <div className="max-w-7xl mx-auto relative">
          {/* Floating Element in Ritual - Repositioned for better visibility */}
          <AnimatedWidgetShell className="absolute -top-20 left-1/2 z-50 hidden -translate-x-1/2 md:-left-10 md:top-0 md:block md:translate-x-0">
          <motion.div 
            animate={{ y: [0, 20, 0], rotate: [-5, 5, -5] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="glass p-6 rounded-full border-white/10 shadow-4xl flex flex-col items-center gap-2"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Sparkles className="text-amber-400 w-5 h-5 md:w-6 md:h-6" />
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-amber-400">{t.ritual.autoOff}</p>
            </div>
          </motion.div>
          </AnimatedWidgetShell>

          <div className="text-center mb-24">
            <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-violet-500 mb-8">{t.ritual.title}</h2>
            <h3 className="text-6xl md:text-8xl font-serif font-bold leading-[0.9] tracking-tighter mb-10">{t.ritual.subtitle}</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: t.ritual.step1.title, text: t.ritual.step1.text, icon: Sparkles },
              { step: '02', title: t.ritual.step2.title, text: t.ritual.step2.text, icon: Volume2 },
              { step: '03', title: t.ritual.step3.title, text: t.ritual.step3.text, icon: Heart }
            ].map((item, i) => (
              <div key={i} className="glass p-10 rounded-[3rem] border-white/5 relative group hover:bg-white/5 transition-all">
                <div className="absolute top-10 right-10 hidden font-serif text-6xl font-black text-white/5 md:block">{item.step}</div>
                <div className="mb-8 flex items-center gap-4">
                  <item.icon className="h-12 w-12 text-violet-500 transition-transform group-hover:scale-110" />
                  <div className="font-serif text-4xl font-black leading-none text-white/8 md:hidden">{item.step}</div>
                </div>
                <h4 className="text-3xl font-bold mb-4">{item.title}</h4>
                <p className="text-slate-400 text-lg">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Effects Section - Hardware Mixer Style */}
      <section id="effects" className="py-20 px-6 bg-[#080808] md:py-40">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-5xl md:text-7xl font-serif font-bold mb-10 leading-[0.9]">{t.effects.title}</h2>
              <p className="text-xl text-slate-400 mb-12 leading-relaxed">
                {t.effects.description}
              </p>
                <div className="space-y-8">
                {effects.map((effect) => {
                  const level = landingExperience.effectLevels[effect.id] ?? 0;
                  const percent = mixerLevelToPercent(level);
                  const isActive = percent > 0;
                  return (
                    <div key={effect.id} className="space-y-3 group">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full transition-all duration-500 ${isActive ? 'bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,1)]' : 'bg-white/10'}`} />
                          <effect.icon className={`w-5 h-5 transition-colors duration-500 ${isActive ? effect.color : 'text-slate-600'}`} />
                          <span className={`text-sm font-bold uppercase tracking-widest transition-colors duration-500 ${isActive ? 'text-white' : 'text-slate-500'}`}>{effect.label[lang]}</span>
                        </div>
                        <span className="text-xs font-mono text-slate-500">{percent}%</span>
                      </div>
                      <div className="relative h-4">
                        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 rounded-full border border-white/5 bg-white/5" />
                        <motion.div
                          initial={false}
                          animate={{
                            width: `${percent}%`,
                            backgroundColor: isActive ? '#8b5cf6' : '#1e1b4b'
                          }}
                          className="pointer-events-none absolute left-0 top-1/2 h-3 -translate-y-1/2 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                        />
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={1}
                          value={percent}
                          onChange={(event) =>
                            landingExperience.setEffectLevel(effect.id, mixerPercentToLevel(Number(event.target.value)))
                          }
                          className="landing-mixer-slider relative z-10 h-4 w-full cursor-pointer"
                          aria-label={effect.label[lang]}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              {/* Floating Sound Waves in Effects */}
              {/* New Floating Element: Spatial Audio */}
              <AnimatedWidgetShell className="absolute -top-20 left-1/2 z-50 hidden -translate-x-1/2 md:block" strength={0.85}>
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="glass flex cursor-pointer items-center gap-3 rounded-2xl border-white/10 px-6 py-3 shadow-3xl"
              >
                <Volume2 className="w-4 h-4 text-violet-400" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">{t.effects.spatialAudio}</p>
              </motion.div>
              </AnimatedWidgetShell>

              <div className="aspect-square rounded-[3rem] glass border-white/5 p-12 flex items-center justify-center relative overflow-hidden z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent" />
                <div className="soundscape-rings aspect-square w-full rounded-full border-2 border-dashed border-white/10 flex items-center justify-center">
                  <div className="aspect-square w-3/4 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
                    <div className="aspect-square w-1/2 rounded-full border-2 border-dashed border-white/30" />
                  </div>
                </div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-violet-600 flex items-center justify-center shadow-[0_0_50px_rgba(139,92,246,0.5)]">
                    <Volume2 className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-20" />

      {/* Dedication Section - Luxury Split with Parents Image */}
      <section className="px-6 pb-6 pt-12 bg-white text-black rounded-[5rem] mx-4 mb-4 relative overflow-hidden md:py-40">
        <div className="max-w-7xl mx-auto grid gap-12 items-center lg:grid-cols-2 lg:gap-32">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-violet-600 mb-8 md:mb-10">{t.dedication.mission}</h2>
            <h3 className="text-6xl md:text-8xl font-serif font-bold mb-12 leading-[0.85] tracking-tighter">{t.dedication.title}</h3>
            <p className="text-2xl text-slate-600 leading-relaxed mb-16 font-medium">
              {t.dedication.description}
            </p>
            <div className="grid sm:grid-cols-2 gap-10">
              {[
                { title: t.dedication.feature1.title, text: t.dedication.feature1.text },
                { title: t.dedication.feature2.title, text: t.dedication.feature2.text },
                { title: t.dedication.feature3.title, text: t.dedication.feature3.text },
                { title: t.dedication.feature4.title, text: t.dedication.feature4.text }
              ].map((item, i) => (
                <div key={i} className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center">
                    <CheckCircle2 className="text-violet-600 w-7 h-7" />
                  </div>
                  <h4 className="text-2xl font-bold tracking-tight">{item.title}</h4>
                  <p className="text-slate-500 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)]">
              <img 
                src={dedicationImageSrc}
                alt="Parents reading to child" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            
            <AnimatedWidgetShell className="absolute -bottom-10 -right-10 z-50 hidden md:block" strength={0.9}>
            <div className="max-w-[280px] rotate-[5deg] rounded-[3rem] border border-slate-700/60 bg-[#0f172a] p-10 shadow-4xl">
              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-lg font-serif italic text-white mb-4">{t.dedication.quote}</p>
              <p className="text-xs font-black uppercase tracking-widest text-violet-600">— {t.dedication.author}</p>
            </div>
            </AnimatedWidgetShell>

            {/* New Floating Element: Pediatrician Verified */}
            <AnimatedWidgetShell className="absolute -top-10 -left-10 z-50 hidden md:block" strength={0.9}>
            <motion.div 
              animate={{ y: [0, -30, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="glass p-8 rounded-[2.5rem] border-white/20 shadow-4xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="text-white w-7 h-7" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">{t.dedication.verifiedBy}</p>
                  <p className="text-lg font-bold text-slate-800">{t.dedication.pediatricians}</p>
                </div>
              </div>
            </motion.div>
            </AnimatedWidgetShell>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <LandingLibrarySection
        lang={lang}
        experience={landingExperience}
        badgeLabel={t.nav.stories}
        title={t.stories.title}
        safeLabel={t.stories.safeForKids}
        viewAllLabel={t.stories.viewAll}
        popularLabel={t.stories.popular}
        comingSoonLabel={t.stories.comingSoon}
        onLockedStoryClick={() => navigateToPage('sosDonation')}
      />

      <div className="max-w-7xl mx-auto h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Footer */}
      <footer className="px-6 pb-8 pt-16 md:pt-32 md:pb-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 gap-16 mb-24 md:grid-cols-5">
            <div className="col-span-2 flex flex-col items-center gap-4 text-center md:block md:text-left">
              <div className="shrink-0 md:mb-8">
                <BrandLogo className="h-20 w-auto max-w-[220px] md:h-24 md:max-w-[320px]" />
              </div>
              <p className="max-w-[220px] text-xl leading-snug text-slate-500 md:max-w-sm md:leading-relaxed">
                {t.footer.tagline}
              </p>
            </div>
            <div>
              <h5 className="text-xs font-black uppercase tracking-widest text-white mb-8">{t.footer.navigation}</h5>
              <ul className="space-y-4 text-slate-500 font-bold text-sm">
                <li><a href="#psychology" className="hover:text-violet-500 transition-colors">{t.nav.psychology}</a></li>
                <li><a href="#effects" className="hover:text-violet-500 transition-colors">{t.nav.effects}</a></li>
                <li>
                  <a
                    href={SOS_PAGE_PATH}
                    onClick={(event) => {
                      event.preventDefault();
                      navigateToPage('sosDonation');
                    }}
                    className="inline-flex items-center gap-2 text-blue-400 transition-colors hover:text-blue-300"
                  >
                    <img src={sosLogoSrc} alt="" className="h-5 w-5 object-contain" loading="lazy" />
                    SOS Dječije selo
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-xs font-black uppercase tracking-widest text-white mb-8">{t.footer.social}</h5>
              <ul className="space-y-4 text-slate-500 font-bold text-sm">
                <li>
                  <a href="https://www.instagram.com/p/DX9G7-QIWia/" target="_blank" rel="noreferrer" className="hover:text-violet-500 transition-colors">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="https://www.linkedin.com/showcase/snovi-fm/" target="_blank" rel="noreferrer" className="hover:text-violet-500 transition-colors">
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-span-2 justify-self-center text-center md:col-span-1 md:justify-self-auto md:text-left">
              <h5 className="text-xs font-black uppercase tracking-widest text-white mb-8">{t.footer.propertyOf}</h5>
              <a
                href="https://qla.dev"
                target="_blank"
                rel="noreferrer"
                className="group block text-white"
              >
                <div className="flex items-center justify-center gap-4 md:justify-between">
                  <img
                    src={qlaLogoSrc}
                    alt="qla.dev"
                    className="h-8 w-auto max-w-full object-contain"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                  />
                  <ArrowRight className="h-5 w-5 text-slate-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-violet-400" />
                </div>
              </a>
            </div>
          </div>
          
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-[0.3em]">
              © 2026 snovi.fm • {t.footer.rights}
            </p>
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-600">
              <a
                href={getPathForPage('privacy')}
                onClick={(event) => {
                  event.preventDefault();
                  navigateToPage('privacy');
                }}
                className="hover:text-white transition-colors"
              >
                {t.footer.privacy}
              </a>
              <a
                href={getPathForPage('terms')}
                onClick={(event) => {
                  event.preventDefault();
                  navigateToPage('terms');
                }}
                className="hover:text-white transition-colors"
              >
                {t.footer.terms}
              </a>
              <a
                href={getPathForPage('cookies')}
                onClick={(event) => {
                  event.preventDefault();
                  navigateToPage('cookies');
                }}
                className="hover:text-white transition-colors"
              >
                {t.footer.cookies}
              </a>
            </div>
          </div>
        </div>
      </footer>
      </>
      {storeChoiceModalOpen ? (
        <div
          className="fixed inset-0 z-[160] flex items-center justify-center p-4 md:p-6"
          onClick={closeStoreChoiceModal}
        >
          <div className="absolute inset-0 bg-black/80" />
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/10 bg-[#071728] p-6 text-white shadow-[0_30px_90px_-35px_rgba(0,0,0,0.9)] md:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeStoreChoiceModal}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/25 text-slate-300 transition hover:border-violet-500/40 hover:text-white"
              aria-label="Zatvori"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300 ring-1 ring-white/10">
              <Smartphone className="h-7 w-7" />
            </div>
            <h3 className="pr-10 font-serif text-3xl font-bold leading-none text-white md:text-4xl">Preuzmite aplikaciju</h3>
            <p className="mt-3 text-sm font-medium leading-6 text-slate-400">
              Odaberite platformu za snovi.fm.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => chooseStorePlatform('ios')}
                className="flex h-14 items-center justify-center gap-3 rounded-2xl bg-white px-4 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:bg-violet-500 hover:text-white"
              >
                <Apple className="h-5 w-5" />
                iOS
              </button>
              <button
                type="button"
                onClick={() => chooseStorePlatform('android')}
                className="flex h-14 items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:border-violet-500/40 hover:bg-violet-500"
              >
                <PlayCircle className="h-5 w-5" />
                Android
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
      {landingExperience.isWaitlistModalOpen ? (
        <div
          className="fixed inset-0 z-[160] flex items-center justify-center p-4 md:p-6"
          onClick={landingExperience.closeWaitlistModal}
        >
          <div className="absolute inset-0 bg-black/80" />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-4xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={landingExperience.closeWaitlistModal}
              className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/35 text-slate-300 transition hover:border-violet-500/40 hover:text-white"
              aria-label={lang === 'bs' ? 'Zatvori' : 'Close'}
            >
              <X className="h-5 w-5" />
            </button>
            <WaitlistPanel copy={t.waitlist} className="p-8 pt-12 md:p-16 md:pt-20" />
          </motion.div>
        </div>
      ) : null}
      <FixedMiniPlayerBar lang={lang} experience={landingExperience} />
    </div>
    </MotionConfig>
  );
}
