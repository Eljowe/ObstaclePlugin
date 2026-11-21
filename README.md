# Obstacle

Obstacle is a multi-effect guitar pedalboard audio plugin by **Retrokielto**
(v1.0.0). All DSP is hand-rolled and runs on the audio thread — no JUCE
`ProcessorChain`, no MIDI I/O.

Formats:

- VST3
- Standalone app

## Signal chain

The stages run in this order (see `processBlock` in
`Source/PluginProcessor.cpp`):

1. Input gain
2. Tuner (analysis only — it does not alter the audio)
3. Gate
4. Compressor
5. 10-band graphic EQ
6. Octave
7. Doubler
8. Synth fuzz
9. Overdrive
10. Distortion
11. Fuzz
12. Delay (stereo / dual mode)
13. Reverb
14. Tremolo
15. Output gain
16. Mute (global, applied last)

Mono Input duplicates the left channel onto the right before processing, so
a mono source plays out of both speakers and the stereo effects (delay,
reverb) have a stereo image to work with.

Plus input/output peak meters with clip detection, and an optional spectrum
analyzer / response curve display.

## Prerequisites

- Windows
- Visual Studio 2022 (Desktop development with C++)
- CMake 3.22+
- JUCE source at C:/JUCE/JUCE (default in CMakeLists.txt)
- Node.js (for the WebView UI)

If JUCE is in a different location, pass JUCE_DIR during configure.

## Configure

From the project root, run:

cmake -S . -B build -G "Visual Studio 17 2022" -A x64

If JUCE is elsewhere:

cmake -S . -B build -G "Visual Studio 17 2022" -A x64 -DJUCE_DIR="C:/path/to/JUCE"

## Build

Build Debug (all default targets):

cmake --build build --config Debug

Rebuild Debug from clean:

cmake --build build --config Debug --clean-first

Build only the standalone app target:

cmake --build build --config Debug --target Obstacle_Standalone

Build only the VST3 target:

cmake --build build --config Debug --target Obstacle_VST3

## Run

Run the standalone app after building:

.\build\Obstacle_artefacts\Debug\Standalone\Obstacle.exe

Or build and launch in one PowerShell command:

cmake --build build --config Debug --target Obstacle_Standalone; Start-Process -FilePath ".\\build\\Obstacle_artefacts\\Debug\\Standalone\\Obstacle.exe"

You can also use the VS Code task named: Run Obstacle Debug

## Installer / release bundle

The release bundle is built with `installer/build-release.ps1` (or the
"Build Release Bundle" VS Code task). It builds the WebUI, the Release
targets, compiles the Inno Setup installer (`installer/Obstacle.iss`), and
assembles `build\release\Obstacle-<version>\` with the installer, LICENSE,
README and SHA256SUMS.txt.

Prerequisites for the installer build:

- Inno Setup 6 (`winget install JRSoftware.InnoSetup`)

The installer itself (per-machine, admin):

- Installs `Obstacle.vst3` to `C:\Program Files\Common Files\VST3`
- Installs the standalone app + `WebUI\dist` to `C:\Program Files\Obstacle`
- Downloads the VC++ Redistributable and WebView2 Runtime at install time
  only when missing

Upload the bundle to GitHub with `installer/create-release.ps1` (the
"Create GitHub Release (draft)" VS Code task); it creates a `v<version>`
tag and a draft release with every bundle file attached. Requires
`GH_TOKEN` with "Contents: read and write" (fine-grained) or "repo"
(classic) scope.

## Testing

This repository currently has no automated CTest tests configured.

You can check anyway with:

ctest --test-dir build -C Debug --output-on-failure

If no tests are registered, CTest will report that no tests were found.

Recommended manual test flow:

1. Build Debug.
2. Run the Standalone app and verify UI controls react correctly.
3. Load the VST3 in a host DAW and verify audio passes through.
4. Toggle each effect's bypass (Gate, Compressor, EQ, Octave, Doubler, Synth
   Fuzz, Overdrive, Distortion, Fuzz, Delay, Reverb, Tremolo) and verify
   behavior.
5. Enable the analyzer and verify the response/FFT display updates during
   playback.

## WebView UI (React + Vite)

The main editor is a WebView (WebView2 on Windows) hosting a React + Vite app
in [WebUI](WebUI); the native JUCE editor in
[Source/PluginEditor.cpp](Source/PluginEditor.cpp) is the fallback. The JS
side sets APVTS parameters through the `frontendSetParameter` bridge event,
and the C++ side streams parameter snapshots and telemetry back through
`backendParameters`.

### 1) Frontend setup

From the project root:

cd WebUI
npm install

### 2) Build frontend assets for JUCE WebView

cd WebUI
npm run build

This creates: WebUI/dist/index.html

The JUCE editor tries to load this file automatically.

### 3) Optional: load a custom URL (dev server)

You can override the loaded URL with an environment variable:

set Obstacle_WEB_UI_URL=http://127.0.0.1:5173

Then run:

cd WebUI
npm run dev

And launch the plugin/standalone in the same shell session where the
environment variable is set.

### 4) Build JUCE plugin/app

cmake --build build --config Debug --target Obstacle_Standalone
cmake --build build --config Debug --target Obstacle_VST3

### Notes

- Web browser support is enabled via JUCE_WEB_BROWSER=1 in
  [CMakeLists.txt](CMakeLists.txt).
- The WebView editor falls back to a placeholder if WebUI/dist/index.html
  is missing (build the frontend before running the plugin).

## VS Code Tasks

This workspace already includes these tasks:

- Build Obstacle Debug
- Rebuild Obstacle Debug
- Run Obstacle Debug

Run them from Terminal -> Run Task.
