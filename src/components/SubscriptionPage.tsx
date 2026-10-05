import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Apple,
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  Mail,
  Moon,
  PlayCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  claimVoucher,
  hasRevenueCatWebConfig,
  loadSubscriptionPlans,
  purchaseSubscriptionPlan,
  type SubscriptionPlan,
  type SubscriptionPlanId,
  type Voucher,
} from '../revenueCat';
import { VoucherTicket } from './VoucherTicket';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const brandLogoSrc = `${import.meta.env.BASE_URL}logo.png`;
const heroImageSrc = `${import.meta.env.BASE_URL}img/snovi1.jpg`;

const BENEFITS = [
  'Cijela biblioteka priča za laku noć',
  'Svi ambijenti i miks zvukova za san',
  'Nove priče i naratori redovno',
  'Bez reklama, sigurno za djecu',
  'Otkaži bilo kada',
];

type LoadState = 'loading' | 'ready' | 'unavailable';

export function SubscriptionPage({
  onBack,
  termsUrl,
  appStoreUrl,
  googlePlayUrl,
}: {
  onBack: () => void;
  termsUrl: string;
  appStoreUrl: string;
  googlePlayUrl: string;
}) {
  const [loadState, setLoadState] = useState<LoadState>(hasRevenueCatWebConfig() ? 'loading' : 'unavailable');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlanId>('yearly');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  // After payment: claiming the voucher, showing it, or the claim failed.
  const [purchaseState, setPurchaseState] = useState<'none' | 'claiming' | 'voucher' | 'claimFailed'>('none');
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const emailValid = EMAIL_PATTERN.test(email.trim());

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    if (!hasRevenueCatWebConfig()) {
      return;
    }

    let cancelled = false;

    loadSubscriptionPlans()
      .then((nextPlans) => {
        if (cancelled) {
          return;
        }

        setPlans(nextPlans);
        setSelectedPlanId(nextPlans[0]?.id ?? 'yearly');
        setLoadState(nextPlans.length ? 'ready' : 'unavailable');
      })
      .catch((error) => {
        console.warn('[RevenueCat] getOfferings failed', error);
        if (!cancelled) {
          setLoadState('unavailable');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? plans[0];

  const claim = async () => {
    setPurchaseState('claiming');
    try {
      setVoucher(await claimVoucher(email.trim()));
      setPurchaseState('voucher');
    } catch (error) {
      console.warn('[snovi] voucher claim failed', error);
      setPurchaseState('claimFailed');
    }
  };

  const handlePurchase = async () => {
    if (!selectedPlan || isPurchasing) {
      return;
    }
    if (!emailValid) {
      setEmailTouched(true);
      document.getElementById('voucher-email')?.focus();
      return;
    }

    setIsPurchasing(true);
    setErrorMessage(null);

    try {
      const outcome = await purchaseSubscriptionPlan(selectedPlan, email.trim(), termsUrl);

      if (outcome.status === 'success') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        await claim();
      }
    } catch (error) {
      console.warn('[RevenueCat] purchase failed', error);
      setErrorMessage('Plaćanje nije uspjelo. Provjerite podatke kartice i pokušajte ponovo.');
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pb-40 font-sans text-white selection:bg-violet-500/30 lg:pb-16">
      <nav className="sticky top-0 z-[100] border-b border-white/5 bg-[#050505]/90 px-4 backdrop-blur md:px-6">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3">
          <button className="flex min-w-0 items-center" type="button" onClick={onBack} aria-label="snovi.fm">
            <img src={brandLogoSrc} alt="snovi.fm" className="h-16 w-auto max-w-[190px] sm:h-20 sm:max-w-[320px]" loading="eager" />
          </button>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 px-5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-300 transition hover:border-violet-500/50 hover:text-white"
          >
            Nazad
          </button>
        </div>
      </nav>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:px-6 lg:min-h-[calc(100vh-5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.8fr)] lg:gap-10 lg:py-10">
        <section className="relative isolate overflow-hidden rounded-[2.5rem] border border-white/10 p-8 md:p-12">
          <img src={heroImageSrc} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" loading="eager" decoding="async" />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(5,5,5,0.55),rgba(5,5,5,0.92))]" />

          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-[11px] font-black uppercase tracking-[0.3em] text-violet-300">
            <Sparkles className="h-3.5 w-3.5" />
            snovi.fm premium
          </div>
          <h1 className="mt-8 max-w-2xl font-serif text-5xl font-bold leading-[0.92] tracking-tight md:text-7xl">
            Pretplati se i otključaj svaku večernju priču.
          </h1>
          <p className="mt-6 max-w-xl text-lg font-medium leading-8 text-slate-300">
            Mirniji odlazak na spavanje uz priče, naratore i ambijente koje djeca vole. Jedna pretplata za cijelu porodicu.
          </p>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                <span className="font-semibold leading-snug text-slate-100">{benefit}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="order-first flex flex-col lg:order-none">
          {purchaseState !== 'none' ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[2.5rem] border border-emerald-400/30 bg-emerald-400/[0.06] p-6 md:p-10 lg:flex-1"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="h-7 w-7 text-white" />
              </div>
              <h2 className="mt-6 font-serif text-4xl font-bold leading-none">Hvala, pretplata je aktivna!</h2>

              {purchaseState === 'claiming' ? (
                <div className="mt-8 flex items-center gap-3 text-slate-300">
                  <LoaderCircle className="h-5 w-5 animate-spin text-violet-300" />
                  Pripremamo vaš kod za aktivaciju...
                </div>
              ) : null}

              {purchaseState === 'voucher' && voucher ? (
                <>
                  <p className="mt-4 leading-7 text-slate-300">
                    {voucher.emailSent ? <>Kod smo poslali i na <b className="text-white">{voucher.email}</b>. </> : null}
                    Aktivirajte ga u aplikaciji snovi.fm i pretplata je odmah tamo.
                  </p>
                  <div className="mt-8">
                    <VoucherTicket code={voucher.code} subtitle={voucher.planLabel} />
                  </div>
                </>
              ) : null}

              {purchaseState === 'claimFailed' ? (
                <div className="mt-6 space-y-4">
                  <p className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
                    Plaćanje je prošlo, ali kod za aktivaciju još nije spreman. Pokušajte ponovo za nekoliko sekundi.
                    Ako ne uspije, pišite nam na <a href="mailto:podrska@snovi.fm" className="font-bold underline">podrska@snovi.fm</a> sa emailom {email.trim()}.
                  </p>
                  <button type="button" onClick={() => void claim()} className="flex h-14 w-full items-center justify-center rounded-2xl bg-violet-600 font-black uppercase tracking-widest text-white transition hover:bg-white hover:text-black">
                    Pokušaj ponovo
                  </button>
                </div>
              ) : null}

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <a href={appStoreUrl} target="_blank" rel="noreferrer" className="flex h-14 items-center justify-center gap-3 rounded-2xl bg-white text-sm font-black uppercase tracking-[0.12em] text-black transition hover:bg-violet-500 hover:text-white">
                  <Apple className="h-5 w-5" /> iOS
                </a>
                <a href={googlePlayUrl} target="_blank" rel="noreferrer" className="flex h-14 items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-black uppercase tracking-[0.12em] text-white transition hover:border-violet-500/40 hover:bg-violet-500">
                  <PlayCircle className="h-5 w-5" /> Android
                </a>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col rounded-[2.5rem] border border-white/10 bg-[#071728] p-6 shadow-[0_30px_90px_-35px_rgba(0,0,0,0.9)] md:p-10 lg:flex-1">
              <div className="flex items-center gap-3">
                <Moon className="h-6 w-6 text-violet-300" />
                <h2 className="font-serif text-3xl font-bold leading-none md:text-4xl">Odaberite plan</h2>
              </div>

              {loadState === 'loading' ? (
                <div className="flex h-56 items-center justify-center">
                  <LoaderCircle className="h-10 w-10 animate-spin text-violet-400" />
                </div>
              ) : null}

              {loadState === 'unavailable' ? (
                <div className="mt-8 space-y-5">
                  <p className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm font-semibold leading-6 text-amber-100">
                    Web plaćanje trenutno nije dostupno. Pretplatu možete aktivirati direktno u aplikaciji.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <a href={appStoreUrl} target="_blank" rel="noreferrer" className="flex h-14 items-center justify-center gap-3 rounded-2xl bg-white text-sm font-black uppercase tracking-[0.12em] text-black transition hover:bg-violet-500 hover:text-white">
                      <Apple className="h-5 w-5" /> iOS
                    </a>
                    <a href={googlePlayUrl} target="_blank" rel="noreferrer" className="flex h-14 items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-black uppercase tracking-[0.12em] text-white transition hover:border-violet-500/40 hover:bg-violet-500">
                      <PlayCircle className="h-5 w-5" /> Android
                    </a>
                  </div>
                </div>
              ) : null}

              {loadState === 'ready' ? (
                <>
                  <div className="mt-8 space-y-4" role="radiogroup" aria-label="Plan pretplate">
                    {plans.map((plan) => {
                      const isSelected = plan.id === selectedPlan?.id;

                      return (
                        <button
                          key={plan.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setSelectedPlanId(plan.id)}
                          className={`relative flex w-full items-center justify-between gap-4 rounded-2xl border p-5 text-left transition ${
                            isSelected
                              ? 'border-violet-400 bg-violet-500/15 ring-2 ring-violet-400/40'
                              : 'border-white/10 bg-white/[0.03] hover:border-white/25'
                          }`}
                        >
                          {plan.id === 'yearly' ? (
                            <span className="absolute -top-3 right-5 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white">
                              Najisplativije
                            </span>
                          ) : null}
                          <span className="flex items-center gap-4">
                            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${isSelected ? 'border-violet-300' : 'border-white/30'}`}>
                              {isSelected ? <span className="h-3 w-3 rounded-full bg-violet-300" /> : null}
                            </span>
                            <span>
                              <span className="block font-bold">{plan.title}</span>
                              {plan.trialLabel ? <span className="mt-1 block text-sm text-emerald-300">{plan.trialLabel}</span> : null}
                              {plan.pricePerMonth ? <span className="mt-1 block text-sm text-slate-400">{plan.pricePerMonth} mjesečno</span> : null}
                            </span>
                          </span>
                          <span className="shrink-0 text-xl font-black">{plan.formattedPrice}</span>
                        </button>
                      );
                    })}
                  </div>

                  <label className="mt-6 block" htmlFor="voucher-email">
                    <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-200">
                      <Mail className="h-4 w-4 text-violet-300" />
                      Email za vaučer <span className="text-violet-300">*</span>
                    </span>
                    <input
                      id="voucher-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      onBlur={() => setEmailTouched(true)}
                      placeholder="vas@email.com"
                      aria-invalid={emailTouched && !emailValid}
                      className={`h-14 w-full rounded-2xl border bg-white/[0.04] px-4 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/20 ${
                        emailTouched && !emailValid ? 'border-red-400/70' : 'border-white/10'
                      }`}
                    />
                    <span className="mt-2 block text-xs leading-5 text-slate-400">
                      {emailTouched && !emailValid ? (
                        <span className="font-semibold text-red-300">Unesite ispravnu email adresu.</span>
                      ) : (
                        'Na ovaj email šaljemo vaučer sa kodom i linkom za aktivaciju aplikacije.'
                      )}
                    </span>
                  </label>

                  {errorMessage ? (
                    <p className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">{errorMessage}</p>
                  ) : null}

                  <div className="fixed inset-x-0 bottom-0 z-[120] border-t border-white/10 bg-[#050505]/95 px-4 py-4 backdrop-blur lg:static lg:mt-auto lg:pt-8 lg:border-0 lg:bg-transparent lg:p-0">
                    <button
                      type="button"
                      onClick={() => void handlePurchase()}
                      disabled={!selectedPlan || isPurchasing}
                      className="group mx-auto flex h-16 w-full max-w-xl items-center justify-center gap-3 rounded-2xl bg-violet-600 font-black uppercase tracking-widest text-white shadow-2xl shadow-violet-500/20 transition hover:bg-white hover:text-black disabled:cursor-wait disabled:opacity-70"
                    >
                      {isPurchasing ? <LoaderCircle className="h-5 w-5 animate-spin" /> : null}
                      Pretplati se {selectedPlan ? `· ${selectedPlan.formattedPrice}` : ''}
                      {!isPurchasing ? <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /> : null}
                    </button>
                  </div>

                  <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-slate-500">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <span>
                      Sigurno plaćanje karticom preko RevenueCat / Stripe. Pretplata se automatski obnavlja dok je ne otkažete.
                      Kupovinom prihvatate{' '}
                      <a href={termsUrl} className="underline underline-offset-2 hover:text-white">uslove korištenja</a>.
                    </span>
                  </p>
                </>
              ) : null}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
