import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Apple, CheckCircle2, Download, Gift, LoaderCircle, Moon, PlayCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { API_BASE, APP_STORE_URL, GOOGLE_PLAY_URL, detectMobilePlatform } from '../appLinks';
import { VoucherTicket } from './VoucherTicket';

const brandLogoSrc = `${import.meta.env.BASE_URL}logo.png`;

type CodeStatus = 'checking' | 'valid' | 'used' | 'expired' | 'missing' | 'unknown';

const statusCopy: Record<Exclude<CodeStatus, 'checking'>, { tone: string; text: string }> = {
  valid: { tone: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200', text: 'Kod je spreman za aktivaciju.' },
  used: { tone: 'border-sky-400/30 bg-sky-400/10 text-sky-200', text: 'Ovaj kod je već aktiviran u aplikaciji. Promijenili ste telefon? Pišite nam na podrska@snovi.fm.' },
  expired: { tone: 'border-amber-300/30 bg-amber-300/10 text-amber-100', text: 'Ovaj kod je istekao. Pretplatu možete obnoviti na snovi.fm/pretplata.' },
  missing: { tone: 'border-red-400/30 bg-red-500/10 text-red-200', text: 'Ovaj kod ne postoji. Provjerite link iz emaila.' },
  unknown: { tone: 'border-white/10 bg-white/5 text-slate-300', text: 'Status koda trenutno ne možemo provjeriti, ali ga možete aktivirati u aplikaciji.' },
};

/** Code from /promo-code/{CODE}: 12 letters and digits, like the app accepts. */
export function promoCodeFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/promo-code\/([^/?#]+)/i);
  const code = match ? decodeURIComponent(match[1]).replace(/[^a-z0-9]/gi, '').toUpperCase() : '';
  return code.length === 12 ? code : null;
}

/**
 * Landing page of the voucher link (email, QR code, gift codes from the admin) when the app is not
 * installed: with the app, iOS and Android open the link straight in snovi.fm.
 */
export function PromoCodePage({ pathname, onHome }: { pathname: string; onHome: () => void }) {
  const code = useMemo(() => promoCodeFromPath(pathname), [pathname]);
  const [status, setStatus] = useState<CodeStatus>(code ? 'checking' : 'missing');
  const platform = detectMobilePlatform();
  const stars = useMemo(
    () => Array.from({ length: 36 }, (_, i) => ({ left: (i * 37) % 100, top: (i * 53) % 100, delay: (i % 7) * 0.6, size: i % 5 === 0 ? 3 : 2 })),
    [],
  );

  useEffect(() => {
    if (!code) {
      return;
    }

    fetch(`${API_BASE}/gift-codes/check`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
      .then((response) => {
        setStatus(
          response.ok ? 'valid'
            : response.status === 409 ? 'used'
              : response.status === 410 ? 'expired'
                : response.status === 404 ? 'missing'
                  : 'unknown',
        );
      })
      .catch(() => setStatus('unknown'));
  }, [code]);

  const stores = [
    { key: 'ios', href: APP_STORE_URL, icon: Apple, eyebrow: 'Preuzmi na', label: 'App Store' },
    { key: 'android', href: GOOGLE_PLAY_URL, icon: PlayCircle, eyebrow: 'Nabavi na', label: 'Google Play' },
  ].sort((a, b) => (a.key === platform ? -1 : b.key === platform ? 1 : 0));

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] font-sans text-white selection:bg-violet-500/30">
      {/* Night sky */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.28),transparent_60%)]" />
        {stars.map((star, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-white"
            style={{ left: `${star.left}%`, top: `${star.top}%`, width: star.size, height: star.size }}
            animate={{ opacity: [0.15, 0.9, 0.15] }}
            transition={{ duration: 3.5, repeat: Infinity, delay: star.delay }}
          />
        ))}
        {/* Crescent: a transparent circle that only casts its glowing shadow. */}
        <motion.div
          className="absolute right-6 top-28 h-28 w-28 rounded-full sm:right-[10%] sm:top-24 sm:h-40 sm:w-40"
          style={{ boxShadow: '24px 14px 0 0 #fde68a', filter: 'drop-shadow(0 0 22px rgba(253,230,138,0.45))' }}
          animate={{ y: [0, -12, 0], rotate: [0, 4, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-2xl flex-col px-4 pb-16 sm:px-6">
        <header className="flex h-20 items-center justify-between">
          <button type="button" onClick={onHome} aria-label="snovi.fm">
            <img src={brandLogoSrc} alt="snovi.fm" className="h-16 w-auto" />
          </button>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-violet-200">
            <Gift className="h-3.5 w-3.5" /> Vaučer
          </span>
        </header>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mt-6 text-center sm:mt-12">
          <p className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-violet-300">
            <Sparkles className="h-3.5 w-3.5" /> snovi.fm premium
          </p>
          <h1 className="mt-5 font-serif text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl">
            Vaš poklon za mirne večeri
          </h1>
          <p className="mx-auto mt-5 max-w-md text-lg leading-8 text-slate-300">
            Preuzmite aplikaciju snovi.fm i aktivirajte kod. Priče, uspavanke i ambijenti otključavaju se odmah.
          </p>
        </motion.div>

        <div className="mt-8">
          {status === 'checking' ? (
            <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
              <LoaderCircle className="h-4 w-4 animate-spin" /> Provjeravamo kod...
            </div>
          ) : (
            <p className={`flex items-start gap-2 rounded-2xl border p-4 text-sm font-semibold leading-6 ${statusCopy[status].tone}`}>
              {status === 'valid' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />}
              {statusCopy[status].text}
            </p>
          )}
        </div>

        {code ? (
          <div className="mt-6">
            <VoucherTicket code={code} subtitle="Upisuje se sam kad otvorite link na telefonu" />
          </div>
        ) : null}

        {/* Steps */}
        <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-violet-300">
            <Moon className="h-4 w-4" /> Tri koraka
          </h2>
          <ol className="mt-6 space-y-5">
            {[
              ['Preuzmite snovi.fm', 'Besplatno na App Storeu i Google Playu.'],
              ['Vratite se na ovaj link', 'Dodirnite „Aktiviraj u aplikaciji" ili ponovo otvorite link iz emaila. Kod se upisuje sam.'],
              ['Laku noć', 'Izaberite priču, ugasite svjetlo i neka dijete sluša zatvorenih očiju.'],
            ].map(([title, text], i) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-sm font-black">{i + 1}</span>
                <span>
                  <span className="block font-bold">{title}</span>
                  <span className="mt-1 block text-sm leading-6 text-slate-400">{text}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-xs leading-5 text-slate-500">Kod možete upisati i ručno u aplikaciji, na ekranu za pretplatu.</p>
        </section>

        {/* Stores */}
        <section className="mt-6 grid gap-3 sm:grid-cols-2">
          {stores.map((store, i) => (
            <motion.a
              key={store.key}
              href={store.href}
              target="_blank"
              rel="noreferrer"
              whileHover={{ y: -3 }}
              className={`flex h-16 items-center justify-center gap-3 rounded-2xl px-5 transition ${
                i === 0 ? 'bg-white text-black hover:bg-violet-500 hover:text-white' : 'border border-white/10 bg-white/[0.04] text-white hover:border-violet-500/40'
              }`}
            >
              <store.icon className="h-6 w-6" />
              <span className="text-left">
                <span className="block text-[10px] leading-none opacity-70">{store.eyebrow}</span>
                <span className="block text-sm font-black uppercase tracking-[0.12em]">{store.label}</span>
              </span>
              {i === 0 && platform ? <Download className="ml-auto h-4 w-4 opacity-60" /> : null}
            </motion.a>
          ))}
        </section>

        <p className="mt-auto pt-12 text-center text-xs text-slate-500">
          Pitanja? <a href="mailto:podrska@snovi.fm" className="text-violet-300">podrska@snovi.fm</a>
        </p>
      </div>
    </div>
  );
}
