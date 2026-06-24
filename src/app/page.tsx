import Link from "next/link";
import { AdireStrip } from "@/components/adire-strip";
import { Hero } from "@/components/hero";
import { LandingEffects } from "@/components/landing-effects";
import { Navbar } from "@/components/navbar";
import { formatNaira } from "@/lib/utils";
import { db } from "@/db";
import { menuItem as menuItemTable, menuCategory } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

async function getMenuItems() {
  try {
    const items = await db
      .select()
      .from(menuItemTable)
      .where(eq(menuItemTable.available, true))
      .orderBy(asc(menuItemTable.sortOrder));
    console.log("Menu items from DB:", items.length, "items");
    return items;
  } catch (error) {
    console.error("Menu DB error:", error);
    return [];
  }
}

async function getGalleryItems() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || ""}/api/gallery`,
    );
    if (!res.ok) throw new Error("Failed to fetch gallery");
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error("Gallery fetch error:", error);
    return [];
  }
}

export default async function Home() {
  const menuItems = await getMenuItems();
  const galleryItems = await getGalleryItems();
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
              to a market stall, a grandmother&apos;s pot, or a roadside grill —
              rebuilt, not reinvented.
            </p>
            <p>
              Our kitchen works in seven-day cycles with growers in Epe, Badagry
              and the Niger Delta, so the tasting menu changes with what the
              land sends us, not the other way round.
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
            Served nightly from 7pm. Wine pairing available on request, curated
            by our sommelier from West African and Cape vineyards.
          </p>
        </div>
        <div className="menu-list">
          {menuItems && menuItems.length > 0 ? (
            menuItems.map((item, index) => (
              <div key={item.id} className="menu-item reveal">
                <span className="mi-num">{String(index + 1).padStart(2, '0')}</span>
                <span className="mi-name">
                  {item.name}
                  <span className="mi-desc">{item.description}</span>
                </span>
                <span className="mi-price">{formatNaira(item.priceKobo)}</span>
              </div>
            ))
          ) : (
            <p style={{ opacity: 0.6, textAlign: 'center', padding: '2rem' }}>
              No menu items available. Add items from the admin dashboard.
            </p>
          )}
        </div>
      </section>

      <section className="gallery landing-section" id="gallery">
        <div className="section-head reveal">
          <div>
            <span className="label">Inside Ilé</span>
            <h2>The Room.</h2>
          </div>
          <p>
            Twelve seats, one open kitchen, and a courtyard that still remembers
            it used to be someone&apos;s home.
          </p>
        </div>
        <div className="gal-row">
          {galleryItems.map((item) => (
            <div key={item.id} className="gal-card reveal">
              <div
                className="gal-img"
                data-speed={item.speed}
                style={{ backgroundImage: `url('${item.imageUrl}')` }}
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
