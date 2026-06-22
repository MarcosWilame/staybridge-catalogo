import { useEffect } from 'react';

export function MotionObserver() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );

    const observeSections = (root: ParentNode = document) => {
      root.querySelectorAll<HTMLElement>('.reveal-section:not([data-reveal-observed])').forEach((element) => {
        element.dataset.revealObserved = 'true';
        observer.observe(element);
      });
    };

    observeSections();
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (node.matches('.reveal-section') && !node.dataset.revealObserved) {
              node.dataset.revealObserved = 'true';
              observer.observe(node);
            }
            observeSections(node);
          }
        });
      });
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
