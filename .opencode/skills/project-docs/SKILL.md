---
name: project-docs
description: Use when writing, updating, or reviewing documentation for the Obstacle project — README.md, AGENTS.md, code comments, header doc blocks, or any developer-facing docs. Triggers on "update the README", "document", "add comments", "write docs".
---

# Project documentation skill (Obstacle)

Guidance for creating and maintaining documentation in the Obstacle repo.
This is a JUCE audio plugin with a React WebView UI; docs must stay
accurate across both halves of the stack and never contradict the code.

## Sources of truth (read these before writing)

- `PluginProcessor.cpp` — actual DSP stage order, parameter layout
  (`createParameterLayout()`), latency handling (`updateLatency()`).
- `PluginProcessor.h` — `ChainSettings`, DSP class docs (e.g. the
  `GranularPitchShifter` COLA/Hann explanation).
- `WebViewEditor.{h,cpp}` — bridge behavior, `Obstacle_WEB_UI_URL`, FFT.
- `CMakeLists.txt` — targets, install rules, policy CMP0177.
- `WebUI/` — React app; check `WebUI/src/` before documenting UI controls.

Never document behavior you have not verified in these files. If the
code and the docs disagree, fix the docs or flag the mismatch.

## Writing style

- README/AGENTS tone: concise, imperative, developer-facing. Use
  PowerShell commands for build steps (the project targets
  Windows/VS2022; the dev machine is WSL/Linux — don't mix shells
  without saying so).
- Keep the docs close to the code they describe: same order of
  concepts, same names (`ChainSettings`, `apvts`, `getChainSettings()`).
- When adding a parameter or stage, document all three sync points:
  APVTS layout in `PluginProcessor.cpp`, `param*` constants in
  `WebViewEditor.h`, React controls in `WebUI/src/` — plus `ChainSettings`
  and `updateLatency()` where relevant.
- C++ comments: block `/* */` for file headers and derived-constant
  explanations, `//` inline. No decorative ASCII art unless the file
  already uses it.
- Don't add comments that restate the code ("increments the counter").
  Explain *why*, not *what*. Juce-style "//" followed by sentence case.

## Scope rules

- `README.md` = user + developer entry point: build, run, test, WebUI.
- `AGENTS.md` = agent guidance: repo layout, conventions, gotchas.
  Cross-link them; do not duplicate long build instructions.
- Source file comments = DSP invariants, thread-safety notes, derived
  constants (see the `kOctave*` comment block in PluginProcessor.h as
  the house style for "keep these in sync" notes).
- When docs mention derived constants or ranges, state the derivation
  chain (e.g. `grainLength / min(pitchRatio)`) so a future change is
  discoverable.

## Verification

- After editing docs, re-read the referenced code to confirm every
  claim (commands, file paths, parameter names, defaults) is still true.
- If you changed a command in docs, sanity-check the flags against
  CMakeLists.txt / package.json / scripts/.
- Report any doc-vs-code mismatch you found but did not fix.

## Anti-patterns

- Don't restate the README inside AGENTS.md (or vice versa) verbatim.
- Don't add "TODO" comments unless the task explicitly asks.
- Don't claim the JS<->C++ bridge is complete — it is still being wired
  up (AGENTS.md marks it incomplete).
- Don't write generic plugin-framework prose; every statement must be
  true for *this* repo (e.g. no MIDI I/O, no ProcessorChain).
