import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Apple,
  BookOpen,
  CheckCircle2,
  Gift,
  Heart,
  Instagram,
  Link2,
  LoaderCircle,
  Lock,
  Moon,
  Music,
  PlayCircle,
  QrCode,
  Share2,
  Smartphone,
  Sparkles,
  Waves,
} from 'lucide-react';
import {
  API_BASE,
  APP_STORE_URL,
  GOOGLE_PLAY_URL,
  detectMobilePlatform,
  openAppWithCode,
  promoCodeUrl,
  qrImageUrl,
} from '../appLinks';
import { NightSky } from './NightSky';
import { PinPad, PinResult } from './PinPad';
import { Promoter, PromoterAvatar } from './PromoterAvatar';

const brandLogoSrc = `${import.meta.env.BASE_URL}logo.png`;

type PromoterProfile = Promoter & {
  codes: { code: string; url: string; expires_at: string | null }[];
  codes_total: number;
  codes_used: number;
  codes_available: number;
  /** With a PIN set the codes come only from POST /promoters/{username}/unlock. */
  locked: boolean;
  pin_length: number | null;
};

type LoadState = { status: 'loading' } | { status: 'missing' } | { status: 'error' } | { status: 'ready'; promoter: PromoterProfile };

const pinStorageKey = (username: string) => `snovi-promoter-pin:${username}`;

const readStoredPin = (username: string) => {
  try {
    return window.sessionStorage.getItem(pinStorageKey(username));
  } catch {
    return null;
  }
};

const storePin = (username: string, pin: string | null) => {
  try {
    if (pin) {
      window.sessionStorage.setItem(pinStorageKey(username), pin);
    } else {
      window.sessionStorage.removeItem(pinStorageKey(username));
    }
  } catch {
    // Private mode: the PIN is asked again after a reload.
  }
};

const formatCode = (code: string) => code.match(/.{1,4}/g)?.join(' ') ?? code;

