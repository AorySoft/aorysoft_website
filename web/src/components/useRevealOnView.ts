"use client";

import { useEffect, useRef } from "react";

const ANIMATION_CLASS = "atelier-fade-up";

/**
 * Restores Framer's `whileInView` behaviour for `.atelier-fade-up` elements
 * (FRONTEND_AUDIT F30 follow-up).
 *
 * The server HTML keeps the class, so items in the first viewport animate on
 * load with no flash. After hydration, items that start BELOW the viewport are
 * reset while still off-screen and animate once they scroll into view.
 * No JS, reduced motion, or no IntersectionObserver → content stays visible.
 */
export function useRevealOnView<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.classList.remove(ANIMATION_CLASS);
    el.dataset.reveal = "pending";

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        delete el.dataset.reveal;
        el.classList.add(ANIMATION_CLASS);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      // Never leave content hidden if the component unmounts mid-wait.
      delete el.dataset.reveal;
      el.classList.add(ANIMATION_CLASS);
    };
  }, []);

  return ref;
}
