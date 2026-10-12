# 🎵 SurKBC

**SurKBC** is a Bollywood music quiz web application inspired by *Kaun Banega Crorepati* (KBC). Players take the hot seat, listen to audio previews, identify playback singers across eras, use classic lifelines, and climb the 15-question ladder to ₹1 Crore.

Live: [https://kbc.harjani.me](https://kbc.harjani.me)

---

## ✨ Features

- **Dynamic Question Engine**: Generates questions on the fly from a 3,000+ Bollywood song catalog across 6 eras (Golden, Retro, 90s, 2000s, 2010s, Modern).
- **Smart Distractor Generation**: Ensures distractors match the target singer's gender, active era, genre clusters, and vocal styles.
- **Smart Vocal Seek**: Audio preview playback skips introductory instruments and starts directly at the vocals.
- **Classic KBC Lifelines**:
  - **50:50**: Removes two incorrect options.
  - **Audience Poll**: Weighted poll simulation based on question difficulty.
  - **Flip the Question**: Swaps the current song with a fresh equivalent question.
  - **Phone-a-Friend**: Sends a question link via WhatsApp (with video/audio call options and real-time polling fallback).
- **Audio & Visualizer**: Realistic studio background, suspense beds, timer countdowns, and Web Audio API visualizer.
- **Hinglish Host Voice**: Hindi text-to-speech for host announcements and locks.
- **Progress & Lifetime Stats**: Tracks games played, highest winnings, and cumulative earnings (`Kul Kamai`).
- **iOS PWA Support**: Standalone full-screen experience with notch and safe-area support.

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3 (No framework, zero build step).
- **Backend / Edge**: Cloudflare Workers, Cloudflare D1 (Serverless SQLite), Durable Objects for real-time signaling.
- **Static Assets**: Hosted via Cloudflare Workers Static Assets (`/public`).

---

## 🚀 Getting Started

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/mohit-79/kbc.git
   cd kbc
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run locally using Wrangler:
   ```bash
   npm run dev
   ```

---

## 🚢 Deployment

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

---

## 📄 License

MIT
