import { useEffect, useRef } from 'react';

export function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    ) {
      element.classList.add('is-revealed');
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add('is-revealed');
          observer.unobserve(element);
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return ref;
}
