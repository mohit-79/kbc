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
  playClip(clipUrlOrName, onDone = null) {
    this.init();
    this.stopClip();

    let safetyTimer = null;
    const finish = () => {
      if (!finished) {
        finished = true;
        if (safetyTimer) {
          clearTimeout(safetyTimer);
          safetyTimer = null;
        }
        if (onDone) onDone();
      }
    };

    if (typeof clipUrlOrName === 'string' && (clipUrlOrName.startsWith('http://') || clipUrlOrName.startsWith('https://') || clipUrlOrName.endsWith('.mp3') || clipUrlOrName.endsWith('.m4a'))) {
      try {
        const audio = new Audio(clipUrlOrName);
        audio.volume = 0.85;
        this.currentAudio = audio;

        // When clip completes naturally, invoke callback
        audio.onended = () => {
          setTimeout(finish, 400); // 400ms musical breath before reciting options
        };
        audio.onerror = finish;
        // 14s safety timeout for long song clips
        safetyTimer = setTimeout(finish, 14000);

        audio.play().catch(e => {
          console.warn("Stream preview play error:", e);
          finish();
        });
        return;
      } catch (e) {
        console.warn("Error creating preview audio:", e);
        finish();
        return;
      }
    }

    // Synthesized melodic signature hook connected to analyser as fallback
    if (this.ctx) {
      const melodyChords = [261.63, 329.63, 392.00, 523.25, 440.00, 392.00];
      setTimeout(finish, melodyChords.length * 300 + 400);
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

  // Fix 7: XTTS Pre-Generated Amitabh Bachchan Voice Player with System TTS Fallback
  playVoice(voiceKey, fallbackText = "", onDone = null) {
    if (!VOICE_ENABLED) {
      if (onDone) onDone();
      return;
    }

    this.init();
    this.cancelVoice();

    let finished = false;
    const doneCallback = () => {
      if (!finished) {
        finished = true;
        if (onDone) onDone();
      }
    };

    if (voiceKey) {
      try {
        const audioPath = `audio/${voiceKey}.mp3`;
        const voiceAudio = new Audio(audioPath);
        voiceAudio.volume = 0.95;

        voiceAudio.onended = () => doneCallback();
        voiceAudio.onerror = () => {
          // Fall back to Hindi Baritone Web Speech Synthesis
          if (fallbackText) {
            this.speak(fallbackText, doneCallback);
          } else {
            doneCallback();
          }
        };

        this.currentVoiceAudio = voiceAudio;
        const playPromise = voiceAudio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            if (fallbackText) {
              this.speak(fallbackText, doneCallback);
            } else {
              doneCallback();
            }
          });
        }
        return;
      } catch (e) {
        // Fall back to speak
      }
    }

    if (fallbackText) {
      this.speak(fallbackText, doneCallback);
    } else {
      doneCallback();
    }
  }

  // Fix 1 & 2: High-Fidelity Microsoft Edge Neural Hindi TTS (/api/tts) with Native Devanagari Mapping
  speak(text, onDone = null) {
    if (!VOICE_ENABLED || !text) {
      if (onDone) onDone();
      return;
    }

    this.init();
    this.cancelVoice();

    let finished = false;
    const finish = () => {
      if (!finished) {
        finished = true;
        if (onDone) onDone();
      }
    };

    // Auto-transliterate common Romanized host keywords to native Devanagari for natural human Hindi phonetics
    let devanagariText = text;
    const translitMap = [
      [/Option A/gi, "ऑप्शन ए"],
      [/Option B/gi, "ऑप्शन बी"],
      [/Option C/gi, "ऑप्शन सी"],
      [/Option D/gi, "ऑप्शन डी"],
      [/Pehla sawaal aapki screen par —/gi, "पहला सवाल आपकी स्क्रीन पर..."],
      [/Agla sawaal aapki screen par —/gi, "अगला सवाल आपकी स्क्रीन पर..."],
      [/yeh gaane/gi, "इस गाने"],
      [/ka gaayak kaun hai\?/gi, "के गायक कौन हैं?"],
      [/Aapka samay shuru hota hai ab!/gi, "आपका समय शुरू होता है... अब!"],
      [/ko lock kiya jaye\?/gi, "को लॉक किया जाए?"],
      [/Computer ji, lock kar dijiye!/gi, "कंप्यूटर जी... लॉक कर दीजिए!"],
      [/Bilkul sahi jawaab! Adbhut! Aap jeet chuke hain/gi, "बिल्कुल सही जवाब! अद्भुत! आप जीत चुके हैं"],
      [/Galat jawaab! Sahi uttar tha/gi, "गलत जवाब! सही उत्तर था"],
      [/Aapne jeete hain/gi, "आपने जीते हैं"],
      [/Aap yahan se bina kisi dhanraashi ke jaa rahe hain/gi, "आप यहाँ से बिना किसी धनराशि के जा रहे हैं"],
      [/Namaskar! Main hoon Amarnath Bachpan, aur aap dekh rahe hain Kaun Banega Crorepati! Shuru karte hain khel bina kisi deri ke!/gi,
       "नमस्कार! मैं हूँ अमरनाथ बच्चन, और आप देख रहे हैं कौन बनेगा करोड़पति! शुरू करते हैं खेल बिना किसी देरी के!"]
    ];

    for (const [pattern, dev] of translitMap) {
      devanagariText = devanagariText.replace(pattern, dev);
    }

    // Read voice preferences from profile or AudioEngine settings
    const voiceMode = (window.profile && window.profile.voiceMode) || "madhur";
    const userPitchHz = (window.profile && typeof window.profile.voicePitch === "number") ? window.profile.voicePitch : -6;
    const userSpeedMult = (window.profile && typeof window.profile.voiceSpeed === "number") ? window.profile.voiceSpeed : 1.0;

    // Device Native Voice mode
    if (voiceMode === "device") {
      this.speakFallback(devanagariText, finish, userSpeedMult, userPitchHz);
      return;
    }

    // Server-side Neural Voice mode
    let serverRate = "-4%";
    let serverPitch = `${userPitchHz}Hz`;

    if (voiceMode === "rj") {
      serverRate = "+12%";
      serverPitch = "+2Hz";
    } else if (voiceMode === "swara") {
      serverRate = "0%";
      serverPitch = "0Hz";
    } else {
      // Custom sliders applied to Amarnath
      const pctRate = Math.round((userSpeedMult - 1.0) * 100) - 4;
      serverRate = (pctRate >= 0 ? `+${pctRate}%` : `${pctRate}%`);
      serverPitch = `${userPitchHz}Hz`;
    }

    // 1. Try Microsoft Audio Endpoint with client acoustic modulation
    try {
      const ttsUrl = `/api/tts?text=${encodeURIComponent(devanagariText.trim())}&voice=${encodeURIComponent(voiceMode)}&rate=${encodeURIComponent(serverRate)}&pitch=${encodeURIComponent(serverPitch)}`;
      const neuralAudio = new Audio(ttsUrl);
      neuralAudio.volume = 1.0;

      const applyAcoustics = () => {
        try {
          if (voiceMode === "rj") {
            neuralAudio.playbackRate = 1.25;
            neuralAudio.preservesPitch = false;
            neuralAudio.mozPreservesPitch = false;
            neuralAudio.webkitPreservesPitch = false;
          } else if (voiceMode === "swara") {
            neuralAudio.playbackRate = 1.15;
            neuralAudio.preservesPitch = false;
            neuralAudio.mozPreservesPitch = false;
            neuralAudio.webkitPreservesPitch = false;
          } else {
            // Amarnath Bachchan / Custom Sliders
            const speedFactor = Math.max(0.7, Math.min(1.4, userSpeedMult));
            let rateFactor = speedFactor;
            if (userPitchHz <= -6) {
              rateFactor = 0.82 * speedFactor; // Deep baritone resonance
            } else if (userPitchHz <= -3) {
              rateFactor = 0.90 * speedFactor;
            } else if (userPitchHz >= 2) {
              rateFactor = 1.18 * speedFactor;
            }
            neuralAudio.playbackRate = rateFactor;
            neuralAudio.preservesPitch = false;
            neuralAudio.mozPreservesPitch = false;
            neuralAudio.webkitPreservesPitch = false;
          }
        } catch (e) {}
      };

      applyAcoustics();
      neuralAudio.addEventListener('loadedmetadata', applyAcoustics);
      neuralAudio.addEventListener('play', applyAcoustics);

      this.currentVoiceAudio = neuralAudio;

      neuralAudio.onended = finish;
      neuralAudio.onerror = () => {
        // Fall back to client SpeechSynthesis
        this.speakFallback(devanagariText, finish, userSpeedMult, userPitchHz);
      };

      // Dynamic safety timeout
      const safetyMs = Math.max(5000, devanagariText.length * 120);
      setTimeout(finish, safetyMs);

      neuralAudio.play().catch(() => {
        this.speakFallback(devanagariText, finish, userSpeedMult, userPitchHz);
      });
      return;
    } catch (e) {
      this.speakFallback(devanagariText, finish, userSpeedMult, userPitchHz);
    }
  }

  speakFallback(text, onDone = null, speed = 1.0, pitchHz = -6) {
    if (!('speechSynthesis' in window)) {
      if (onDone) onDone();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      const voiceMode = (window.profile && window.profile.voiceMode) || "madhur";

      // Rate: from 0.75x to 1.4x
      let calculatedRate = speed;
      if (voiceMode === "rj") calculatedRate = 1.25;
      else if (voiceMode === "madhur" && calculatedRate === 1.0) calculatedRate = 0.88;
      utterance.rate = Math.max(0.65, Math.min(1.5, calculatedRate));

      // Pitch: from 0.5 (deep baritone) to 1.5 (high female/peppy)
      let calculatedPitch = 1.0 + (pitchHz / 12);
      if (voiceMode === "madhur") calculatedPitch = Math.min(calculatedPitch, 0.72); // Deep baritone
      else if (voiceMode === "swara") calculatedPitch = 1.25; // Distinct female tone
      else if (voiceMode === "rj") calculatedPitch = 1.15;
      utterance.pitch = Math.max(0.45, Math.min(1.6, calculatedPitch));

      const voices = window.speechSynthesis.getVoices();
      const hiVoices = voices.filter(v => v.lang.startsWith('hi') || v.lang.includes('IN'));

      if (voiceMode === "swara") {
        // Find female voice
        const female = hiVoices.find(v => /female|swara|kalpana|geeta|zira/i.test(v.name)) ||
                       voices.find(v => /female|zira|samantha|kavya/i.test(v.name)) ||
                       hiVoices[0];
        if (female) utterance.voice = female;
      } else if (voiceMode === "madhur" || voiceMode === "rj") {
        // Find male voice
        const male = hiVoices.find(v => /male|madhur|rishi|hemant|david|prabhat/i.test(v.name)) ||
                     voices.find(v => /male|david|rishi/i.test(v.name)) ||
                     hiVoices[0];
        if (male) utterance.voice = male;
      } else if (hiVoices.length) {
        utterance.voice = hiVoices[0];
      }

      let called = false;
      const done = () => {
        if (!called) {
          called = true;
          if (onDone) onDone();
        }
      };

      utterance.onend = done;
      utterance.onerror = done;
      setTimeout(done, Math.max(4500, text.length * 100));
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      if (onDone) onDone();
    }
  }

  cancelVoice() {
    if (this.currentVoiceAudio) {
      try {
        this.currentVoiceAudio.pause();
        this.currentVoiceAudio.currentTime = 0;
      } catch (e) {}
      this.currentVoiceAudio = null;
    }
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
  }
}

window.audioEngine = new AudioEngine();
