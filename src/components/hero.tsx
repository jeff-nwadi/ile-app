const HERO_IMAGE =
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=2000&q=80";

export function Hero() {
  return (
    <section className="hero">
      <div
        id="heroImg"
        className="hero-img"
        style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
      />
      <div className="hero-veil" />
      <div className="hero-content">
        <h1 className="hero-title">
          Ilé
          <br />
          <em>Lagos</em>
        </h1>
        <div className="hero-sub">
          <span className="label" style={{ color: "var(--gold)" }}>
            Fine Dining — Victoria Island
          </span>
          <p>
            A tasting house built around the produce of the Niger Delta and the
            grammar of West African flavor, plated with restraint.
          </p>
        </div>
      </div>
      <div className="hero-scroll">
        <div className="scroll-line" />
        <span className="label">Scroll</span>
      </div>
    </section>
  );
}
