import { useEffect, useRef, useState } from 'react';
import lottie from 'lottie-web';

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
    if (!containerRef.current) {
      return;
    }

    const animationPath = new URL('hero-bg.json', document.baseURI).toString();

    const animation = lottie.loadAnimation({
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

    return () => {
      animation.destroy();
    };
  }, [preserveAspectRatio]);

  return <div ref={containerRef} aria-hidden="true" className={className} />;
}
