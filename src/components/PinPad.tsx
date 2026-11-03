import React, { useCallback, useEffect, useState } from 'react';
import { motion, useAnimationControls } from 'motion/react';
import { Delete, LoaderCircle } from 'lucide-react';

export type PinResult = 'ok' | 'wrong' | 'throttled' | 'error';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'] as const;

const messages: Record<Exclude<PinResult, 'ok'>, string> = {
  wrong: 'Pogrešan PIN. Pokušajte ponovo.',
  throttled: 'Previše pokušaja. Sačekajte minut pa pokušajte ponovo.',
  error: 'PIN trenutno ne možemo provjeriti. Pokušajte ponovo.',
};

/**
 * On-screen keypad: no text field, so phones neither open the keyboard nor zoom the page. Digits
 * also come from a physical keyboard; the PIN is sent as soon as it has `length` digits.
 */
export function PinPad({ length, onSubmit }: { length: number; onSubmit: (pin: string) => Promise<PinResult> }) {
  const [pin, setPin] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<PinResult | null>(null);
  const dots = useAnimationControls();

  const press = useCallback(
    (key: string) => {
      if (checking || result === 'ok') {
        return;
      }

      setResult(null);
      setPin((current) => (key === 'back' ? current.slice(0, -1) : current.length < length ? current + key : current));
    },
    [checking, length, result],
  );

  useEffect(() => {
    if (pin.length !== length) {
      return;
    }

    setChecking(true);
    void onSubmit(pin).then((outcome) => {
      setChecking(false);
      setResult(outcome);

      if (outcome !== 'ok') {
        void dots.start({ x: [0, -14, 14, -10, 10, -4, 0], transition: { duration: 0.45 } });
        window.navigator.vibrate?.(180);
        setPin('');
      }
    });
  }, [dots, length, onSubmit, pin]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (/^[0-9]$/.test(event.key)) {
        press(event.key);
      } else if (event.key === 'Backspace') {
        press('back');
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [press]);

  const tone = result === 'ok' ? 'ok' : result && result !== 'ok' ? 'bad' : 'idle';

  return (
    <div className="flex select-none flex-col items-center [touch-action:manipulation]">
      <motion.div animate={dots} className="flex h-8 items-center gap-4" aria-live="polite" aria-label={`Uneseno ${pin.length} od ${length} cifara`}>
        {Array.from({ length }, (_, i) => {
          const filled = i < pin.length || tone === 'ok';
          return (
            <motion.span
              key={i}
              animate={{ scale: filled ? 1.15 : 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
              className={`h-4 w-4 rounded-full border-2 transition-colors duration-200 ${
                tone === 'ok'
                  ? 'border-emerald-300 bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.8)]'
                  : tone === 'bad'
                    ? 'border-rose-400 bg-transparent'
                    : filled
                      ? 'border-violet-300 bg-violet-300 shadow-[0_0_16px_rgba(196,181,253,0.8)]'
                      : 'border-white/30 bg-transparent'
              }`}
            />
          );
        })}
      </motion.div>

      <p className={`mt-4 h-5 text-sm font-semibold ${tone === 'bad' ? 'text-rose-300' : 'text-emerald-300'}`}>
        {checking ? (
          <span className="inline-flex items-center gap-2 text-slate-400">
            <LoaderCircle className="h-4 w-4 animate-spin" /> Provjeravamo...
          </span>
        ) : result && result !== 'ok' ? (
          messages[result]
        ) : result === 'ok' ? (
          'Otključano'
        ) : null}
      </p>

      <div className="mt-6 grid grid-cols-3 gap-4 sm:gap-5">
        {KEYS.map((key, i) =>
          key === '' ? (
            <span key={i} />
          ) : (
            <motion.button
              key={i}
              type="button"
              onClick={() => press(key)}
              whileTap={{ scale: 0.88 }}
              disabled={checking}
              aria-label={key === 'back' ? 'Obriši' : key}
              className={`flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full text-2xl font-semibold transition-colors sm:h-20 sm:w-20 ${
                key === 'back'
                  ? 'text-slate-300 hover:text-white'
                  : 'border border-white/10 bg-white/[0.06] backdrop-blur hover:border-violet-400/50 hover:bg-violet-500/20 active:bg-violet-500/40'
              }`}
            >
              {key === 'back' ? <Delete className="h-7 w-7" /> : key}
            </motion.button>
          ),
        )}
      </div>
    </div>
  );
}
