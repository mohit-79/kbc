"""
SurKBC — generate_voice.py (XTTS v2 Pre-Generator for Amitabh Bachchan Voice)
Generates audio/<key>.mp3 for all game voice lines from dialogues.json using Coqui XTTS v2.

Requirements:
  pip install TTS torch
Speaker sample:
  resources/amitabh_sample.wav (clean 10-15s WAV sample)
"""

import json
import os
import sys

def main():
    dialogues_path = "dialogues.json"
    if not os.path.exists(dialogues_path):
        dialogues_path = "surkbc-resources/surkbc-resources/dialogues.json"
    
    if not os.path.exists(dialogues_path):
        print(f"Error: {dialogues_path} not found.")
        return

    with open(dialogues_path, "r", encoding="utf-8") as f:
        dialogues = json.load(f)

    # Filter batch 1: essential game voice lines (welcome, prizes, lock flow, padaav, lifelines)
    batch1 = [d for d in dialogues if not d.get("key", "").startswith("songinfo_")]
    print(f"Total dialogues: {len(dialogues)} | Batch 1 (game lines): {len(batch1)}")

    os.makedirs("audio", exist_ok=True)

    sample_path = "amitabh_sample.wav"
    if not os.path.exists(sample_path):
        sample_path = "resources/amitabh_sample.wav"

    try:
        import torch
        from TTS.api import TTS

        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using device: {device}")
        
        if not os.path.exists(sample_path):
            print(f"Warning: Reference voice sample '{sample_path}' not found.")
            print("Please place a clean 10-15s WAV clip of Amitabh Bachchan at 'resources/amitabh_sample.wav' and rerun.")
            return

        print("Loading Coqui XTTS v2 model...")
        tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)

        done, skipped = 0, 0
        for item in batch1:
            key = item.get("key")
            text = item.get("text", "")
            out_file = os.path.join("audio", f"{key}.mp3")

            if os.path.exists(out_file) and os.path.getsize(out_file) > 1024:
                skipped += 1
                continue

            print(f"Generating [{key}]: {text[:30]}...")
            tts.tts_to_file(
                text=text,
                speaker_wav=sample_path,
                language="hi",
                file_path=out_file
            )
            done += 1
            if done % 10 == 0:
                print(f"Progress: {done} generated, {skipped} skipped.")

        print(f"\nCompleted! Generated: {done}, Already existed: {skipped}.")

    except ImportError as e:
        print(f"XTTS/Torch not installed in this environment ({e}).")
        print("Run `pip install TTS torch` to enable offline generation.")
        print("Note: The SurKBC web app dynamically falls back to the tuned deep-baritone speech synthesis for all lines!")

if __name__ == "__main__":
    main()
