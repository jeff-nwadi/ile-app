"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Navbar } from "@/components/navbar";

gsap.registerPlugin(ScrollTrigger);

const images = [
  "/images/landing/gallery-1.jpg",
  "/images/landing/gallery-2.jpg",
  "/images/landing/gallery-3.jpg",
  "/images/landing/gallery-4.jpg",
  "/images/landing/gallery-5.jpg",
  "/images/landing/gallery-6.jpg",
];

export default function GalleryPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const mm = gsap.matchMedia();
    
    mm.add("(min-width: 768px)", () => {
      const ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>('.parallax-item').forEach((item, i) => {
          gsap.to(item, {
            y: i % 2 === 0 ? -60 : 60,
            ease: "none",
            scrollTrigger: {
              trigger: item,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            }
          });
        });
        
        gsap.utils.toArray<HTMLElement>('.parallax-inner').forEach(img => {
          gsap.to(img, {
            yPercent: 20,
            ease: "none",
            scrollTrigger: {
              trigger: img.parentElement,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            }
          });
        });
      }, containerRef);
      return () => ctx.revert();
    });
    
    return () => mm.revert();
  }, []);

  return (
    <div className="bg-ivory min-h-screen text-indigo-deep">
      <Navbar />
      
      <main ref={containerRef} className="pt-40 pb-40 px-[6vw]">
        <div className="text-center mb-32 max-w-3xl mx-auto">
          <h1 className="font-serif text-5xl md:text-7xl mb-6">Visual Notes.</h1>
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-gold leading-relaxed">
            The architecture of a meal.
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto">
          
          {/* Section 1 */}
          <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
            <div className="order-2 md:order-1 space-y-6 md:pr-10">
              <h2 className="font-serif text-3xl">Rooted in Earth</h2>
              <p className="font-light leading-relaxed opacity-80 text-sm">
                Before a dish reaches the pass, it begins in the dirt. We spend our mornings speaking to farmers in Epe, understanding the subtle shifts in the soil, the sweetness of a late harvest tomato, and the sharp bite of indigenous peppers.
              </p>
              <p className="font-light leading-relaxed opacity-80 text-sm">
                There is a brutal honesty to Nigerian produce. Our kitchen doesn't seek to tame it, but rather to construct an environment where these ingredients can speak for themselves in absolute clarity.
              </p>
            </div>
            <div className="order-1 md:order-2 parallax-item overflow-hidden relative rounded-sm h-[500px]">
              <div 
                className="parallax-inner absolute inset-0 -top-[20%] -bottom-[20%] bg-cover bg-center"
                style={{ backgroundImage: `url('${images[0]}')` }}
              />
            </div>
          </div>

          {/* Section 2 - Images Only Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 mb-32">
            <div className="parallax-item overflow-hidden relative rounded-sm h-[600px]">
              <div 
                className="parallax-inner absolute inset-0 -top-[20%] -bottom-[20%] bg-cover bg-center"
                style={{ backgroundImage: `url('${images[1]}')` }}
              />
            </div>
            <div className="parallax-item overflow-hidden relative rounded-sm h-[450px] md:mt-32">
              <div 
                className="parallax-inner absolute inset-0 -top-[20%] -bottom-[20%] bg-cover bg-center"
                style={{ backgroundImage: `url('${images[2]}')` }}
              />
            </div>
          </div>

          {/* Section 3 */}
          <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
            <div className="parallax-item overflow-hidden relative rounded-sm h-[500px]">
              <div 
                className="parallax-inner absolute inset-0 -top-[20%] -bottom-[20%] bg-cover bg-[center_60%]"
                style={{ backgroundImage: `url('${images[3]}')` }}
              />
            </div>
            <div className="space-y-6 md:pl-10">
              <h2 className="font-serif text-3xl">The Dance of Fire</h2>
              <p className="font-light leading-relaxed opacity-80 text-sm">
                The kitchen is a choreography of heat and timing. Smoke is not just a byproduct; it is an ingredient. We harness the raw energy of open wood fires, letting the charcoal kiss the edges of our proteins.
              </p>
              <p className="font-light leading-relaxed opacity-80 text-sm">
                Every evening at Ilé is a performance. Twelve guests, seated around a single table, watching the quiet chaos unfold just feet away. The barrier between chef and diner dissolves.
              </p>
            </div>
          </div>

          {/* Section 4 - Final Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
            <div className="parallax-item overflow-hidden relative rounded-sm h-[400px] md:mt-20">
              <div 
                className="parallax-inner absolute inset-0 -top-[20%] -bottom-[20%] bg-cover bg-center"
                style={{ backgroundImage: `url('${images[4]}')` }}
              />
            </div>
            <div className="parallax-item overflow-hidden relative rounded-sm h-[550px]">
              <div 
                className="parallax-inner absolute inset-0 -top-[20%] -bottom-[20%] bg-cover bg-center"
                style={{ backgroundImage: `url('${images[5]}')` }}
              />
            </div>
          </div>
          
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-indigo-deep border-t border-ivory/10 px-[6vw] py-16 flex flex-wrap justify-between gap-10 text-ivory">
        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold mb-3">Ilé</h4>
          <p className="text-[11px] font-mono uppercase tracking-widest opacity-60 leading-relaxed">
            12 Akin Adesola Street<br />Victoria Island, Lagos
          </p>
        </div>
        <div className="font-mono text-[9px] uppercase tracking-widest opacity-40 self-end">
          © 2026 Ilé Lagos
        </div>
      </footer>
    </div>
  );
}
