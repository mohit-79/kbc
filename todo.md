# SurKBC Engineering Tasks & Status (todo.md)

This document tracks all planned, in-progress, and completed tasks with strict adherence to stability, isolation, and verification rules from `workflow.md`.

---

## Task List & Current Progress

- [x] **Milestone 1: Theme Song Volume Reduction & Mute Button**
  - **Objective**: Lower default theme song volume from `0.55` to `0.18` (soft background ambience) and add an interactive mute toggle button on `screen-home`.
  - **Files Affected**:
    - `audio.js`: Update `playAppTheme()`, implement `isThemeMuted()` and `toggleThemeMute()`.
    - `index.html`: Add `#btn-theme-mute` in `screen-home` header.
    - `styles.css`: Add styling for `.btn-theme-mute`.
    - `app.js`: Wire `window.toggleThemeMute()` and `renderHome()` state syncing.
  - **Status**: Completed and verified.

- [x] **Milestone 2: Page Audio Isolation & Bleed Prevention**
  - **Objective**: Kill all audio clips, host TTS utterances, and pending timers immediately when switching screens. Prevent old audio from leaking across screens during rapid navigation.
  - **Files Affected**:
    - `audio.js`: Add `stopAllMedia()`, sequence ticketing, timer clearing, source releasing.
    - `app.js`: Call `stopAllMedia()` inside `window.show(screenId)` and clear pending intro/result timers via central timer registry.
  - **Status**: Completed and verified.

- [x] **Milestone 3: Phone-a-Friend Green-API Auto-Send (Eliminate `wa.me` Tab Redirect)**
  - **Objective**: Ensure Green-API payload uses valid international phone format (`91XXXXXXXXXX@c.us`) and prevent client-side `window.open(data.waLink)` from hijacking gameplay.
  - **Files Affected**:
    - `worker.js`: Sanitize phone numbers, check Green-API response status, fix phone format.
    - `app.js`: Remove automated `window.open` redirect; keep player in in-game waiting/chat screen with optional manual link.
  - **Status**: Completed and verified.

- [x] **Milestone 4: Era Filtering & Anti-Repetition with Verified Audio Previews**
  - **Objective**: Allow users to filter song questions by time period (Golden, Retro, 90s, 2000s, 2010s, Modern) using verified preview sources without falling back to repetitive default tracks or silent tones.
  - **Files Affected**:
    - `app.js`: Added era-based filtering, preview linking via `previews_cache.json` and iTunes proxy `/api/song-preview`, multi-era settings sync, and anti-repetition memory.
    - `index.html`: Added 6 Era checkboxes (Golden, Retro, 90s, 2000s, 2010s, Modern) and "Sabhi Daur (Select All)" toggle in `screen-settings`.
    - `styles.css`: Added responsive checkbox card styles.
    - `questions.js`: Tagged all sample questions with eras.
    - `worker.js`: Added iTunes preview search proxy with edge caching.
    - `audio.js`: Added responsive visualizer fallback for cross-origin audio elements and host TTS utterances.
  - **Status**: Completed, built, and deploying.

---

## Verification & Execution Protocol
1. Each milestone must be executed individually.
2. Syntax check via `node --check app.js audio.js worker.js`.
3. Commands executed via `temp.bat` with `cmd.exe /c temp.bat`.
4. Deploy and verify live on `https://kbc.harjani.me`.
