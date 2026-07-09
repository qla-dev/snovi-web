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
  const [shouldRender, setShouldRender] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return true;
  });
  const [preserveAspectRatio, setPreserveAspectRatio] = useState(getHeroPreserveAspectRatio);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const updatePreserveAspectRatio = () => {
      setShouldRender(true);
      setPreserveAspectRatio(mediaQuery.matches ? 'xMidYMin meet' : 'xMidYMid slice');
    };

    updatePreserveAspectRatio();
    mediaQuery.addEventListener('change', updatePreserveAspectRatio);

    return () => {
      mediaQuery.removeEventListener('change', updatePreserveAspectRatio);
    };
  }, []);

  useEffect(() => {
    if (!shouldRender || !containerRef.current) {
      return;
    }

    let active = true;
    let animation: { destroy: () => void } | null = null;
    const animationPath = new URL('hero-bg.json', document.baseURI).toString();
    window.__SNOVI_BOOT_MARK__?.('Lottie chunk requested');

    import('lottie-web').then((module) => {
      if (!active || !containerRef.current) {
        return;
      }

      animation = module.default.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: animationPath,
        rendererSettings: {
          preserveAspectRatio,
          progressiveLoad: true,
        },
      });
      window.__SNOVI_BOOT_MARK__?.('Lottie animation started');
    });

    return () => {
      active = false;
      animation?.destroy();
    };
  }, [preserveAspectRatio, shouldRender]);

  if (!shouldRender) {
    return null;
  }

  return <div ref={containerRef} aria-hidden="true" className={className} />;
}