/** Username from /promoters/{username}. */
export function promoterUsernameFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/promoters\/([^/?#]+)/i);
  const username = match ? decodeURIComponent(match[1]).toLowerCase().replace(/[^a-z0-9._-]/g, '') : '';
  return username || null;
}

const perks = [
  { icon: BookOpen, title: 'Priče', text: 'Bajke i priče za laku noć koje čitaju topli, mirni glasovi.' },
  { icon: Music, title: 'Uspavanke', text: 'Nježna muzika koja polako spušta večernji ritam.' },
  { icon: Waves, title: 'Ambijenti', text: 'Kiša, šuma i valovi koji ostaju uz dijete dok ne zaspi.' },
];

/** One gift code: its deep link, open the app with it on a phone, or scan its QR code on a computer. */
const GiftCodeCard: React.FC<{ code: string; index: number; isMobile: boolean }> = ({ code, index, isMobile }) => {
  const [showQr, setShowQr] = useState(false);
  const [appMissing, setAppMissing] = useState(false);
  const platform = detectMobilePlatform();

  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: Math.min(index, 6) * 0.06 }}
      className="relative overflow-hidden rounded-[1.75rem] bg-white p-5 text-slate-900 shadow-[0_24px_60px_-30px_rgba(124,58,237,0.7)]"
    >
      <span className="absolute -left-3 top-[4.25rem] h-6 w-6 rounded-full bg-[#050505]" />
      <span className="absolute -right-3 top-[4.25rem] h-6 w-6 rounded-full bg-[#050505]" />

      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-violet-600">
          <Gift className="h-3.5 w-3.5" /> Poklon #{index + 1}
        </span>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700">Slobodan</span>
      </div>
      <p className="mt-3 font-mono text-2xl font-black tracking-[0.14em] text-indigo-950">{formatCode(code)}</p>

      <div className="my-4 border-t-2 border-dashed border-slate-200" />

      <div className="flex gap-2">
        <a
          href={promoCodeUrl(code)}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 transition hover:border-violet-400 hover:text-violet-700"
        >
          <Link2 className="h-4 w-4" /> Link
        </a>
        {isMobile ? (
          <button
            type="button"
            onClick={() => openAppWithCode(code, () => setAppMissing(true))}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-3 text-sm font-black uppercase tracking-wider text-white transition hover:bg-indigo-950"
          >
            <Smartphone className="h-4 w-4" /> Aktiviraj
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowQr((value) => !value)}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-3 text-sm font-black uppercase tracking-wider text-white transition hover:bg-indigo-950"
          >
            <QrCode className="h-4 w-4" /> {showQr ? 'Sakrij' : 'QR kod'}
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {showQr ? (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="mt-4 flex items-center gap-4">
              <img src={qrImageUrl(promoCodeUrl(code), 240)} alt={`QR kod ${code}`} className="h-28 w-28 shrink-0 rounded-xl border border-slate-100" />
              <p className="text-sm leading-6 text-slate-500">Skenirajte kamerom telefona: snovi.fm se otvara sa već upisanim kodom.</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {appMissing ? (
        <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-900">
          Prvo preuzmite snovi.fm, pa ponovo dodirnite „Aktiviraj".
          <a
            href={platform === 'android' ? GOOGLE_PLAY_URL : APP_STORE_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-2 flex h-10 items-center justify-center gap-2 rounded-lg bg-indigo-950 text-xs font-black uppercase tracking-wider text-white"
          >
            {platform === 'android' ? <PlayCircle className="h-4 w-4" /> : <Apple className="h-4 w-4" />}
            Preuzmi snovi.fm
          </a>
        </div>
      ) : null}
    </motion.li>
  );
};

/** snovi.fm/promoters/{username}: an influencer's page with the gift codes they hand out. */
export function PromoterPage({ pathname, onHome, onSubscribe }: { pathname: string; onHome: () => void; onSubscribe: () => void }) {
  const username = useMemo(() => promoterUsernameFromPath(pathname), [pathname]);
  const [state, setState] = useState<LoadState>(username ? { status: 'loading' } : { status: 'missing' });
  const [linkCopied, setLinkCopied] = useState(false);
  const platform = detectMobilePlatform();

  const requestUnlock = useCallback(
    async (pin: string): Promise<{ result: PinResult; promoter?: PromoterProfile }> => {
      try {
        const response = await fetch(`${API_BASE}/promoters/${encodeURIComponent(username ?? '')}/unlock`, {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin }),
        });

        if (response.ok) {
          const { data } = (await response.json()) as { data: PromoterProfile };
          return { result: 'ok', promoter: data };
        }

        return { result: response.status === 403 || response.status === 422 ? 'wrong' : response.status === 429 ? 'throttled' : 'error' };
      } catch {
        return { result: 'error' };
      }
    },
    [username],
  );

  const submitPin = useCallback(
    async (pin: string): Promise<PinResult> => {
      const { result, promoter } = await requestUnlock(pin);

      if (promoter) {
        storePin(username ?? '', pin);
        // Let the dots turn green before the page opens.
        window.setTimeout(() => setState({ status: 'ready', promoter }), 550);
      }

      return result;
    },
    [requestUnlock, username],
  );

  useEffect(() => {
    if (!username) {
      return;
    }

    fetch(`${API_BASE}/promoters/${encodeURIComponent(username)}`, { headers: { Accept: 'application/json' } })
      .then(async (response) => {
        if (!response.ok) {
          setState({ status: response.status === 404 ? 'missing' : 'error' });
          return;
        }

        const { data } = (await response.json()) as { data: PromoterProfile };
        const storedPin = data.locked ? readStoredPin(username) : null;

        // Already unlocked in this tab: open straight away instead of asking again.
        if (storedPin) {
          const { promoter } = await requestUnlock(storedPin);
          if (promoter) {
            setState({ status: 'ready', promoter });
            return;
          }
          storePin(username, null);
        }

        setState({ status: 'ready', promoter: data });
      })
      .catch(() => setState({ status: 'error' }));
  }, [requestUnlock, username]);

  const share = async (promoter: PromoterProfile) => {
    const shareData = { title: `${promoter.name} poklanja snovi.fm premium`, url: promoter.url };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // Closed the share sheet.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(promoter.url);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 1800);
    } catch {
      setLinkCopied(false);
    }
  };

  const stores = [
    { key: 'ios', href: APP_STORE_URL, icon: Apple, eyebrow: 'Preuzmi na', label: 'App Store' },
    { key: 'android', href: GOOGLE_PLAY_URL, icon: PlayCircle, eyebrow: 'Nabavi na', label: 'Google Play' },
  ].sort((a, b) => (a.key === platform ? -1 : b.key === platform ? 1 : 0));

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] font-sans text-white selection:bg-violet-500/30">
      <NightSky />

      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col px-4 pb-16 sm:px-6">
        <header className="flex h-20 items-center justify-between">
          <button type="button" onClick={onHome} aria-label="snovi.fm">
            <img src={brandLogoSrc} alt="snovi.fm" className="h-16 w-auto" />
          </button>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-violet-200">
            <Heart className="h-3.5 w-3.5" /> Preporuka
          </span>
        </header>

        {state.status === 'loading' ? (
          <div className="flex flex-1 items-center justify-center gap-2 text-sm text-slate-400">
            <LoaderCircle className="h-5 w-5 animate-spin" /> Učitavamo...
          </div>
        ) : null}

        {state.status === 'missing' || state.status === 'error' ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <Moon className="h-10 w-10 text-violet-300" />
            <h1 className="mt-5 font-serif text-4xl font-bold">
              {state.status === 'missing' ? 'Ova stranica spava' : 'Nešto je zapelo'}
            </h1>
            <p className="mt-3 max-w-sm text-slate-400">
              {state.status === 'missing'
                ? 'Promoter sa ovim imenom ne postoji. Provjerite link koji ste dobili.'
                : 'Stranicu trenutno ne možemo učitati. Pokušajte ponovo za minut.'}
            </p>
            <button type="button" onClick={onHome} className="mt-8 h-12 rounded-xl bg-white px-6 text-sm font-black uppercase tracking-wider text-black transition hover:bg-violet-500 hover:text-white">
              Upoznajte snovi.fm
            </button>
          </div>
        ) : null}

        {state.status === 'ready' && state.promoter.locked ? (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-1 flex-col items-center justify-center pb-6 pt-2 text-center"
          >
            <div className="relative">
              <motion.span
                className="absolute -inset-1.5 rounded-full bg-[conic-gradient(from_0deg,#8b5cf6,#fde68a,#6366f1,#ec4899,#8b5cf6)] opacity-80 blur-[2px]"
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              />
              <span className="absolute -inset-0.5 rounded-full bg-[#050505]" />
              <PromoterAvatar promoter={state.promoter} className="relative h-20 w-20 text-2xl" />
              <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-[#050505] bg-amber-200 text-indigo-950">
                <Lock className="h-3.5 w-3.5" />
              </span>
            </div>
            <p className="mt-5 text-[11px] font-black uppercase tracking-[0.3em] text-violet-300">Stranica od</p>
            <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">{state.promoter.name}</h1>
            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-400">
              {state.promoter.codes_available > 0
                ? `${state.promoter.codes_available} ${state.promoter.codes_available === 1 ? 'poklon čeka' : 'poklona čeka'} iza ovog PIN-a.`
                : 'Unesite PIN koji ste dobili.'}
            </p>
            <div className="mt-8">
              <PinPad length={state.promoter.pin_length ?? 4} onSubmit={submitPin} />
            </div>
          </motion.section>
        ) : null}

        {state.status === 'ready' && !state.promoter.locked ? (() => {
          const { promoter } = state;
          const available = promoter.codes_available;

          return (
            <>
              {/* Hero */}
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mt-6 flex flex-col items-center text-center sm:mt-10">
                <div className="relative">
                  <motion.span
                    className="absolute -inset-2 rounded-full bg-[conic-gradient(from_0deg,#8b5cf6,#fde68a,#6366f1,#ec4899,#8b5cf6)] opacity-80 blur-[2px]"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                  />
                  <span className="absolute -inset-0.5 rounded-full bg-[#050505]" />
                  <PromoterAvatar promoter={promoter} className="relative h-32 w-32 text-4xl sm:h-40 sm:w-40 sm:text-5xl" />
                  <motion.span
                    className="absolute -right-1 bottom-2 flex h-11 w-11 items-center justify-center rounded-full border-4 border-[#050505] bg-amber-200 text-indigo-950"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Moon className="h-5 w-5" />
                  </motion.span>
                </div>

                <p className="mt-8 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-violet-300">
                  <Sparkles className="h-3.5 w-3.5" /> preporučuje snovi.fm
                </p>
                <h1 className="mt-4 font-serif text-5xl font-bold leading-[0.95] tracking-tight sm:text-7xl">
                  {promoter.first_name}{' '}
                  <span className="bg-gradient-to-r from-violet-300 via-amber-100 to-violet-300 bg-clip-text text-transparent">{promoter.last_name}</span>
                </h1>
                {promoter.headline ? <p className="mx-auto mt-5 max-w-md text-lg leading-8 text-slate-300">{promoter.headline}</p> : null}

                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  {promoter.instagram ? (
                    <a
                      href={`https://instagram.com/${promoter.instagram}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 text-sm font-bold transition hover:border-pink-400/50 hover:text-pink-200"
                    >
                      <Instagram className="h-4 w-4" /> @{promoter.instagram}
                    </a>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void share(promoter)}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 text-sm font-bold transition hover:border-violet-400/50 hover:text-violet-200"
                  >
                    {linkCopied ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <Share2 className="h-4 w-4" />}
                    {linkCopied ? 'Link kopiran' : 'Podijeli'}
                  </button>
                </div>
              </motion.section>

              {/* Stats */}
              <section className="mt-10 grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { value: available, label: available === 1 ? 'poklon čeka' : 'poklona čeka' },
                  { value: promoter.codes_used, label: 'već poklonjeno' },
                  { value: '12', label: 'mjeseci premium' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-4 text-center">
                    <p className="font-serif text-3xl font-bold text-amber-100 sm:text-4xl">{stat.value}</p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 sm:text-[11px]">{stat.label}</p>
                  </div>
                ))}
              </section>

              {/* Message */}
              {promoter.bio ? (
                <motion.blockquote
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="relative mt-6 rounded-[2rem] border border-violet-400/20 bg-gradient-to-br from-violet-600/15 to-transparent p-6 sm:p-8"
                >
                  <span className="absolute -top-6 left-6 font-serif text-8xl leading-none text-violet-400/40">“</span>
                  <p className="relative whitespace-pre-line text-lg leading-8 text-slate-200">{promoter.bio}</p>
                  <footer className="mt-4 flex items-center gap-3">
                    <PromoterAvatar promoter={promoter} className="h-8 w-8 text-xs" />
                    <span className="text-sm font-bold text-violet-200">{promoter.first_name}</span>
                  </footer>
                </motion.blockquote>
              ) : null}

              {/* Codes */}
              <section className="mt-12">
                <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-violet-300">
                  <Gift className="h-4 w-4" /> Pokloni od {promoter.first_name}
                </h2>
                {available > 0 ? (
                  <>
                    <p className="mt-3 text-slate-400">
                      Svaki kod otključava 12 mjeseci snovi.fm premiuma za jednu porodicu. Ko prvi aktivira, njegov je.
                    </p>
                    <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                      {promoter.codes.map((item, index) => (
                        <GiftCodeCard key={item.code} code={item.code} index={index} isMobile={platform !== null} />
                      ))}
                    </ul>
                  </>
                ) : (
                  <div className="mt-5 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 text-center sm:p-8">
                    <Moon className="mx-auto h-8 w-8 text-amber-200" />
                    <p className="mt-4 font-serif text-2xl font-bold">Svi pokloni su već našli svoje porodice</p>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
                      {promoter.instagram ? `Pratite @${promoter.instagram} za nove kodove, ili` : 'Pratite nove kodove, ili'} otključajte snovi.fm premium odmah.
                    </p>
                    <button type="button" onClick={onSubscribe} className="mt-6 h-12 rounded-xl bg-white px-6 text-sm font-black uppercase tracking-wider text-black transition hover:bg-violet-500 hover:text-white">
                      Pogledaj pretplatu
                    </button>
                  </div>
                )}
              </section>

              {/* What you get */}
              <section className="mt-12 grid gap-3 sm:grid-cols-3">
                {perks.map((perk) => (
                  <div key={perk.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/20 text-violet-200">
                      <perk.icon className="h-5 w-5" />
                    </span>
                    <p className="mt-4 font-bold">{perk.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{perk.text}</p>
                  </div>
                ))}
              </section>

              {/* Steps */}
              <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
                <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-violet-300">
                  <Moon className="h-4 w-4" /> Tri koraka
                </h2>
                <ol className="mt-6 space-y-5">
                  {[
                    ['Preuzmite snovi.fm', 'Besplatno na App Storeu i Google Playu.'],
                    ['Aktivirajte poklon', 'Na telefonu dodirnite „Aktiviraj" kod jednog od kodova, ili ga upišite u aplikaciji na ekranu za pretplatu.'],
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
                  </motion.a>
                ))}
              </section>
            </>
          );
        })() : null}

        <p className="mt-auto pt-12 text-center text-xs text-slate-500">
          Pitanja? <a href="mailto:podrska@snovi.fm" className="text-violet-300">podrska@snovi.fm</a>
        </p>
      </div>
    </div>
  );
}
