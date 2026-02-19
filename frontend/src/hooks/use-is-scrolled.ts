// src/hooks/use-is-scrolled.ts
import { useEffect, useState } from 'react';

export function useIsScrolled(threshold = 0): boolean {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Check immediately on mount in case the page is already scrolled
    const checkScroll = () => {
      if (window.scrollY > threshold) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    checkScroll();

    window.addEventListener('scroll', checkScroll, { passive: true });
    return () => window.removeEventListener('scroll', checkScroll);
  }, [threshold]);

  return isScrolled;
}
