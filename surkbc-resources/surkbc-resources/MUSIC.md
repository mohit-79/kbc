# SurKBC — Background Music Pack

9 tracks, iOS-ready. Use files from `web/` (mp3, 44.1kHz, 160kbps, loudness-normalized
to the same level). Originals kept in `music/` — note 4 of them are `.ogg`, which
**will not play in iOS Safari**, so always ship the `web/` versions.

## The list

| File | Duration | Game moment |
|---|---|---|
| `intro_bg.mp3` | 2:36 | Title / game intro screen |
| `question_bed.mp3` | 2:12 | Bed under the question being read |
| `suspense.mp3` | 3:12 | After locking an answer, before the reveal |
| `tick.mp3` | 2:51 | Timer countdown bed (music bed, not tick-tock SFX) |
| `lifeline.mp3` | 0:05 | Lifeline jingle sting |
| `correct.mp3` | 0:02 | Sahi jawab sting |
| `wrong.mp3` | 0:02 | Galat jawab sting |
| `padaav.mp3` | 0:04 | Padaav (milestone) sting |
| `victory.mp3` | 1:37 | Win / crorepati moment |

Total: ~12.7 min, 15 MB.

## License note

The 5 long beds are **Kevin MacLeod (incompetech.com)** royalty-free tracks, not the
actual KBC music: "Five Armies" (intro), "Darkening Developments" (question bed),
"The Descent" (suspense), "Intrepid" (timer), "Heroic Age" (victory).
They are **CC-BY 4.0** — free to use, but you must credit "Kevin MacLeod
(incompetech.com)" if the game is published/shared.
The 4 short stingers are from OpenGameArt.org: "Total Fail" (wrong) and
"And the winner is" (padaav) are **CC0**; "Fanfare 01" (lifeline) is
**CC-BY-SA 4.0** (credit + share-alike); the 8-bit fanfare (correct) —
check its content page for the exact license.

## Tech notes

- All `web/` files decode cleanly end-to-end (verified 2026-10-10), durations match sources.
- Loudness normalized: originals varied ~8 dB in mean volume, now consistent.
- `question_bed.mp3` carries embedded cover art — harmless, ignored by audio players.
