import { BypassButton, Knob } from "../components/controls";

export default function Pedalboard({
  tunerBypassed,
  tunerNote,
  tunerCents,
  tunerFrequency,
  tunerLevel,
  gateThreshold,
  gateBypassed,
  drive,
  driveTone,
  driveLevel,
  driveBypassed,
  overdriveDrive,
  overdriveTone,
  overdriveLevel,
  overdriveBypassed,
  fuzzDrive,
  fuzzTone,
  fuzzLevel,
  fuzzBypassed,
  synthFuzzMix,
  synthFuzzDelay,
  synthFuzzDetune,
  synthFuzzDrive,
  synthFuzzLevel,
  synthFuzzBypassed,
  compressorAmount,
  compressorBypassed,
  compressorTone,
  compressorLevel,
  octaveTranspose,
  octaveMix,
  octaveLevel,
  octaveTone,
  octaveMonoDetector,
  octaveBypassed,
  doublerMix,
  doublerDelay,
  doublerDetune,
  doublerBypassed,
  tremoloSpeed,
  tremoloDepth,
  tremoloLfoIndex,
  tremoloStereoPhase,
  tremoloBypassed,
  delayMix,
  delayTimeL,
  delayTimeR,
  delayFeedback,
  delayModeIsDual,
  delayBypassed,
  reverbSize,
  reverbDamping,
  reverbMix,
  reverbWidth,
  reverbBypassed,
  onTunerToggle,
  onGateThresholdChange,
  onGateToggle,
  onCompressorChange,
  onCompressorToneChange,
  onCompressorLevelChange,
  onCompressorToggle,
  onDriveChange,
  onDriveToneChange,
  onDriveLevelChange,
  onDriveToggle,
  onOverdriveDriveChange,
  onOverdriveToneChange,
  onOverdriveLevelChange,
  onOverdriveToggle,
  onFuzzDriveChange,
  onFuzzToneChange,
  onFuzzLevelChange,
  onFuzzToggle,
  onSynthFuzzMixChange,
  onSynthFuzzDelayChange,
  onSynthFuzzDetuneChange,
  onSynthFuzzDriveChange,
  onSynthFuzzLevelChange,
  onSynthFuzzToggle,
  onOctaveTransposeChange,
  onOctaveMixChange,
  onOctaveLevelChange,
  onOctaveToneChange,
  onOctaveMonoDetectorToggle,
  onOctaveToggle,
  onDoublerMixChange,
  onDoublerDelayChange,
  onDoublerDetuneChange,
  onDoublerToggle,
  onTremoloSpeedChange,
  onTremoloDepthChange,
  onTremoloLfoChange,
  onTremoloStereoPhaseToggle,
  onTremoloToggle,
  onDelayMixChange,
  onDelayTimeLChange,
  onDelayTimeRChange,
  onDelayFeedbackChange,
  onDelayModeToggle,
  onDelayToggle,
  onReverbSizeChange,
  onReverbDampingChange,
  onReverbMixChange,
  onReverbWidthChange,
  onReverbToggle,
}) {
  return (
    <section className="panel-shell fx-shell">
      <p className="section-title">Pedalboard</p>
      <div className="fx-pedal-grid">
        <article
          className={`fx-pedal-card pedal-accent-olive ${tunerBypassed ? "is-bypassed" : ""}`.trim()}
          role="group"
          aria-label="Tuner pedal"
        >
          <p className="fx-pedal-title">Tuner</p>
          <div className="tuner-display">
            <div className={`tuner-note ${!tunerNote ? "is-muted" : ""}`.trim()}>
              {tunerBypassed ? "—" : (tunerNote || "—")}
            </div>
            <div className="tuner-cents-track">
              <div className="tuner-cents-center" />
              <div
                className={`tuner-cents-needle ${Math.abs(tunerCents) > 25 ? "is-very-off" : ""}`.trim()}
                style={{
                  "--needle-x": `${tunerBypassed
                    ? 50
                    : 50 + Math.max(-50, Math.min(50, tunerCents))}%`,
                }}
              />
            </div>
            <div className="tuner-cents-readout">
              {tunerBypassed
                ? "Off"
                : tunerNote
                  ? `${tunerCents > 0 ? "+" : ""}${tunerCents.toFixed(1)} ¢ · ${tunerFrequency.toFixed(1)} Hz`
                  : "Play a note"}
            </div>
            <div className="tuner-level-bar">
              <div
                className="tuner-level-fill"
                style={{
                  "--level-x": tunerBypassed
                    ? 0
                    : Math.max(0, Math.min(1, (tunerLevel + 60) / 60)),
                }}
              />
            </div>
          </div>
          <BypassButton
            label="Power"
            effect="Tuner"
            enabled={tunerBypassed}
            className="pedal-power"
            onToggle={onTunerToggle}
          />
        </article>

        <article
          className={`fx-pedal-card pedal-accent-sage ${gateBypassed ? "is-bypassed" : ""}`.trim()}
          role="group"
          aria-label="Gate pedal"
        >
          <p className="fx-pedal-title">Gate</p>
          <Knob
            className="pedal-compact"
            label="Threshold"
            min={-60}
            max={0}
            value={gateThreshold}
            onChange={onGateThresholdChange}
            unit="dB"
            accent="sage"
          />
          <BypassButton
            label="Power"
            effect="Gate"
            enabled={gateBypassed}
            className="pedal-power"
            onToggle={onGateToggle}
          />
        </article>

        <article
          className={`fx-pedal-card pedal-accent-tan ${compressorBypassed ? "is-bypassed" : ""}`.trim()}
          role="group"
          aria-label="Compressor pedal"
        >
          <p className="fx-pedal-title">Compressor</p>
          <Knob
            className="pedal-compact"
            label="Comp"
            min={0}
            max={24}
            value={compressorAmount}
            onChange={onCompressorChange}
            unit="dB"
            accent="tan"
          />
          <div className="knob-grid knob-grid-2">
            <Knob
              className="pedal-compact"
              label="Tone"
              min={0}
              max={1}
              step={0.01}
              value={compressorTone}
              onChange={onCompressorToneChange}
              accent="tan"
            />
            <Knob
              className="pedal-compact"
              label="Level"
              min={-12}
              max={24}
              value={compressorLevel}
              onChange={onCompressorLevelChange}
              unit="dB"
              accent="tan"
            />
          </div>
          <BypassButton
            label="Power"
            effect="Compressor"
            enabled={compressorBypassed}
            className="pedal-power"
            onToggle={onCompressorToggle}
          />
        </article>

        <article
          className={`fx-pedal-card pedal-accent-plum ${octaveBypassed ? "is-bypassed" : ""}`.trim()}
          role="group"
          aria-label="Octave pedal"
        >
          <p className="fx-pedal-title">Octave</p>
          <div className="knob-grid knob-grid-2">
            <Knob
              className="pedal-compact"
              label="Transpose"
              min={-12}
              max={12}
              step={1}
              value={octaveTranspose}
              onChange={onOctaveTransposeChange}
              unit="st"
              accent="plum"
              decimals={0}
            />
            <Knob
              className="pedal-compact"
              label="Mix"
              min={0}
              max={1}
              step={0.01}
              value={octaveMix}
              onChange={onOctaveMixChange}
              accent="plum"
              decimals={2}
            />
            <Knob
              className="pedal-compact"
              label="Level"
              min={-24}
              max={12}
              step={0.1}
              value={octaveLevel}
              onChange={onOctaveLevelChange}
              unit="dB"
              accent="plum"
            />
            <Knob
              className="pedal-compact"
              label="Tone"
              min={0}
              max={1}
              step={0.01}
              value={octaveTone}
              onChange={onOctaveToneChange}
              accent="plum"
              decimals={2}
            />
          </div>
          <div className="pedal-aux-row">
            <BypassButton
              label="Mono Det"
              ariaLabel="Octave mono detector"
              enabled={!octaveMonoDetector}
              onToggle={onOctaveMonoDetectorToggle}
            />
            <BypassButton
              label="Power"
              effect="Octave"
              enabled={octaveBypassed}
              className="pedal-power"
              onToggle={onOctaveToggle}
            />
          </div>
        </article>

        <article
          className={`fx-pedal-card pedal-accent-terracotta ${doublerBypassed ? "is-bypassed" : ""}`.trim()}
          role="group"
          aria-label="Doubler pedal"
        >
          <p className="fx-pedal-title">Doubler</p>
          <Knob
            className="pedal-compact"
            label="Mix"
            min={0}
            max={1}
            step={0.01}
            value={doublerMix}
            onChange={onDoublerMixChange}
            accent="terracotta"
          />
          <div className="knob-grid knob-grid-2">
            <Knob
              className="pedal-compact"
              label="Delay"
              min={0}
              max={100}
              step={0.5}
              value={doublerDelay}
              onChange={onDoublerDelayChange}
              unit="ms"
              decimals={0}
              accent="terracotta"
            />
            <Knob
              className="pedal-compact"
              label="Detune"
              min={-50}
              max={50}
              step={1}
              value={doublerDetune}
              onChange={onDoublerDetuneChange}
              unit="ct"
              decimals={0}
              accent="terracotta"
            />
          </div>
          <BypassButton
            label="Power"
            effect="Doubler"
            enabled={doublerBypassed}
            className="pedal-power"
            onToggle={onDoublerToggle}
          />
        </article>

        <article
          className={`fx-pedal-card pedal-accent-saddle ${overdriveBypassed ? "is-bypassed" : ""}`.trim()}
          role="group"
          aria-label="Overdrive pedal"
        >
          <p className="fx-pedal-title">Overdrive</p>
          <Knob
            className="pedal-compact"
            label="Drive"
            min={0}
            max={24}
            value={overdriveDrive}
            onChange={onOverdriveDriveChange}
            unit="dB"
            accent="saddle"
          />
          <div className="knob-grid knob-grid-2">
            <Knob
              className="pedal-compact"
              label="Tone"
              min={0}
              max={1}
              step={0.01}
              value={overdriveTone}
              onChange={onOverdriveToneChange}
              accent="saddle"
            />
            <Knob
              className="pedal-compact"
              label="Level"
              min={-24}
              max={12}
              value={overdriveLevel}
              onChange={onOverdriveLevelChange}
              unit="dB"
              accent="saddle"
            />
          </div>
          <BypassButton
            label="Power"
            effect="Overdrive"
            enabled={overdriveBypassed}
            className="pedal-power"
            onToggle={onOverdriveToggle}
          />
        </article>

        <article
          className={`fx-pedal-card pedal-accent-amber ${driveBypassed ? "is-bypassed" : ""}`.trim()}
          role="group"
          aria-label="Drive pedal"
        >
          <p className="fx-pedal-title">Drive</p>
          <Knob
            className="pedal-compact"
            label="Drive"
            min={0}
            max={24}
            value={drive}
            onChange={onDriveChange}
            unit="dB"
            accent="amber"
          />
          <div className="knob-grid knob-grid-2">
            <Knob
              className="pedal-compact"
              label="Tone"
              min={0}
              max={1}
              step={0.01}
              value={driveTone}
              onChange={onDriveToneChange}
              accent="amber"
            />
            <Knob
              className="pedal-compact"
              label="Level"
              min={-24}
              max={12}
              value={driveLevel}
              onChange={onDriveLevelChange}
              unit="dB"
              accent="amber"
            />
          </div>
          <BypassButton
            label="Power"
            effect="Drive"
            enabled={driveBypassed}
            className="pedal-power"
            onToggle={onDriveToggle}
          />
        </article>

        <article
          className={`fx-pedal-card pedal-accent-rust ${fuzzBypassed ? "is-bypassed" : ""}`.trim()}
          role="group"
          aria-label="Fuzz pedal"
        >
          <p className="fx-pedal-title">Fuzz</p>
          <Knob
            className="pedal-compact"
            label="Fuzz"
            min={0}
            max={24}
            value={fuzzDrive}
            onChange={onFuzzDriveChange}
            unit="dB"
            accent="rust"
          />
          <div className="knob-grid knob-grid-2">
            <Knob
              className="pedal-compact"
              label="Tone"
              min={0}
              max={1}
              step={0.01}
              value={fuzzTone}
              onChange={onFuzzToneChange}
              accent="rust"
            />
            <Knob
              className="pedal-compact"
              label="Level"
              min={-24}
              max={12}
              value={fuzzLevel}
              onChange={onFuzzLevelChange}
              unit="dB"
              accent="rust"
            />
          </div>
          <BypassButton
            label="Power"
            effect="Fuzz"
            enabled={fuzzBypassed}
            className="pedal-power"
            onToggle={onFuzzToggle}
          />
        </article>

        <article
          className={`fx-pedal-card fx-pedal-card-wide pedal-accent-brick ${synthFuzzBypassed ? "is-bypassed" : ""}`.trim()}
          role="group"
          aria-label="Synth Fuzz pedal"
        >
          <p className="fx-pedal-title">Synth Fuzz</p>
          <div className="knob-grid knob-grid-3">
            <Knob
              className="pedal-compact"
              label="Delay"
              min={0}
              max={100}
              step={0.5}
              value={synthFuzzDelay}
              onChange={onSynthFuzzDelayChange}
              unit="ms"
              decimals={0}
              accent="brick"
            />
            <Knob
              className="pedal-compact"
              label="Detune"
              min={-50}
              max={50}
              step={1}
              value={synthFuzzDetune}
              onChange={onSynthFuzzDetuneChange}
              unit="ct"
              decimals={0}
              accent="brick"
            />
            <Knob
              className="pedal-compact"
              label="Drive"
              min={1}
              max={20}
              step={0.05}
              value={synthFuzzDrive}
              onChange={onSynthFuzzDriveChange}
              accent="brick"
              decimals={2}
            />
          </div>
          <div className="knob-grid knob-grid-2">
            <Knob
              className="pedal-compact"
              label="Level"
              min={-24}
              max={12}
              value={synthFuzzLevel}
              onChange={onSynthFuzzLevelChange}
              unit="dB"
              accent="brick"
            />
            <Knob
              className="pedal-compact"
              label="Mix"
              min={0}
              max={1}
              step={0.01}
              value={synthFuzzMix}
              onChange={onSynthFuzzMixChange}
              accent="brick"
            />
          </div>
          <BypassButton
            label="Power"
            effect="Synth Fuzz"
            enabled={synthFuzzBypassed}
            className="pedal-power"
            onToggle={onSynthFuzzToggle}
          />
        </article>

        <article
          className={`fx-pedal-card pedal-accent-saffron ${reverbBypassed ? "is-bypassed" : ""}`.trim()}
          role="group"
          aria-label="Reverb pedal"
        >
          <p className="fx-pedal-title">Reverb</p>
          <div className="knob-grid knob-grid-2">
            <Knob
              className="pedal-compact"
              label="Size"
              min={0}
              max={1}
              step={0.01}
              value={reverbSize}
              onChange={onReverbSizeChange}
              accent="saffron"
            />
            <Knob
              className="pedal-compact"
              label="Damping"
              min={0}
              max={1}
              step={0.01}
              value={reverbDamping}
              onChange={onReverbDampingChange}
              accent="saffron"
            />
            <Knob
              className="pedal-compact"
              label="Mix"
              min={0}
              max={1}
              step={0.01}
              value={reverbMix}
              onChange={onReverbMixChange}
              accent="saffron"
            />
            <Knob
              className="pedal-compact"
              label="Width"
              min={0}
              max={1}
              step={0.01}
              value={reverbWidth}
              onChange={onReverbWidthChange}
              accent="saffron"
            />
          </div>
          <BypassButton
            label="Power"
            effect="Reverb"
            enabled={reverbBypassed}
            className="pedal-power"
            onToggle={onReverbToggle}
          />
        </article>

        <article
          className={`fx-pedal-card fx-pedal-card-wide pedal-accent-copper ${delayBypassed ? "is-bypassed" : ""}`.trim()}
          role="group"
          aria-label="Delay pedal"
        >
          <p className="fx-pedal-title">Delay</p>
          <div className="knob-grid knob-grid-3">
            <Knob
              className="pedal-compact"
              label="Mix"
              min={0}
              max={1}
              step={0.01}
              value={delayMix}
              onChange={onDelayMixChange}
              accent="copper"
            />
            <Knob
              className="pedal-compact"
              label="Feedback"
              min={0}
              max={0.95}
              step={0.01}
              value={delayFeedback}
              onChange={onDelayFeedbackChange}
              accent="copper"
            />
            <div className="pedal-mode-toggle" role="radiogroup" aria-label="Delay mode">
              <button
                type="button"
                className={`pedal-mode-option ${!delayModeIsDual ? "active" : ""}`.trim()}
                role="radio"
                aria-checked={!delayModeIsDual}
                onClick={() => { if (delayModeIsDual) onDelayModeToggle(); }}
              >
                <span className="pedal-mode-circle" aria-hidden="true" />
                <span className="pedal-mode-label">Single</span>
              </button>
              <button
                type="button"
                className={`pedal-mode-option ${delayModeIsDual ? "active" : ""}`.trim()}
                role="radio"
                aria-checked={delayModeIsDual}
                onClick={() => { if (!delayModeIsDual) onDelayModeToggle(); }}
              >
                <span className="pedal-mode-circle" aria-hidden="true" />
                <span className="pedal-mode-label">Dual</span>
              </button>
            </div>
          </div>
          <div className="knob-grid knob-grid-2">
            <Knob
              className="pedal-compact"
              label="Time L"
              min={0}
              max={2000}
              step={1}
              value={delayTimeL}
              onChange={onDelayTimeLChange}
              unit="ms"
              decimals={0}
              accent="copper"
            />
            <Knob
              className="pedal-compact"
              label="Time R"
              min={0}
              max={2000}
              step={1}
              value={delayTimeR}
              onChange={delayModeIsDual ? onDelayTimeRChange : undefined}
              unit="ms"
              decimals={0}
              accent="copper"
              disabled={!delayModeIsDual}
              title="Dual mode only"
            />
          </div>
          <BypassButton
            label="Power"
            effect="Delay"
            enabled={delayBypassed}
            className="pedal-power"
            onToggle={onDelayToggle}
          />
        </article>

        <article
          className={`fx-pedal-card pedal-accent-gold ${tremoloBypassed ? "is-bypassed" : ""}`.trim()}
          role="group"
          aria-label="Tremolo pedal"
        >
          <p className="fx-pedal-title">Tremolo</p>
          <div className="knob-grid knob-grid-2">
            <Knob
              className="pedal-compact"
              label="Speed"
              min={0.1}
              max={15}
              step={0.05}
              value={tremoloSpeed}
              onChange={onTremoloSpeedChange}
              unit="Hz"
              decimals={2}
              accent="gold"
            />
            <Knob
              className="pedal-compact"
              label="Depth"
              min={0}
              max={1}
              step={0.01}
              value={tremoloDepth}
              onChange={onTremoloDepthChange}
              accent="gold"
            />
          </div>
          <div className="pedal-mode-toggle pedal-mode-toggle-4" role="radiogroup" aria-label="Tremolo LFO">
            <button
              type="button"
              className={`pedal-mode-option ${tremoloLfoIndex === 0 ? "active" : ""}`.trim()}
              role="radio"
              aria-checked={tremoloLfoIndex === 0}
              onClick={() => { if (tremoloLfoIndex !== 0) onTremoloLfoChange(0); }}
            >
              <span className="pedal-mode-circle" aria-hidden="true" />
              <span className="pedal-mode-label">Sine</span>
            </button>
            <button
              type="button"
              className={`pedal-mode-option ${tremoloLfoIndex === 1 ? "active" : ""}`.trim()}
              role="radio"
              aria-checked={tremoloLfoIndex === 1}
              aria-label="Triangle"
              onClick={() => { if (tremoloLfoIndex !== 1) onTremoloLfoChange(1); }}
            >
              <span className="pedal-mode-circle" aria-hidden="true" />
              <span className="pedal-mode-label">Tri</span>
            </button>
            <button
              type="button"
              className={`pedal-mode-option ${tremoloLfoIndex === 2 ? "active" : ""}`.trim()}
              role="radio"
              aria-checked={tremoloLfoIndex === 2}
              onClick={() => { if (tremoloLfoIndex !== 2) onTremoloLfoChange(2); }}
            >
              <span className="pedal-mode-circle" aria-hidden="true" />
              <span className="pedal-mode-label">Square</span>
            </button>
          </div>
          <div className="pedal-aux-row">
            <BypassButton
              label="Stereo"
              ariaLabel="Tremolo stereo phase"
              enabled={!tremoloStereoPhase}
              onToggle={onTremoloStereoPhaseToggle}
            />
            <BypassButton
              label="Power"
              effect="Tremolo"
              enabled={tremoloBypassed}
              className="pedal-power"
              onToggle={onTremoloToggle}
            />
          </div>
        </article>
      </div>
    </section>
  );
}
