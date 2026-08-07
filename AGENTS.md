# AGENTS.md

Guidance for AI agents working in this repository.

## Project overview

Obstacle is an audio plugin (VST3 + Standalone) built with JUCE and CMake.
It models a multi-effect guitar pedalboard (gate, compressor, octave,
doubler, synth fuzz, tremolo, delay, overdrive, distortion, fuzz, 10-band
graphic EQ, reverb) plus a tuner, input/output gain and a spectrum
analyzer. The UI is a React + Vite app rendered inside a JUCE
`WebBrowserComponent` (WebView2 on Windows), with a native JUCE editor as
fallback.

Key facts:

- Company: Retrokielto. Plugin codes: manufacturer `Rtrk`, plugin `Obst`.
- Formats: VST3 and Standalone only. No MIDI I/O.
- Real-time DSP runs on the audio thread; all processing is hand-rolled
  in `Source/PluginProcessor.cpp/.h` (no JUCE `ProcessorChain`).
- The signal chain, DSP stage order and parameter layout are defined in
  `PluginProcessor.cpp`. `ChainSettings` (struct in PluginProcessor.h) is
  the single snapshot struct fetched once per audio block via
  `getChainSettings()`.

## Repository layout

| Path | Purpose |
| --- | --- |
| `Source/PluginProcessor.{h,cpp}` | Audio processing core: chain, `apvts`, parameter layout, DSP stages |
| `Source/PluginEditor.{h,cpp}` | Native JUCE editor (largely superseded by the WebView editor) |
| `Source/WebViewEditor.{h,cpp}` | WebView editor: hosts `WebUI/dist/index.html`, JS<->C++ bridge, FFT analyzer, response curve |
| `WebUI/` | React + Vite frontend (`npm run build` outputs `WebUI/dist/`) |
| `cmake/` | Install-time helper scripts (shortcut creation, elevated VST3 install) |
| `scripts/` | PowerShell dev/build/install helpers |
| `resources/` | Icon assets |
| `build/` | CMake build output (gitignored) |
| `Obstacle.jucer` | Legacy Projucer export file (build is CMake-driven now) |

## Build & run (Windows, VS2022)

JUCE source is expected at `C:/JUCE/JUCE` (override with
`-DJUCE_DIR=...` at configure time). Repo root:

```powershell
cmake -S . -B build -G "Visual Studio 17 2022" -A x64
cmake --build build --config Debug --target Obstacle_Standalone
cmake --build build --config Debug --target Obstacle_VST3
```

Standalone binary: `build/Obstacle_artefacts/Debug/Standalone/Obstacle.exe`

The WebUI must be built before the plugin will show its interface:
`npm run build` in `WebUI/` (produces `WebUI/dist/index.html`, which
`WebViewEditor.cpp` locates at runtime by walking up from the plugin
module or bundle; the Release VST3 build also embeds a copy inside the
bundle). For development, override the loaded URL with the environment
variable `Obstacle_WEB_UI_URL` (e.g. `http://127.0.0.1:5173`) and run
`npm run dev`.

There are VS Code tasks (`Build Obstacle Debug`, `Rebuild Obstacle
Debug`, `Run Obstacle Debug`, plus WebUI install/build tasks) and a
`scripts/build-install-run.ps1` helper.

## Testing

No automated CTest tests are configured. Verification is manual:

1. Build Debug, run the Standalone, check UI controls react correctly.
2. Load the VST3 in a DAW, verify audio passes through.
3. Toggle each effect's bypass and verify behavior.
4. Enable the analyzer and verify the response curve/FFT updates during playback.

If you add automated tests, register them with CTest.

## Conventions

- Audio-thread safety is paramount: never allocate, lock, or call
  non-realtime-safe code in `processBlock`. Scratch buffers are
  pre-allocated in `prepareToPlay` (see `dryScratchBuffer`). UI->DSP
  communication goes through atomics or the APVTS; DSP->UI telemetry
  (clipping, peak levels, tuner, analyzer) uses `std::atomic` exchange/consume
  or the `SingleChannelSampleFifo`.
- `ChainSettings` is the canonical snapshot struct. When adding a
  parameter, add a matching `ChainSettings` field and populate it in
  `getChainSettings()`; UI code reads from APVTS directly.
- Constants that are derived from APVTS parameter ranges (e.g.
  `kOctaveTransposeMinSemitones` / `kOctaveWorstCaseLookback` in
  PluginProcessor.h) must be updated together with the APVTS range they
  mirror — the header comment explains the derivation.
- Parameter IDs are human-readable strings ("Octave Mix", "Fuzz Drive",
  ...). They appear in three places that must stay in sync: the APVTS
  layout in `PluginProcessor.cpp`, the `param*` string constants in
  `WebViewEditor.h`, and the React controls in `WebUI/src/`.
- DSP stage ordering and latency: any new stage with latency must be
  reflected in `updateLatency()` (called from `prepareToPlay` and on
  relevant parameter changes).
- JUCE convention: `juce::` prefix on types, spaces for indentation
  (4-space), braces on their own line for functions/classes, opening
  brace on the same line for control statements (see existing code).
- Keep the audio core (`Source/`) free of frontend concerns; the bridge
  lives only in `WebViewEditor`. The JS<->C++ bridge is still incomplete:
  React controls are not yet fully wired to APVTS parameters.
- Git history is commit-per-logical-change with short imperative messages
  ("effect logic", "delay", "tremolo pedal"). Match that style when committing.

## Gotchas

- `Obstacle_WEB_UI_URL` env var overrides the loaded UI URL; unset it
  (or launch from a clean shell) to get the packaged `dist/index.html`.
- Installing to `C:\Program Files` requires an elevated PowerShell:
  `cmake --install build --config Release` (or the INSTALL target). The
  "Install VST3 to Program Files (elevated)" VS Code task runs
  `cmake/install-vst3-elevated.ps1`, which self-elevates via a UAC prompt
  and deletes the old bundle before copying — overwriting in place fails
  on the stale `desktop.ini` Explorer drops inside the bundle. A
  per-user Start Menu shortcut avoids admin.
- VST3 install destination defaults to
  `C:/Program Files/Common Files/VST3`; override with `-DOBSTACLE_VST3_DIR=...`.
- CMake policy CMP0177 is set in CMakeLists.txt so backslash paths in
  `OBSTACLE_VST3_DIR` are not mangled on CMake 4.x — preserve that block.
- `WebUI/dist/` is embedded into the VST3 bundle at build time
  (`Contents/Resources/WebUI/dist`) so the UI works in any host; a
  missing dist build is skipped silently, so the installed VST3 has no
  UI if the WebUI wasn't built first. `findLocalWebUiDistIndex()` in
  WebViewEditor.cpp walks up from the plugin module accepting either the
  repo layout (`WebUI/dist`) or the bundle layout
  (`Contents/Resources/WebUI/dist`) and validates the built `<title>`,
  so it can never load a sibling project's UI (e.g. BluePrinter's dist
  when this plugin is loaded inside it).
- This environment is WSL/Linux, but the project targets Windows/VS2022:
  build commands are documented for PowerShell.
