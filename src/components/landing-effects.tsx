"use client";

import { useEffect } from "react";

export function LandingEffects() {
  useEffect(() => {
    const nav = document.getElementById("landing-nav");
    const heroImg = document.getElementById("heroImg");
    const phiImg = document.getElementById("phiImg");
    const galImgs = document.querySelectorAll<HTMLElement>(".gal-img");

    function onScroll() {
      const sc = window.scrollY;

      if (nav) {
        nav.classList.toggle("scrolled", sc > 60);
      }

      if (heroImg) {
        heroImg.style.transform = `translateY(${sc * 0.25}px)`;
      }

      if (phiImg?.parentElement) {
        const phiRect = phiImg.parentElement.getBoundingClientRect();
        const phiOffset = (phiRect.top - window.innerHeight / 2) * 0.15;
        phiImg.style.transform = `translateY(${phiOffset}px)`;
      }

      galImgs.forEach((img) => {
        const speed = parseFloat(img.dataset.speed || "0.15");
        const rect = img.parentElement?.getBoundingClientRect();
        if (!rect) return;
        const offset = (rect.top - window.innerHeight / 2) * speed;
        img.style.transform = `translateY(${offset}px)`;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const revealEls = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          }
        });
      },
      { threshold: 0.15 }
    );

    revealEls.forEach((el) => io.observe(el));

    document.querySelectorAll(".menu-item.reveal").forEach((el, i) => {
      (el as HTMLElement).style.transitionDelay = `${i * 60}ms`;
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return null;
}
