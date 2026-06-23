type AdireVariant = "wave" | "squares";

export function AdireStrip({ variant }: { variant: AdireVariant }) {
  if (variant === "wave") {
    return (
      <div className="adire-strip reveal" id="adire1">
        <svg viewBox="0 0 1400 140" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0,70 C100,20 200,120 300,70 C400,20 500,120 600,70 C700,20 800,120 900,70 C1000,20 1100,120 1200,70 C1300,20 1400,120 1400,70"
            pathLength={1}
            style={{ strokeDashoffset: 1 }}
          />
          <circle className="fill-dot" cx="300" cy="70" r="5" />
          <circle className="fill-dot" cx="700" cy="70" r="5" />
          <circle className="fill-dot" cx="1100" cy="70" r="5" />
        </svg>
      </div>
    );
  }

  return (
    <div className="adire-strip reveal" id="adire2">
      <svg viewBox="0 0 1400 140" xmlns="http://www.w3.org/2000/svg">
        <rect
          x="40"
          y="40"
          width="60"
          height="60"
          pathLength={1}
          style={{ strokeDashoffset: 1 }}
        />
        <rect
          x="660"
          y="40"
          width="60"
          height="60"
          pathLength={1}
          style={{ strokeDashoffset: 1 }}
        />
        <rect
          x="1280"
          y="40"
          width="60"
          height="60"
          pathLength={1}
          style={{ strokeDashoffset: 1 }}
        />
        <path
          d="M0,70 L1400,70"
          pathLength={1}
          style={{ strokeDashoffset: 1 }}
        />
      </svg>
    </div>
  );
}
