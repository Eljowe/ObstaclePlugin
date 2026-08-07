const PEDAL_ACCENTS = [
  "olive",
  "tan",
  "plum",
  "terracotta",
  "saddle",
  "amber",
  "rust",
  "brick",
  "saffron",
  "copper",
  "gold",
];

const LED_DELAY_STEP_MS = 95;
const LED_POP_MS = 600;

export default function SplashScreen({ leaving = false }) {
  return (
    <div className={`splash-screen ${leaving ? "is-leaving" : ""}`.trim()}>
      <header className="splash-top">
        <div className="brand-mark">O</div>
        <span className="splash-version">v1.0.0</span>
      </header>

      <div className="splash-center">
        <div className="splash-mark">O</div>
        <h1 className="splash-wordmark">OBSTACLE</h1>
        <p className="splash-tagline">Multi-effect guitar pedalboard</p>
        <div className="splash-led-row" aria-hidden="true">
          {PEDAL_ACCENTS.map((accent, index) => (
            <span
              key={accent}
              className={`splash-led pedal-accent-${accent}`}
              style={{ "--i": `${index * LED_DELAY_STEP_MS}ms` }}
            />
          ))}
        </div>
        <p className="splash-loading">Loading board</p>
      </div>

      <footer className="splash-bottom">
        <span>Retrokielto</span>
        <span>Rtrk · Obst</span>
      </footer>
    </div>
  );
}
