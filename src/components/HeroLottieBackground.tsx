import { useEffect, useRef, useState } from 'react';

type HeroLottieBackgroundProps = {
  className?: string;
};

function getHeroPreserveAspectRatio() {
  if (typeof window === 'undefined') {
    return 'xMidYMid slice';
  }

  return window.matchMedia('(max-width: 767px)').matches ? 'xMidYMin meet' : 'xMidYMid slice';
}

export function HeroLottieBackground({ className = '' }: HeroLottieBackgroundProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [preserveAspectRatio, setPreserveAspectRatio] = useState(getHeroPreserveAspectRatio);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const updatePreserveAspectRatio = () => {
      setPreserveAspectRatio(mediaQuery.matches ? 'xMidYMin meet' : 'xMidYMid slice');
    };

    updatePreserveAspectRatio();
    mediaQuery.addEventListener('change', updatePreserveAspectRatio);

    return () => {
      mediaQuery.removeEventListener('change', updatePreserveAspectRatio);
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') {
      return;
    }

    const mobileQuery = window.matchMedia('(max-width: 767px)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reducedDataQuery = window.matchMedia('(prefers-reduced-data: reduce)');

    if (mobileQuery.matches || reducedMotionQuery.matches || reducedDataQuery.matches) {
      return;
    }

    let animation: { destroy: () => void } | null = null;
    let cancelled = false;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const loadAnimation = () => {
      void import('lottie-web').then(({ default: lottie }) => {
        if (cancelled || !containerRef.current) {
          return;
        }

        animation = lottie.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          path: new URL('hero-bg.json', document.baseURI).toString(),
          rendererSettings: {
            preserveAspectRatio,
            progressiveLoad: true,
          },
        });
      });
    };

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(loadAnimation, { timeout: 1200 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(idleId);
        animation?.destroy();
      };
    }

    timerId = globalThis.setTimeout(loadAnimation, 600);

    return () => {
      cancelled = true;
      if (timerId) {
        globalThis.clearTimeout(timerId);
      }
      animation?.destroy();
    };
  }, [preserveAspectRatio]);

  return <div ref={containerRef} aria-hidden="true" className={className} />;
}
