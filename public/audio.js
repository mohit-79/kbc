// ==========================================================================
// SurKBC — audio.js (Phase 2C Voice & Audio Engine)
// Synthesizer, Real-Time Canvas Visualizer & Hindi TTS Engine
// ==========================================================================

const VOICE_ENABLED = true;

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.analyser = null;
    this.dataArray = null;
    this.canvas = null;
    this.canvasCtx = null;
    this.animId = null;
    this.tensionOsc = null;
    this.tensionGain = null;
    this.currentAudio = null;
  }

  // Resume / Initialize Web Audio Context on user gesture
  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 64;
        this.analyser.smoothingTimeConstant = 0.8;
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      }
    } catch (e) {
      console.warn("AudioContext init error:", e);
    }
  }

  // c2C.3: Bind Real Canvas Visualizer
  bindVisualizer(canvasEl) {
    if (!canvasEl) return;
    this.canvas = canvasEl;
    this.canvasCtx = canvasEl.getContext('2d');
    this.startVisualizer();
  }

  startVisualizer() {
    if (!this.canvas || !this.canvasCtx) return;
    if (this.animId) cancelAnimationFrame(this.animId);

    const canvas = this.canvas;
    const ctx = this.canvasCtx;
    const bufferLength = this.analyser ? this.analyser.frequencyBinCount : 32;
    const data = this.dataArray || new Uint8Array(bufferLength);

    const draw = () => {
      this.animId = requestAnimationFrame(draw);
      const w = canvas.width || 340;
      const h = canvas.height || 60;

      ctx.clearRect(0, 0, w, h);

      if (this.analyser && this.ctx && this.ctx.state === 'running') {
        this.analyser.getByteFrequencyData(data);
      } else {
        // Idle breathing state
        const t = Date.now() * 0.003;
        for (let i = 0; i < bufferLength; i++) {
          data[i] = Math.sin(t + i * 0.4) * 16 + 22;
        }
      }

      const barWidth = (w / bufferLength) * 0.7;
      const gap = (w / bufferLength) * 0.3;
      let x = gap / 2;

      for (let i = 0; i < bufferLength; i++) {
        const val = data[i];
        const barH = Math.max(4, (val / 255) * h * 0.85);

        // Neon Gold to Cyan Gradient
        const grad = ctx.createLinearGradient(0, h - barH, 0, h);
        grad.addColorStop(0, '#ffd700');
        grad.addColorStop(0.5, '#00d2ff');
        grad.addColorStop(1, '#0e1a38');

        ctx.fillStyle = grad;
        const y = (h - barH) / 2;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, barH, 2);
        } else {
          ctx.rect(x, y, barWidth, barH);
        }
        ctx.fill();

        x += barWidth + gap;
      }
    };

    draw();
  }

  // c2C.2: Clip Playback with Stop on Lock/Timeout/Quit (supports streaming preview URL or synthesized signature)
  playClip(clipUrlOrName) {
    this.init();
    this.stopClip();

    if (typeof clipUrlOrName === 'string' && (clipUrlOrName.startsWith('http://') || clipUrlOrName.startsWith('https://') || clipUrlOrName.endsWith('.mp3') || clipUrlOrName.endsWith('.m4a'))) {
      try {
        const audio = new Audio(clipUrlOrName);
        audio.crossOrigin = "anonymous";
        audio.volume = 0.85;
        this.currentAudio = audio;

        // Try connecting to Web Audio analyser for waveform visualizer if CORS allows
        if (this.ctx) {
          try {
            const source = this.ctx.createMediaElementSource(audio);
            if (this.analyser) {
              source.connect(this.analyser);
              this.analyser.connect(this.ctx.destination);
            } else {
              source.connect(this.ctx.destination);
            }
          } catch (corsErr) {
            // If cross-origin restrictions block Web Audio node, native audio still plays cleanly
          }
        }

        audio.play().catch(e => {
          console.warn("Stream preview play failed (user interaction required or network error):", e);
        });
        return;
      } catch (e) {
        console.warn("Error creating preview audio:", e);
      }
    }

    // Synthesized melodic signature hook connected to analyser as fallback
    if (this.ctx) {
      const melodyChords = [261.63, 329.63, 392.00, 523.25, 440.00, 392.00];
      melodyChords.forEach((freq, idx) => {
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.3);

          gain.gain.setValueAtTime(0, this.ctx.currentTime + idx * 0.3);
          gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + idx * 0.3 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.3 + 0.35);

          osc.connect(gain);
          if (this.analyser) {
            gain.connect(this.analyser);
            this.analyser.connect(this.ctx.destination);
          } else {
            gain.connect(this.ctx.destination);
          }

          osc.start(this.ctx.currentTime + idx * 0.3);
          osc.stop(this.ctx.currentTime + idx * 0.3 + 0.4);
        } catch (e) {}
      });
    }
  }

  stopClip() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {}
      this.currentAudio = null;
    }
  }

  // Play real MP3 track with loop or one-shot, and synth fallback
  playMusicTrack(trackName, loop = false, volume = 0.5) {
    this.init();
    try {
      const audio = new Audio(`music/${trackName}.mp3`);
      audio.volume = volume;
      audio.loop = loop;
      audio.play().catch(e => console.warn(`Audio play failed for ${trackName}:`, e));
      return audio;
    } catch (e) {
      console.warn("playMusicTrack error:", e);
      return null;
    }
  }

  // Background Ambience / Beds
  playIntroBg() {
    this.stopBgMusic();
    this.bgAudio = this.playMusicTrack('intro_bg', true, 0.4);
  }

  playQuestionBed() {
    this.stopBgMusic();
    this.bgAudio = this.playMusicTrack('question_bed', true, 0.35);
  }

  stopBgMusic() {
    if (this.bgAudio) {
      try {
        this.bgAudio.pause();
        this.bgAudio.currentTime = 0;
      } catch (e) {}
      this.bgAudio = null;
    }
  }

  // c2C.4: Tension Loop & Stings
  startTensionLoop() {
    this.init();
    this.stopTensionLoop();
    this.stopBgMusic();

    try {
      this.tensionAudio = this.playMusicTrack('suspense', true, 0.6);
    } catch (e) {}

    if (!this.tensionAudio && this.ctx) {
      try {
        this.tensionOsc = this.ctx.createOscillator();
        this.tensionGain = this.ctx.createGain();

        this.tensionOsc.type = 'sawtooth';
        this.tensionOsc.frequency.setValueAtTime(55, this.ctx.currentTime);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(140, this.ctx.currentTime);

        this.tensionGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
        this.tensionGain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 1.2);

        this.tensionOsc.connect(filter);
        filter.connect(this.tensionGain);
        if (this.analyser) {
          this.tensionGain.connect(this.analyser);
          this.analyser.connect(this.ctx.destination);
        } else {
          this.tensionGain.connect(this.ctx.destination);
        }

        this.tensionOsc.start();
      } catch (e) {}
    }
  }

  stopTensionLoop() {
    if (this.tensionAudio) {
      try {
        this.tensionAudio.pause();
        this.tensionAudio.currentTime = 0;
      } catch (e) {}
      this.tensionAudio = null;
    }
    if (this.tensionOsc) {
      try {
        this.tensionOsc.stop();
        this.tensionOsc.disconnect();
      } catch (e) {}
      this.tensionOsc = null;
    }
  }

  playVictorySting() {
    this.stopBgMusic();
    this.stopTensionLoop();
    this.playMusicTrack('correct', false, 0.7);

    this.init();
    if (!this.ctx) return;
    const chords = [523.25, 659.25, 783.99, 1046.50];
    chords.forEach((freq, idx) => {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + idx * 0.05);
        osc.stop(this.ctx.currentTime + 1.3);
      } catch (e) {}
    });
  }

  playWrongSting() {
    this.stopBgMusic();
    this.stopTensionLoop();
    this.playMusicTrack('wrong', false, 0.7);

    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(55, this.ctx.currentTime + 0.8);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.8);
    } catch (e) {}
  }

  playLifelineSting() {
    this.playMusicTrack('lifeline', false, 0.6);
  }

  playPadaavSting() {
    this.playMusicTrack('padaav', false, 0.7);
  }

  playWinFanfare() {
    this.stopBgMusic();
    this.stopTensionLoop();
    this.playMusicTrack('victory', false, 0.75);
  }

  // c2C.1: Hindi TTS with Kannada-rate tuning (rate: 0.92) & cancel on screen change
  speak(text, onDone = null) {
    if (!VOICE_ENABLED || !('speechSynthesis' in window)) {
      if (onDone) onDone();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Cancel any queued speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92; // Pinned Kannada-rate tuning
      utterance.pitch = 0.78; // Amitabh deep baritone

      // Pick Hindi / Indian English voice
      const voices = window.speechSynthesis.getVoices();
      const hiVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('IN')) || voices[0];
      if (hiVoice) utterance.voice = hiVoice;

      let called = false;
      const finish = () => {
        if (!called) {
          called = true;
          if (onDone) onDone();
        }
      };

      utterance.onend = finish;
      utterance.onerror = finish;
      // 3.5s safety timeout so game flow never hangs
      setTimeout(finish, 3500);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      if (onDone) onDone();
    }
  }

  cancelVoice() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

window.audioEngine = new AudioEngine();
