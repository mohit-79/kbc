# SurKBC — Antigravity Handoff Plan (detailed, commit-by-commit)

> Paste this entire file into Antigravity as project context.
> Target URL: `kbc.harjani.me` (static hosting, all relative paths, no backend in v1).
> Stack: vanilla HTML/CSS/JS, no frameworks, no build step. `localStorage` for persistence.
> Personal-use project. Hinglish UI strings are intentional — keep them.

## iOS web-app requirements (PINNED — every commit must preserve these)

1. **WebKit meta tags:** `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`
   (`black-translucent`), `viewport-fit=cover`, `theme-color`, `apple-mobile-web-app-title`.
2. **Icons & manifest:** `apple-touch-icon` 180×180 PNG + `manifest.webmanifest`
   (`display: standalone`, matching theme/background colors).
3. **Native feel CSS:** `env(safe-area-inset-top/bottom)` padding (notch + Dynamic Island);
   no rubber-band (`overscroll-behavior:none`, body fixed, inner scroll containers only);
   `-webkit-touch-callout:none`, `user-select:none` (except inputs);
   `-webkit-tap-highlight-color:transparent`; `touch-action:manipulation`.

## Current code map

```
kbc-game/
  index.html            # screens as <section>, lock/suspense modals, toast
  styles.css            # KBC dark-navy + gold theme, safe-area, no-bounce rules
  app.js                # router, game state machine, timer, lock flow, stubs
  manifest.webmanifest  # standalone, relative paths
  icon-180.png          # placeholder gold music-note on navy
```

Screens: `screen-home`, `screen-intro`, `screen-question`, `screen-result`,
`screen-gameover`, `screen-settings`. Router `show(id)` toggles `.active`.

Locked decisions (do not re-ask): 15-level classic KBC ladder, exact amounts —
₹1,000 · ₹2,000 · ₹3,000 · ₹5,000 · **₹10,000 (padaav 1)** · ₹20,000 · ₹40,000 · ₹80,000 ·
₹1,60,000 · **₹3,20,000 (padaav 2)** · ₹6,40,000 · ₹12,50,000 · ₹25,00,000 · ₹50,00,000 · ₹1,00,00,000;
`PADAAV=[4,9]` (0-based indices of the two guaranteed levels); timer Easy 45s / Medium 30s / Hard 20s;
timer pauses during modals; timeout = wrong answer; quit keeps last completed prize;
4th lifeline = **Flip the Question**; voice = Hindi TTS (`speak()` stub, `VOICE_ENABLED` flag);
Phone-a-Friend v1 = WhatsApp share + manual answer entry (no backend); v2 later.
Singer photos: Wikimedia Commons. Audio clips: owner-provided / short previews.

---

## Owner's screen flow (SOURCE OF TRUTH — which page comes when)

Antigravity: this is the exact flow the owner designed. Every commit in Phase 2/3 must serve this order.

**HOME**
- Player name + stats + friends (for Phone-a-Friend) + "Take a Hot Seat" (start KBC) + Settings option

