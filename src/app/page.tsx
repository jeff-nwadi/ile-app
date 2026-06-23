import Link from "next/link";
import { AdireStrip } from "@/components/adire-strip";
import { Hero } from "@/components/hero";
import { LandingEffects } from "@/components/landing-effects";
import { Navbar } from "@/components/navbar";

const menuItems = [
  {
    num: "01",
    name: "Ekpang in a Glass",
    desc: "Cocoyam and waterleaf, clarified into a warm broth, smoked periwinkle",
    price: "₦14,000",
  },
  {
    num: "02",
    name: "Suya Tartare",
    desc: "Hand-cut dry-aged beef, yaji spice ash, pickled ata rodo, quail yolk",
    price: "₦18,500",
  },
  {
    num: "03",
    name: "Ofada Risotto",
    desc: "Local rice slow-cooked in ayamase reduction, bell pepper oil, ata din-din crisp",
    price: "₦16,000",
  },
  {
    num: "04",
    name: "Catch of Lekki",
    desc: "Grilled croaker, banga sauce, charred plantain purée, palm-oil emulsion",
    price: "₦24,000",
  },
  {
    num: "05",
    name: "Asun-Lacquered Lamb",
    desc: "Slow lamb shoulder, pepper-soup jus, fonio crumble, scent leaf oil",
    price: "₦27,000",
  },
  {
    num: "06",
    name: "Zobo & Citrus",
    desc: "Hibiscus granita, blood orange, ginger crumble — a palate reset",
    price: "₦8,000",
  },
  {
    num: "07",
    name: "Chin Chin Mille-Feuille",
    desc: "Layered pastry, tigernut custard, caramelised plantain, nutmeg",
    price: "₦11,500",
  },
];

const galleryItems = [
  {
    caption: "The Open Kitchen",
    speed: "0.15",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
  },
  {
    caption: "Courtyard Table",
    speed: "0.25",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80",
  },
  {
    caption: "Evening Service",
    speed: "0.1",
    image:
      "https://images.unsplash.com/photo-1428515613728-6b4607e44363?auto=format&fit=crop&w=900&q=80",
  },
];

export default function Home() {
  return (
    <>
      <LandingEffects />
      <Navbar />
      <Hero />

      <AdireStrip variant="wave" />

      <section className="philosophy landing-section" id="philosophy">
        <div className="phi-grid">
          <div className="phi-text reveal">
            <p>
              &ldquo;We don&apos;t translate Nigerian food for anyone. We just
              plate it with more silence around it.&rdquo;
            </p>
            <p>
              Ilé began as a single table in a Lagos courtyard. Today it&apos;s
              twelve, but the rule hasn&apos;t changed: every dish traces back
              to a market stall, a grandmother&apos;s pot, or a roadside grill
              — rebuilt, not reinvented.
            </p>
            <p>
              Our kitchen works in seven-day cycles with growers in Epe,
              Badagry and the Niger Delta, so the tasting menu changes with
              what the land sends us, not the other way round.
            </p>
          </div>
          <div className="phi-img-wrap reveal">
            <div
              id="phiImg"
              className="phi-img"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1576402187878-974f70c890a5?auto=format&fit=crop&w=1200&q=80')",
              }}
            />
          </div>
        </div>
      </section>

      <AdireStrip variant="squares" />

      <section className="landing-section" id="menu">
        <div className="section-head reveal">
          <div>
            <span className="label">The Tasting Menu</span>
            <h2>
              Seven Courses,
              <br />
              One Table.
            </h2>
          </div>
          <p>
            Served nightly from 7pm. Wine pairing available on request,
            curated by our sommelier from West African and Cape vineyards.
          </p>
        </div>
        <div className="menu-list">
          {menuItems.map((item) => (
            <div key={item.num} className="menu-item reveal">
              <span className="mi-num">{item.num}</span>
              <span className="mi-name">
                {item.name}
                <span className="mi-desc">{item.desc}</span>
              </span>
              <span className="mi-price">{item.price}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="gallery landing-section" id="gallery">
        <div className="section-head reveal">
          <div>
            <span className="label">Inside Ilé</span>
            <h2>The Room.</h2>
          </div>
          <p>
            Twelve seats, one open kitchen, and a courtyard that still
            remembers it used to be someone&apos;s home.
          </p>
        </div>
        <div className="gal-row">
          {galleryItems.map((item) => (
            <div key={item.caption} className="gal-card reveal">
              <div
                className="gal-img"
                data-speed={item.speed}
                style={{ backgroundImage: `url('${item.image}')` }}
              />
              <div className="gal-cap">{item.caption}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta" id="reserve">
        <span className="label reveal" style={{ color: "var(--gold)" }}>
          Reservations
        </span>
        <h2 className="reveal">
          Twelve seats.
          <br />
          One <em>evening</em>.
        </h2>
        <Link href="/reserve" className="cta-btn reveal">
          Reserve a table →
        </Link>
        <p className="cta-sub reveal">
          Victoria Island, Lagos — Tue–Sun, 7pm till late
        </p>
      </section>

      <footer className="landing-footer">
        <div className="foot-col">
          <h4>Ilé</h4>
          <p>
            12 Akin Adesola Street
            <br />
            Victoria Island, Lagos
          </p>
        </div>
        <div className="foot-col">
          <h4>Hours</h4>
          <p>
            Tuesday — Sunday
            <br />
            7:00pm — Late
          </p>
        </div>
        <div className="foot-col">
          <h4>Contact</h4>
          <a href="tel:+2349012345678">+234 901 234 5678</a>
          <a href="mailto:reserve@ile-lagos.com">reserve@ile-lagos.com</a>
        </div>
        <div className="foot-bottom">
          <span>© 2026 Ilé Lagos</span>
          <span>Fine dining, made local</span>
        </div>
      </footer>
    </>
  );
}
