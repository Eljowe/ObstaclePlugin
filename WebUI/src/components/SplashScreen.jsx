import { APP_VERSION } from "../version";

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
  "sage",
  "slate",
];

const LED_DELAY_STEP_MS = 95;
const LED_POP_MS = 600;

export default function SplashScreen({ leaving = false, onSkip }) {
  return (
    <div className={`splash-screen ${leaving ? "is-leaving" : ""}`.trim()} onClick={onSkip} title="Click to skip">
      <header className="splash-top">
        <div className="brand-mark">O</div>
        <span className="splash-version">v{APP_VERSION}</span>
      </header>

      <div className="splash-center">
        <div className="splash-mark">O</div>
        <p className="splash-wordmark">OBSTACLE</p>
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
        <p className="splash-loading" role="status" aria-live="polite">
          Loading board
        </p>
      </div>

      <footer className="splash-bottom">
        <span>Retrokielto</span>
        <span>Rtrk · Obst</span>
      </footer>
    </div>
  );
}