**1. TAKE A HOT SEAT**
- **Intro:** prize levels + lifelines + music info (related to today's date, or related to the upcoming questions)
- **Question screen:** audio visualizer (instead of Amitabh on screen), big option cards with singer pictures,
  voice dictating the question, timer, lifelines
- Player chooses an option → voice asks: *"Option X: \<name\> ko lock kiya jaye?"*
- Player confirms to lock, or declines (back to options)
- On lock → voice: *"Computer ji, Option X: \<name\> lock kiya jaye"* → intense bg music
- **Result declaration:** correct → voice congratulates + victory music; wrong → voice declares the result
- Correct option card flips; song + artist information shown
- Then prize-level stats + lifeline stats (same interstitial flow)
- Lifelines accommodated in between: 50:50, Phone a Friend, Audience Poll, Flip the Question (4th — decided)

**2. SETTINGS**
- Difficulty Easy / Medium / Hard → sets the timer values (45s / 30s / 20s)

**3. PHONE A FRIEND (owner's vision)**
- Backend shares the question via WhatsApp with a link: friend joins via video/audio call,
  OR friend just answers directly in a poll (single correct choice)
- Implementation phasing (do not skip): **v1** = WhatsApp share sends question + 4 options as text,
  friend replies on WhatsApp, player taps the friend's answer manually (zero backend);
  **v2** = poll link + tiny realtime backend + call link

*Mapping:* Phase 1 already implements this whole flow with stubs (voice off, sample beep clip,
lifelines show toast). Phase 2 commits below make each step real, in this exact order.

---

## PHASE 1 — Basic skeleton ✅ DONE (record of commits)

- **c1.1** iOS shell: meta tags, manifest, 180px icon, base CSS (safe-area, no-bounce, no-select)
- **c1.2** Home screen: name input (localStorage), stats cards, friends add/remove (max 3), nav buttons
- **c1.3** Hot-seat intro: 15-level ladder render, lifeline chips display, music-fact placeholder card
- **c1.4** Question screen: visualizer stub (CSS bars), 4 option cards with initial-avatars, live timer
- **c1.5** Lock flow: select → confirm modal ("Option X ko lock kiya jaye?") → suspense modal → evaluate
- **c1.6** Result interstitial: correct/wrong card states, song-info card, ladder+lifeline status, Next/Quit
- **c1.7** Game over: padaav safety-net math, stats persistence, Settings screen (difficulty→timer)

Definition of done: `node --check` clean; full loop (home→intro→Q→lock→result→gameover) clickable.

---

## PHASE 2 — Advanced skeleton (BUILD NEXT)

### 2A. Question bank & data

- **c2A.1** Extract `SAMPLE_QUESTIONS` from `app.js` → new `questions.js`; document schema:
  `{id, clip, options[4], answer, song, movie, singer, music, difficulty}` — app.js loads it, no logic change
- **c2A.2** Add 12 questions → 15 total (5 easy / 5 medium / 5 hard), all singer-identification,
  Bollywood only, options shuffled with `answer` index corrected
- **c2A.3** Add `musicFacts.json`: `{ "MM-DD": "fact string", ... }` with ~20 entries
  ("on this day in music"); intro card reads today's key, falls back to theme teaser if missing
- **c2A.4** Difficulty wiring: game pulls questions filtered by `profile.difficulty`
  (easy→easy bank, medium→mixed, hard→hard bank); 15 questions per game max
- **c2A.5** Singer pictures on option cards: add `photo` field to schema (Wikimedia Commons URL,
  freely licensed); card shows circular photo + name; fallback to initial-avatar if photo missing;
  keep images < 200KB, lazy-load

### 2B. Lifelines (real logic — one commit each)

- **c2B.1** 50:50: on use, hide 2 wrong options (never `answer`); mark `game.used.fifty`; dim button
- **c2B.2** Audience Poll: modal with 4 animated % bars; correct option weighted higher
  (easy 70% / medium 55% / hard 40%, remainder split randomly); timer paused in modal
- **c2B.3** Phone a Friend: friend picker modal (from `profile.friends`) → opens
  `https://wa.me/?text=<encoded>` with this exact template:
  `🎵 SurKBC — dost ki madad chahiye!\nSawaal: <question>\nA) <opt1>\nB) <opt2>\nC) <opt3>\nD) <opt4>\n\nSahi option ka letter reply karo!`
  → friend replies on WhatsApp → "Dost ne kya kaha?" manual A/B/C/D entry → that option
  gets locked directly (skip re-confirm); mark `game.used.phone`
- **c2B.4** Flip Question: swap current question with a backup from bank (same difficulty,
  not already asked); once per game; timer restarts for the new question
- **c2B.5** Lifeline HUD: used lifelines dimmed everywhere (question bar + result status `x/4`);
  attempting reuse → toast "Ye lifeline use ho chuki"

### 2C. Voice & audio

- **c2C.1** Set `VOICE_ENABLED=true`; verify Hindi TTS (`hi-IN`) on iOS Safari for lock/result lines;
  add Kannada-rate tuning (`rate:0.92`); cancel queue on screen change
- **c2C.2** Real clip playback: `<audio preload>` per question, play on "Clip Bajao";
  replay allowed; stop audio on lock/timeout/quit (no bleed into result)
- **c2C.3** Visualizer → real: `AudioContext` + `AnalyserNode` → canvas bars;
  resume context on user gesture (question-reveal tap); fallback to CSS bars if blocked
- **c2C.4** Music hooks: royalty-free tension loop under timer-last-10s + suspense modal;
  victory sting on correct; sad sting on wrong — placeholder `<audio>` slots with volume ducking

### 2D. Flow hardening

- **c2D.1** Quit confirmation modal ("₹X lekar quit?") on both question and result screens
- **c2D.2** Option double-tap race: ignore taps while `game.locked` or modal open (already partial — verify)
- **c2D.3** Timer edge cases: pause in ALL modals (lifeline, lock, quit-confirm); resume correctly;
  no double-interval leaks (`stopTimer` before every `startTimer`)
- **c2D.4** Empty states: no friends added → Phone-a-Friend prompts "pehle dost add karo" + deep link to home;
  question bank exhausted → graceful game-over

Definition of done: full 15-question game playable with all 4 lifelines, voice on, real clips,
no console errors, timer correct in every modal path.

---

## PHASE 3 — UI polish

### 3A. KBC broadcast feel (one commit each, transform/opacity only — 60fps on iPhone)

- **c3A.1** Timer ring: circular countdown around the timer number, turns red under 10s
- **c3A.2** Card-flip 3D on result reveal (correct card flips green, wrong pick flips red)
- **c3A.3** Ladder climb animation on intro + a mini ladder on the question screen showing current level
- **c3A.4** Suspense lighting: dim background + spotlight pulse during the "Computer ji…" modal
- **c3A.5** Victory confetti (canvas, ~2s) on correct answers from level 10+; padaav reached banner
- **c3A.6** Haptics: `navigator.vibrate` on lock (50ms), correct (pattern), wrong (long) — guarded

### 3B. iOS final pass

- **c3B.1** Add-to-Home-Screen test on real iPhone: standalone launch, splash, icon, status-bar style
- **c3B.2** Safe-area audit on every screen + modals (notch and Dynamic Island)
- **c3B.3** Perf audit: no layout thrash, images < 200KB, first paint < 1.5s on 4G

Definition of done: feels like the TV show; no jank on iPhone; all Phase-2 logic intact.

---

## Conventions for Antigravity

- Dependency-free, single deploy — must run from any static host (`kbc.harjani.me`).
- One commit = one small reviewable step from the lists above; don't batch subphases.
- Never break the PINNED iOS requirements; re-verify with iOS Safari after UI commits.
- Keep Hinglish strings; comment new logic briefly; don't restructure Phase-1 files without reason.
- After each subphase: `node --check`, click through the affected flow, report PASS/FAIL per commit.
