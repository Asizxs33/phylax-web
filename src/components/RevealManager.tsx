"use client";

import { useEffect } from "react";

/* Holds every .reveal animation paused until the element scrolls into view,
   so sections animate when the reader reaches them, not all at page load.
   Without JS the html.js-reveal class is never added and .reveal plays as before. */
export function RevealManager() {
  useEffect(() => {
    document.documentElement.classList.add("js-reveal");

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    );

    const scan = () =>
      document.querySelectorAll(".reveal:not(.in-view)").forEach((el) => io.observe(el));
    scan();

    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
