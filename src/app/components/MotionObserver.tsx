import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function MotionObserver() {
  const location = useLocation();

  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const triggers = new Set<ScrollTrigger>();
    const animatedElements = new Set<HTMLElement>();

    const reveal = (element: HTMLElement) => {
      if (animatedElements.has(element)) return;
      animatedElements.add(element);
      element.dataset.motionReady = 'true';

      if (reducedMotion) {
        element.classList.add('is-visible');
        gsap.set(element, { autoAlpha: 1, clearProps: 'transform' });
        return;
      }

      const isCard = element.classList.contains('scroll-card');
      gsap.set(element, { autoAlpha: 0, y: isCard ? 18 : 22 });
      const tween = gsap.to(element, {
        autoAlpha: 1,
        y: 0,
        duration: isCard ? 0.55 : 0.65,
        ease: 'power3.out',
        overwrite: 'auto',
        scrollTrigger: {
          trigger: element,
          start: isCard ? 'top 92%' : 'top 88%',
          once: true,
          onEnter: () => element.classList.add('is-visible'),
        },
      });

      if (tween.scrollTrigger) triggers.add(tween.scrollTrigger);
    };

    const observeElements = (root: ParentNode = document) => {
      const selector = '.reveal-section:not([data-motion-ready]), .scroll-card:not([data-motion-ready])';
      const elements: HTMLElement[] = [];

      if (root instanceof HTMLElement && root.matches(selector)) {
        elements.push(root);
      }

      root.querySelectorAll<HTMLElement>(selector).forEach((element) => elements.push(element));
      elements.forEach(reveal);
    };

    observeElements();
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            observeElements(node);
          }
        });
      });
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh, { once: true });
    const refreshFrame = window.requestAnimationFrame(refresh);

    return () => {
      mutationObserver.disconnect();
      window.removeEventListener('load', refresh);
      window.cancelAnimationFrame(refreshFrame);
      triggers.forEach((trigger) => trigger.kill());
      animatedElements.forEach((element) => gsap.killTweensOf(element));
    };
  }, [location.pathname]);

  return null;
}
