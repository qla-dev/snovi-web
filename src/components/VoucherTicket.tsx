import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Apple, CheckCircle2, Copy, PlayCircle, Smartphone } from 'lucide-react';
import {
  APP_STORE_URL,
  GOOGLE_PLAY_URL,
  detectMobilePlatform,
  openAppWithCode,
  promoCodeUrl,
  qrImageUrl,
} from '../appLinks';

const formatCode = (code: string) => code.match(/.{1,4}/g)?.join(' ') ?? code;

/**
 * The voucher: the code in groups of four with a copy button, "open in the app" on phones and a QR
 * code on computers (scanned with the phone camera it opens the app with the code filled in).
 */
export function VoucherTicket({ code, subtitle }: { code: string; subtitle?: string }) {
  const [copied, setCopied] = useState(false);
  const [appMissing, setAppMissing] = useState(false);
  const platform = detectMobilePlatform();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="relative">
      {/* Ticket */}
      <motion.div
        initial={{ opacity: 0, y: 18, rotate: -1.5 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[2rem] bg-white p-6 text-center text-slate-900 shadow-[0_30px_80px_-30px_rgba(124,58,237,0.65)] sm:p-8"
      >
        <span className="absolute -left-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-[#050505]" />
        <span className="absolute -right-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-[#050505]" />
        <motion.span
          className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-violet-200/60 to-transparent"
          animate={{ x: ['0%', '450%'] }}
          transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 2.4, ease: 'easeInOut' }}
        />

        <p className="relative text-[11px] font-black uppercase tracking-[0.3em] text-violet-600">Kod za aktivaciju</p>
        <p className="relative mt-3 font-mono text-3xl font-black tracking-[0.18em] text-indigo-950 sm:text-4xl">{formatCode(code)}</p>
        {subtitle ? <p className="relative mt-3 text-sm text-slate-500">{subtitle}</p> : null}

        <div className="relative my-6 border-t-2 border-dashed border-slate-200" />

        <div className="relative flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => void copy()}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700 transition hover:border-violet-400 hover:text-violet-700 sm:w-auto"
          >
            {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Kopirano' : 'Kopiraj kod'}
          </button>
          {platform ? (
            <button
              type="button"
              onClick={() => openAppWithCode(code, () => setAppMissing(true))}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-black uppercase tracking-wider text-white transition hover:bg-indigo-950 sm:w-auto"
            >
              <Smartphone className="h-4 w-4" />
              Aktiviraj u aplikaciji
            </button>
          ) : null}
        </div>
      </motion.div>

      {appMissing ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
          Izgleda da snovi.fm još nije instaliran. Preuzmite aplikaciju, pa ponovo dodirnite „Aktiviraj u aplikaciji".
          <a
            href={platform === 'android' ? GOOGLE_PLAY_URL : APP_STORE_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex h-12 items-center justify-center gap-2 rounded-xl bg-white font-black uppercase tracking-wider text-black"
          >
            {platform === 'android' ? <PlayCircle className="h-5 w-5" /> : <Apple className="h-5 w-5" />}
            Preuzmi snovi.fm
          </a>
        </motion.div>
      ) : null}

      {!platform ? (
        <div className="mt-5 flex items-center gap-5 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-4">
          <img src={qrImageUrl(promoCodeUrl(code))} alt="QR kod za aktivaciju" className="h-32 w-32 shrink-0 rounded-2xl bg-white p-1" loading="lazy" />
          <div>
            <p className="font-bold text-white">Skenirajte telefonom</p>
            <p className="mt-1 text-sm leading-6 text-slate-400">Kamera telefona otvara snovi.fm aplikaciju sa već upisanim kodom.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
