# SurKBC Voice Guide — Amitabh-style Hindi voice via Coqui XTTS v2 (for Antigravity)

> Goal: pre-generate every voice line of the game as MP3s in a cloned
> Amitabh-style Hindi voice, so the iPhone app just plays files (offline,
> zero latency, no runtime TTS).
>
> Input you already have: `resources/dialogues.json` — 817 clips, all text in
> **Devanagari Hindi** (XTTS v2's Hindi model pronounces Devanagari correctly;
> do NOT convert to romanized text).
> Output: `audio/<key>.mp3` for every `key` in dialogues.json (e.g.
> `audio/lock_ask_B_atif_aslam.mp3`). The app plays files purely by key.

## Step 1 — Install XTTS v2 (owner's PC)

```bash
pip install TTS
```

This installs the Coqui TTS package (community-maintained; the company shut
down but the code works). Model id: `tts_models/multilingual/multi-dataset/xtts_v2`.
First run downloads ~2 GB. GPU (CUDA) strongly recommended — CPU works but is
~6x slower. Verify:

```bash
python -c "from TTS.api import TTS; print('ok')"
```

## Step 2 — Prepare the voice sample (needs the OWNER, ~5 min)

1. Pick a **clean** 10–15 second Amitabh clip — solo speech, **no background
   music**, no crowd noise. A KBC promo/interview on YouTube works.
2. Download + trim to a 12s WAV:

```bash
yt-dlp -x --audio-format wav -o amitabh_raw.wav "<YOUTUBE_URL>"
ffmpeg -i amitabh_raw.wav -ss 00:00:08 -t 00:00:12 -ar 22050 -ac 1 -c:a pcm_s16le amitabh_sample.wav
```

3. Listen to `amitabh_sample.wav` — if you hear music/effects, pick a
   different timestamp. Sample quality = clone quality. Keep this file private.

## Step 3 — Batch-generate all clips

Save as `resources/generate_voice.py` and run it on the owner's PC:

```python
import json, os
import torch
from TTS.api import TTS

device = "cuda" if torch.cuda.is_available() else "cpu"
print("Using device:", device)
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)

dialogues = json.load(open("resources/dialogues.json", encoding="utf-8"))
os.makedirs("audio", exist_ok=True)

done, skipped = 0, 0
for d in dialogues:
    out = f"audio/{d['key']}.mp3"
    if os.path.exists(out):
        skipped += 1
        continue  # resume-safe: re-running skips finished clips
    tts.tts_to_file(
        text=d["text"],
        speaker_wav="resources/amitabh_sample.wav",
        language="hi",
        file_path=out,
    )
    done += 1
    if done % 25 == 0:
        print(f"  {done} generated, {skipped} skipped...")

print(f"DONE: {done} generated, {skipped} already existed.")
```

Time estimates for 4,016 clips: GPU ≈ 8–9 hrs · CPU = not practical (~50 hrs).
**Do it in two batches:** batch 1 = everything EXCEPT `songinfo_*` keys
(817 clips: the full playable game — welcome, lock flow, results, lifelines,
prizes; GPU ≈ 2 hrs, CPU overnight) · batch 2 = `songinfo_*` (3,199 back-card
lines; GPU-only recommended, run over a weekend). The script resumes, so
interruptions are free. Filter batch 1 with:
`[d for d in dialogues if not d["key"].startswith("songinfo_")]`.

## Step 4 — Verify

1. `ls audio | wc -l` must equal the number of entries in dialogues.json (817).
2. Spot-listen to 5 files: `welcome.mp3`, one `lock_ask_*`, one `lock_do_*`,
   one `reveal_*`, `prize_10000000.mp3` — voice consistent, Hindi natural.
3. Sizes: each MP3 should be ~20–80 KB. Anything < 5 KB is a failed render —
   delete it and re-run the script.

## Step 5 — Ship with the app

- Copy `audio/` next to `index.html` (Cloudflare Pages serves it statically).
- `app.js` plays by convention, no manifest needed:
  `new Audio('audio/' + key + '.mp3').play()`
  where key = `lock_ask_B_atif_aslam`, `welcome`, `prize_1000`, etc.
- Keep the existing `speak()` hi-IN system-TTS path as fallback when a file
  is missing (offline safety).

## Fallback (if XTTS will not run)

Use the in-browser `hi-IN` system TTS already stubbed in app.js (c2C.1).
Robotic, but zero setup and free.

## Legal note (tell the owner once)

Cloning a real celebrity's voice touches likeness rights. Personal,
non-commercial use (this game) is low-risk — but do NOT publish the cloned
voice files publicly, sell them, or use them in monetized content.
