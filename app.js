// ==========================================================================
// SurKBC — app.js (Phase 2B Integrated — Real Lifelines Logic)
// Screens: screen-home, screen-intro, screen-question, screen-result, screen-gameover, screen-settings
// ==========================================================================

// --- CONFIG & CONSTANTS ---
const PADAAV = [4, 9]; // 0-based indices for guaranteed levels: Level 5 (₹10,000) & Level 10 (₹3,20,000)

const KBC_LADDER = [
  { level: 1, prize: "₹ 1,000", amount: 1000 },
  { level: 2, prize: "₹ 2,000", amount: 2000 },
  { level: 3, prize: "₹ 3,000", amount: 3000 },
  { level: 4, prize: "₹ 5,000", amount: 5000 },
  { level: 5, prize: "₹ 10,000", amount: 10000, padaav: true },
  { level: 6, prize: "₹ 20,000", amount: 20000 },
  { level: 7, prize: "₹ 40,000", amount: 40000 },
  { level: 8, prize: "₹ 80,000", amount: 80000 },
  { level: 9, prize: "₹ 1,60,000", amount: 160000 },
  { level: 10, prize: "₹ 3,20,000", amount: 320000, padaav: true },
  { level: 11, prize: "₹ 6,40,000", amount: 640000 },
  { level: 12, prize: "₹ 12,50,000", amount: 1250000 },
  { level: 13, prize: "₹ 25,00,000", amount: 2500000 },
  { level: 14, prize: "₹ 50,00,000", amount: 5000000 },
  { level: 15, prize: "₹ 1,00,00,000", amount: 10000000, padaav: true }
];

const TIMER_PRESETS = {
  easy: 45,
  medium: 30,
  hard: 20
};

// --- SINGER GALLERY PHOTO REGISTRY (From surkbc-resources & images/singers) ---
const SINGER_PHOTO_MAP = {
  "arijit singh": "images/singers/arijit.jpg",
  "sonu nigam": "images/singers/sonu.jpg",
  "kk": "images/singers/kk.jpg",
  "mohd. rafi": "images/singers/rafi.jpg",
  "mohammed rafi": "images/singers/rafi.jpg",
  "kishore kumar": "images/singers/kishore.jpg",
  "shaan": "images/singers/shaan.jpg",
  "udit narayan": "images/singers/uditnarayan.jpg",
  "lucky ali": "images/singers/luckyali.jpg",
  "mohit chauhan": "images/singers/mohit.jpg",
  "sunidhi chauhan": "images/singers/sunidhi.jpg",
  "shreya ghoshal": "images/singers/shreya.jpg",
  "lata mangeshkar": "images/singers/lata.jpg",
  "alka yagnik": "images/singers/alkayagnik.jpg",
  "mukesh": "images/singers/mukesh.jpg",
  "manna dey": "images/singers/manna.jpg",
  "sukhwinder singh": "images/singers/sukhwinder.jpg",
  "daler mehndi": "images/singers/dalermehndi.jpg",
  "mika singh": "images/singers/mikasingh.jpg",
  "asha bhosle": "images/singers/ashabhosle.jpg",
  "geeta dutt": "images/singers/geetadutt.jpg",
  "noor jehan": "images/singers/noorjehan.jpg",
  "atif aslam": "images/singers/atifaslam.jpg",
  "rahat fateh ali khan": "images/singers/rahatfatehalikhan.jpg",
  "javed ali": "images/singers/javedali.jpg",
  "neha kakkar": "images/singers/nehakakkar.jpg",
  "monali thakur": "images/singers/monalithakur.jpg",
  "kanika kapoor": "images/singers/kanikakapoor.jpg",
  "hemant kumar": "images/singers/hemantkumar.jpg",
  "talat mahmood": "images/singers/talatmahmood.jpg",
  "hariharan": "images/singers/hariharan.jpg",
  "s. p. balasubrahmanyam": "images/singers/spbalasubrahmanyam.jpg",
  "k. j. yesudas": "images/singers/kjyesudas.jpg",
  "bhimsen joshi": "images/singers/bhimsenjoshi.jpg",
  "pandit jasraj": "images/singers/panditjasraj.jpg",
  "k. l. saigal": "images/singers/klsaigal.jpg",
  "bhupen hazarika": "images/singers/bhupenhazarika.jpg",
  "kailash kher": "images/singers/kailashkher.jpg",
  "suman kalyanpur": "images/singers/sumankalyanpur.jpg",
  "a. r. rahman": "images/singers/arrahman.jpg"
};

let gallerySingers = {};
fetch('singers.json')
  .then(res => res.json())
  .then(data => {
    if (Array.isArray(data)) {
      data.forEach(s => {
        if (s.name && s.photo) {
          gallerySingers[s.name.toLowerCase().trim()] = s.photo;
        }
      });
    }
  })
  .catch(() => {});

function getSingerPhoto(name) {
  if (!name) return "images/singers/arijit.jpg";
  const clean = name.toLowerCase().trim();
  if (SINGER_PHOTO_MAP[clean]) return SINGER_PHOTO_MAP[clean];
  if (gallerySingers[clean]) return gallerySingers[clean];

  const norm = clean.replace(/^mohd\.?\s+/i, 'mohammed ').replace(/[^a-z0-9]/g, '');
  for (const [k, v] of Object.entries(SINGER_PHOTO_MAP)) {
    const kNorm = k.replace(/^mohd\.?\s+/i, 'mohammed ').replace(/[^a-z0-9]/g, '');
    if (kNorm === norm || norm.includes(kNorm) || kNorm.includes(norm)) {
      return v;
    }
  }
  for (const [k, v] of Object.entries(gallerySingers)) {
    const kNorm = k.replace(/^mohd\.?\s+/i, 'mohammed ').replace(/[^a-z0-9]/g, '');
    if (kNorm === norm || norm.includes(kNorm) || kNorm.includes(norm)) {
      return v;
    }
  }

  // Multi-artist split (e.g., "A & B")
  const parts = name.split(/&|,/).map(p => p.trim());
  if (parts.length > 1) {
    for (const part of parts) {
      const pPhoto = getSingerPhoto(part);
      if (pPhoto && !pPhoto.endsWith('arijit.jpg')) {
        return pPhoto;
      }
    }
  }

  return `images/singers/${norm}.jpg`;
}

// --- STATE MANAGEMENT ---
let profile = loadProfile();
let musicFactsData = null;

fetch('musicFacts.json')
  .then(res => res.json())
  .then(data => { musicFactsData = data; })
  .catch(err => console.warn('Could not load musicFacts.json:', err));

function loadProfile() {
  try {
    const raw = localStorage.getItem('surkbc_profile');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    name: "Contestant",
    highScore: "₹ 0",
    gamesPlayed: 0,
    difficulty: "easy",
    friends: [
      { id: 1, name: "Rahul", phone: "" },
      { id: 2, name: "Priya", phone: "" }
    ]
  };
}

// --- CLOUDFLARE WORKERS REST API CLIENT ---
const API_BASE = "";

function getDeviceToken() {
  try {
    let token = localStorage.getItem('surkbc_device_token');
    if (!token) {
      token = 'dev-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('surkbc_device_token', token);
    }
    return token;
  } catch (e) {
    return 'dev-fallback';
  }
}

async function syncProfileFromServer() {
  try {
    const res = await fetch(`${API_BASE}/api/profile?name=${encodeURIComponent(profile.name || 'Contestant')}`, {
      headers: { 'X-Device-Token': getDeviceToken() }
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data && data.profile) {
      if (data.profile.highScore && data.profile.highScore !== '₹ 0') {
        profile.highScore = data.profile.highScore;
      }
      if (typeof data.profile.gamesPlayed === 'number' && data.profile.gamesPlayed > profile.gamesPlayed) {
        profile.gamesPlayed = data.profile.gamesPlayed;
      }
      if (Array.isArray(data.profile.friends) && data.profile.friends.length > 0) {
        profile.friends = data.profile.friends;
      }
      saveProfile(false);
      renderHome();
    }
  } catch (e) {}
}

async function pushProfileToServer() {
  try {
    await fetch(`${API_BASE}/api/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Token': getDeviceToken()
      },
      body: JSON.stringify({
        name: profile.name,
        highScore: profile.highScore,
        gamesPlayed: profile.gamesPlayed,
        friends: profile.friends
      })
    });
  } catch (e) {}
}

async function startServerSession() {
  try {
    const res = await fetch(`${API_BASE}/api/session/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Token': getDeviceToken()
      },
      body: JSON.stringify({ playerName: profile.name })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.sessionId) {
        game.sessionId = data.sessionId;
        saveGameState();
      }
    }
  } catch (e) {}
}

async function syncServerSession() {
  if (!game.sessionId) return;
  try {
    await fetch(`${API_BASE}/api/session/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Token': getDeviceToken()
      },
      body: JSON.stringify({
        sessionId: game.sessionId,
        qIndex: game.qIndex,
        currentPrize: game.currentPrize,
        guaranteedPrize: game.guaranteedPrize,
        usedLifelines: game.used
      })
    });
  } catch (e) {}
}

async function endServerSession(status = 'ended') {
  if (!game.sessionId) return;
  try {
    await fetch(`${API_BASE}/api/session/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Token': getDeviceToken()
      },
      body: JSON.stringify({
        sessionId: game.sessionId,
        finalPrize: game.guaranteedPrize,
        status
      })
    });
  } catch (e) {}
}

function saveProfile(shouldPush = true) {
  try {
    localStorage.setItem('surkbc_profile', JSON.stringify(profile));
  } catch (e) {}
  if (shouldPush) {
    pushProfileToServer();
  }
}

function getQuestionsForGame() {
  if (typeof SAMPLE_QUESTIONS === 'undefined' || !SAMPLE_QUESTIONS.length) {
    return [];
  }
  const diff = profile.difficulty || 'easy';
  if (diff === 'easy') {
    return SAMPLE_QUESTIONS.slice(0, 15);
  } else if (diff === 'medium') {
    const medBank = SAMPLE_QUESTIONS.filter(q => q.difficulty === 'medium' || q.difficulty === 'hard');
    return medBank.concat(SAMPLE_QUESTIONS.filter(q => q.difficulty === 'easy')).slice(0, 15);
  } else {
    const hardBank = SAMPLE_QUESTIONS.filter(q => q.difficulty === 'hard');
    return hardBank.concat(SAMPLE_QUESTIONS.filter(q => q.difficulty === 'medium')).slice(0, 15);
  }
}

function createNewGameState() {
  return {
    sessionId: null,
    qIndex: 0,
    currentPrize: "₹ 0",
    guaranteedPrize: "₹ 0",
    selectedOption: null,
    locked: false,
    timerSeconds: TIMER_PRESETS[profile?.difficulty || 'easy'] || 45,
    timerId: null,
    questions: getQuestionsForGame(),
    lastAnswerCorrect: null,
    used: {
      fifty: false,
      phone: false,
      poll: false,
      flip: false
    }
  };
}

// --- PERSISTENCE: SURVIVE SOFT RELOADS ---
function saveGameState() {
  try {
    const toSave = {
      sessionId: game.sessionId,
      qIndex: game.qIndex,
      currentPrize: game.currentPrize,
      guaranteedPrize: game.guaranteedPrize,
      selectedOption: game.selectedOption,
      locked: game.locked,
      timerSeconds: game.timerSeconds,
      used: game.used,
      lastAnswerCorrect: game.lastAnswerCorrect,
      activeScreen: document.querySelector('.screen.active') ? document.querySelector('.screen.active').id : 'screen-home'
    };
    sessionStorage.setItem('surkbc_session_state', JSON.stringify(toSave));
  } catch (e) {}
}

function loadGameState() {
  const fresh = createNewGameState();
  try {
    const raw = sessionStorage.getItem('surkbc_session_state');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...fresh,
        ...parsed,
        questions: fresh.questions,
        used: {
          ...fresh.used,
          ...(parsed.used || {})
        }
      };
    }
  } catch (e) {}
  return fresh;
}

function clearGameState() {
  try {
    sessionStorage.removeItem('surkbc_session_state');
  } catch (e) {}
}

let game = loadGameState();

// --- ROUTER: show(id) toggles .active ---
window.show = function(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
    renderScreen(screenId);
    saveGameState();
  }
};
const show = window.show;

// --- TOAST HELPER ---
window.showToast = function(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
};
const showToast = window.showToast;

// --- RENDER DISPATCHER ---
function renderScreen(screenId) {
  if (screenId === 'screen-home') renderHome();
  if (screenId === 'screen-intro') renderIntro();
  if (screenId === 'screen-question') renderQuestion();
  if (screenId === 'screen-result') renderResult();
  if (screenId === 'screen-gameover') renderGameOver();
  if (screenId === 'screen-settings') renderSettings();
}

// --- SCREEN 1: HOME ---
function renderHome() {
  const nameInput = document.getElementById('home-player-name');
  if (nameInput) nameInput.value = profile.name;

  const statsHigh = document.getElementById('home-stat-high');
  if (statsHigh) statsHigh.textContent = profile.highScore;

  const statsGames = document.getElementById('home-stat-games');
  if (statsGames) statsGames.textContent = profile.gamesPlayed;

  const friendsList = document.getElementById('home-friends-list');
  if (friendsList) {
    friendsList.innerHTML = profile.friends.map(f => {
      const phoneDisplay = f.phone ? `<span style="font-size: 10px; color: var(--neon-cyan); margin-left: 6px;">📞 ${escapeHtml(f.phone)}</span>` : `<span style="font-size: 10px; color: var(--color-amber); margin-left: 6px;">⚠️ Add No.</span>`;
      return `
        <div class="friend-row" style="cursor: pointer;" onclick="editFriendPhone(${f.id})">
          <div style="display: flex; align-items: center; overflow: hidden;">
            <span style="font-weight: 700;">👤 ${escapeHtml(f.name)}</span>
            ${phoneDisplay}
          </div>
          <button class="btn-remove-friend" onclick="event.stopPropagation(); removeFriend(${f.id})">✕</button>
        </div>
      `;
    }).join('');
  }
}

window.onPlayerNameChange = function(name) {
  profile.name = name.trim() || "Contestant";
  saveProfile();
};

function normalizePhoneNumber(raw) {
  if (!raw) return "";
  let clean = String(raw).replace(/[\s\-\(\)]/g, "");
  if (/^[6-9]\d{9}$/.test(clean)) {
    clean = "+91" + clean;
  } else if (/^91[6-9]\d{9}$/.test(clean)) {
    clean = "+" + clean;
  } else if (!clean.startsWith("+") && clean.length >= 10) {
    clean = "+" + clean;
  }
  return /^\+[1-9]\d{9,14}$/.test(clean) ? clean : null;
}

window.addFriend = function() {
  if (profile.friends.length >= 3) {
    showToast("Adhik-tam 3 dost allow hain!");
    return;
  }
  const name = prompt("Dost ka naam likhein:");
  if (!name || !name.trim()) return;

  const rawPhone = prompt("Dost ka WhatsApp number (+91...):", "+91 ");
  const phone = normalizePhoneNumber(rawPhone);
  if (!phone) {
    showToast("Invalid number! E.164 format dalein (jaise +919876543210)");
    return;
  }

  profile.friends.push({ id: Date.now(), name: name.trim(), phone });
  saveProfile();
  renderHome();
  showToast(`${name.trim()} jud gaye!`);
};

window.editFriendPhone = function(id) {
  const friend = profile.friends.find(f => f.id === id);
  if (!friend) return;
  const raw = prompt(`'${friend.name}' ka WhatsApp number update karein:`, friend.phone || "+91 ");
  if (raw === null) return;
  const phone = normalizePhoneNumber(raw);
  if (!phone) {
    showToast("Invalid number! (e.g. +919876543210)");
    return;
  }
  friend.phone = phone;
  saveProfile();
  renderHome();
  showToast("Number update ho gaya!");
};

window.removeFriend = function(id) {
  profile.friends = profile.friends.filter(f => f.id !== id);
  saveProfile();
  renderHome();
};

// --- SCREEN 2: HOT-SEAT INTRO ---
function renderIntro() {
  if (!game.sessionId) {
    startServerSession();
  }

  const ladderEl = document.getElementById('intro-ladder-list');
  if (ladderEl) {
    ladderEl.innerHTML = KBC_LADDER.slice().reverse().map((t, revIdx) => {
      const idx = 14 - revIdx;
      const isCurrent = idx === game.qIndex;
      const isPadaav = PADAAV.includes(idx) || idx === 14;
      return `
        <div class="ladder-row ${isCurrent ? 'active' : ''} ${isPadaav ? 'padaav' : ''}">
          <span class="ladder-idx">${t.level} ${isCurrent ? '▶' : ''}</span>
          <span class="ladder-val">${t.prize}</span>
        </div>
      `;
    }).join('');
  }

  // Update lifeline chips HUD in intro
  updateLifelineChips();

  const factEl = document.getElementById('intro-music-fact');
  if (factEl) {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateKey = `${mm}-${dd}`;

    if (musicFactsData && musicFactsData[dateKey]) {
      factEl.textContent = musicFactsData[dateKey];
    } else if (musicFactsData && musicFactsData["DEFAULT"]) {
      factEl.textContent = musicFactsData["DEFAULT"];
    } else {
      factEl.textContent = "Aaj Ka Sangeet Fact: Indian cinema blends emotional micro-tonal vocals that resonate across generations.";
    }
  }
}

// --- SCREEN 3: QUESTION ---
function renderQuestion() {
  const qList = game.questions.length ? game.questions : SAMPLE_QUESTIONS;
  const q = qList[game.qIndex % qList.length];
  const qNum = document.getElementById('q-num-badge');
  const qPrize = document.getElementById('q-prize-badge');
  const qText = document.getElementById('q-text');

  if (qNum) qNum.textContent = `Prashn ${game.qIndex + 1}`;
  if (qPrize) qPrize.textContent = KBC_LADDER[game.qIndex].prize;
  if (qText) qText.textContent = q.question;

  // c3A.3: Mini Ladder on Question Screen
  const miniLadder = document.getElementById('q-mini-ladder');
  if (miniLadder) {
    miniLadder.innerHTML = KBC_LADDER.map((t, idx) => {
      let cls = 'mini-step-dot';
      if (idx < game.qIndex) cls += ' passed';
      else if (idx === game.qIndex) cls += ' current';
      if (PADAAV.includes(idx)) cls += ' padaav';
      return `<span class="${cls}"></span>`;
    }).join('');
  }

  // c2C.3: Bind real canvas visualizer
  const canvas = document.getElementById('question-visualizer-canvas');
  if (canvas && window.audioEngine) {
    window.audioEngine.bindVisualizer(canvas);
  }

  // Option cards
  const optsContainer = document.getElementById('question-options-grid');
  if (optsContainer) {
    optsContainer.innerHTML = q.options.map((optText, optIdx) => {
      const letter = ["A", "B", "C", "D"][optIdx];
      const photoSrc = getSingerPhoto(optText);
      return `
        <button class="option-card" id="opt-btn-${optIdx}" onclick="onOptionSelect(${optIdx})">
          <div class="opt-photo-container">
            <img src="${photoSrc}" alt="${optText}" class="opt-photo-img" loading="eager" onerror="this.onerror=null; this.src='images/singers/arijit.jpg';">
            <span class="opt-letter-badge">${letter}</span>
          </div>
          <div class="opt-content">
            <span class="opt-name">${escapeHtml(optText)}</span>
          </div>
        </button>
      `;
    }).join('');
  }

  updateLifelineHUD();
  startTimer();

  if (window.audioEngine) {
    window.audioEngine.playClip(q.clip);
    window.audioEngine.speak(`${q.question}`);
  }
}

window.playQuestionClip = function() {
  const qList = game.questions.length ? game.questions : SAMPLE_QUESTIONS;
  const q = qList[game.qIndex % qList.length];
  if (window.audioEngine) {
    window.audioEngine.playClip(q.clip);
  }
};

function startTimer() {
  stopTimer();
  const timerDisplay = document.getElementById('q-timer-display');
  const ringProgress = document.getElementById('timer-ring-progress');
  const maxSec = TIMER_PRESETS[profile.difficulty || 'easy'];
  game.timerSeconds = maxSec;

  if (timerDisplay) timerDisplay.textContent = game.timerSeconds;
  updateTimerRing(game.timerSeconds, maxSec);

  game.timerId = setInterval(() => {
    game.timerSeconds--;
    if (timerDisplay) timerDisplay.textContent = game.timerSeconds;
    updateTimerRing(game.timerSeconds, maxSec);

    // c2C.4: Tension loop under last 10s of timer
    if (game.timerSeconds <= 10 && game.timerSeconds > 0) {
      if (window.audioEngine) window.audioEngine.startTensionLoop();
    }

    if (game.timerSeconds <= 0) {
      stopTimer();
      onTimeout();
    }
  }, 1000);
}

// c3A.1: Update Circular Countdown SVG Ring
function updateTimerRing(currentSec, totalSec) {
  const ring = document.getElementById('timer-ring-progress');
  if (!ring) return;
  const circumference = 2 * Math.PI * 19; // ~119.38
  const pct = Math.max(0, currentSec / totalSec);
  const offset = circumference * (1 - pct);
  ring.style.strokeDashoffset = offset;

  if (currentSec <= 10) {
    ring.classList.add('danger');
  } else {
    ring.classList.remove('danger');
  }
}

function stopTimer() {
  if (game.timerId) {
    clearInterval(game.timerId);
    game.timerId = null;
  }
  if (window.audioEngine) {
    window.audioEngine.stopTensionLoop();
  }
}

function onTimeout() {
  showToast("Samay Samapt!");
  if (window.audioEngine) {
    window.audioEngine.playWrongSting();
    window.audioEngine.speak("Samay samapt!");
  }
  evaluateAnswer(null);
}

// --- LOCK FLOW ---
window.onOptionSelect = function(idx) {
  if (game.locked) return;
  game.selectedOption = idx;

  document.querySelectorAll('.option-card').forEach((el, i) => {
    el.classList.toggle('selected', i === idx);
  });

  const qList = game.questions.length ? game.questions : SAMPLE_QUESTIONS;
  const q = qList[game.qIndex % qList.length];
  const optName = q.options[idx];
  const letter = ["A", "B", "C", "D"][idx];

  const modal = document.getElementById('modal-lock-confirm');
  const textEl = document.getElementById('lock-confirm-text');
  if (textEl) textEl.textContent = `Option ${letter}: ${optName} ko lock kiya jaye?`;
  if (modal) modal.classList.add('active');

  stopTimer();
  if (window.audioEngine) {
    window.audioEngine.stopClip();
    window.audioEngine.speak(`Option ${letter}: ${optName} ko lock kiya jaye?`);
  }
};

window.declineLock = function() {
  const modal = document.getElementById('modal-lock-confirm');
  if (modal) modal.classList.remove('active');
  game.selectedOption = null;
  document.querySelectorAll('.option-card').forEach(el => el.classList.remove('selected'));
  startTimer();
};

window.confirmLock = function() {
  const confirmModal = document.getElementById('modal-lock-confirm');
  if (confirmModal) confirmModal.classList.remove('active');

  game.locked = true;
  const qList = game.questions.length ? game.questions : SAMPLE_QUESTIONS;
  const q = qList[game.qIndex % qList.length];
  const letter = ["A", "B", "C", "D"][game.selectedOption];
  const optName = q.options[game.selectedOption];

  const suspenseModal = document.getElementById('modal-suspense');
  const suspText = document.getElementById('suspense-text');
  if (suspText) suspText.textContent = `Computer ji, Option ${letter}: ${optName} lock kiya jaye!`;
  if (suspenseModal) suspenseModal.classList.add('active');

  // c2C.1 & c2C.4: Amitabh computer ji line + intense tension loop
  if (window.audioEngine) {
    window.audioEngine.startTensionLoop();
    window.audioEngine.speak(`Computer ji, Option ${letter}: ${optName} lock kiya jaye!`);
  }

  setTimeout(() => {
    if (suspenseModal) suspenseModal.classList.remove('active');
    if (window.audioEngine) window.audioEngine.stopTensionLoop();
    evaluateAnswer(game.selectedOption);
  }, 2400);
};

// --- RESULT INTERSTITIAL ---
function evaluateAnswer(chosenIdx) {
  const qList = game.questions.length ? game.questions : SAMPLE_QUESTIONS;
  const q = qList[game.qIndex % qList.length];
  const isCorrect = (chosenIdx === q.answer);
  game.lastAnswerCorrect = isCorrect;

  // c3A.2: 3D Flip Card Effect on Options
  const correctCard = document.getElementById(`opt-btn-${q.answer}`);
  if (correctCard) {
    correctCard.classList.add('flip-reveal-correct');
  }
  if (!isCorrect && chosenIdx !== null) {
    const wrongCard = document.getElementById(`opt-btn-${chosenIdx}`);
    if (wrongCard) wrongCard.classList.add('flip-reveal-wrong');
  }

  // c3A.6: Guarded Haptics (navigator.vibrate)
  if ('vibrate' in navigator) {
    try {
      if (isCorrect) {
        navigator.vibrate([60, 40, 100]); // Victory pattern
      } else {
        navigator.vibrate(300); // Long buzz
      }
    } catch (e) {}
  }

  if (isCorrect) {
    game.currentPrize = KBC_LADDER[game.qIndex].prize;
    
    // Padaav reached check
    if (PADAAV.includes(game.qIndex)) {
      game.guaranteedPrize = KBC_LADDER[game.qIndex].prize;
      showPadaavBanner();
    }

    // c3A.5: Victory confetti on level 10+
    if (game.qIndex >= 9) {
      launchConfetti();
    }

    if (window.audioEngine) {
      window.audioEngine.playVictorySting();
      window.audioEngine.speak("Bilkul sahi jawab! Adbhut!");
    }
  } else {
    // Wrong answer drops winnings to guaranteed padaav prize
    game.currentPrize = game.guaranteedPrize || "₹ 0";
    if (window.audioEngine) {
      window.audioEngine.playWrongSting();
      window.audioEngine.speak(`Galat jawab! Sahi uttar tha Option ${["A","B","C","D"][q.answer]}: ${q.options[q.answer]}`);
    }
  }

  syncServerSession();

  // Brief delay to let user see the 3D card flip animation before showing result interstitial
  setTimeout(() => {
    show('screen-result');
  }, 1200);
}

// SCREEN 4: RESULT RENDERER
function renderResult() {
  const qList = game.questions.length ? game.questions : SAMPLE_QUESTIONS;
  const q = qList[game.qIndex % qList.length];
  const isCorrect = (game.lastAnswerCorrect === true);

  const banner = document.getElementById('result-banner');
  if (banner) {
    banner.textContent = isCorrect ? "🎉 Sahi Jawab! Adbhut!" : "❌ Galat Jawab!";
    banner.className = `result-banner ${isCorrect ? 'correct' : 'wrong'}`;
  }

  const songCard = document.getElementById('result-song-info');
  if (songCard) {
    const singerImg = getSingerPhoto(q.singer);
    songCard.innerHTML = `
      <h3>🎵 ${escapeHtml(q.song)} (${escapeHtml(q.movie)})</h3>
      <div style="display:flex; align-items:center; gap:12px; margin: 12px 0;">
        <img src="${singerImg}" alt="${escapeHtml(q.singer)}" style="width: 54px; height: 54px; border-radius: 50%; object-fit: cover; border: 2px solid var(--gold-primary); box-shadow: 0 0 10px rgba(212,175,55,0.4);" onerror="this.onerror=null; this.src='images/singers/arijit.jpg';">
        <div>
          <p style="margin:0; font-size: 14px;"><strong>Gayak:</strong> ${escapeHtml(q.singer)}</p>
          <p style="margin:3px 0 0 0; font-size: 13px; color: var(--gold-secondary);"><strong>Sangeetkar:</strong> ${escapeHtml(q.music)}</p>
        </div>
      </div>
      <p class="trivia-p">${escapeHtml(q.trivia)}</p>
    `;
  }

  const nextBtn = document.getElementById('result-btn-next');
  const quitBtn = document.getElementById('result-btn-quit');

  if (isCorrect) {
    if (nextBtn) {
      nextBtn.style.display = 'block';
      if (game.qIndex < 14) {
        nextBtn.innerHTML = '<span>Agla Prashn ▶</span>';
      } else {
        nextBtn.innerHTML = '<span>🏆 Mahavijeta Nateeja Dekhein ▶</span>';
      }
    }
    if (quitBtn) quitBtn.style.display = 'block';
  } else {
    // WRONG ANSWER: No Agla Prashn, direct to Game Over only
    if (nextBtn) {
      nextBtn.style.display = 'block';
      nextBtn.innerHTML = '<span>Khel Samapt — Nateeja Dekhein 🏆</span>';
    }
    if (quitBtn) quitBtn.style.display = 'none';
  }
}

window.handleResultNextClick = function() {
  if (game.lastAnswerCorrect === false) {
    show('screen-gameover');
    return;
  }
  if (game.qIndex >= 14) {
    show('screen-gameover');
    return;
  }
  proceedToNextQuestion();
};

// c3A.5: Confetti & Padaav Helpers
function showPadaavBanner() {
  const b = document.getElementById('padaav-banner');
  if (b) {
    b.style.display = 'block';
    setTimeout(() => { b.style.display = 'none'; }, 3200);
  }
}

function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = Array.from({ length: 45 }, () => ({
    x: Math.random() * canvas.width,
    y: -10,
    w: Math.random() * 8 + 4,
    h: Math.random() * 6 + 3,
    color: ['#ffd700', '#00d2ff', '#ff007f', '#2ecc71'][Math.floor(Math.random() * 4)],
    vy: Math.random() * 3 + 2,
    vx: (Math.random() - 0.5) * 2,
    rot: Math.random() * 360
  }));

  const startTime = Date.now();
  function renderConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.y += p.vy;
      p.x += p.vx;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.w, p.h);
    });

    if (Date.now() - startTime < 2200) {
      requestAnimationFrame(renderConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.display = 'none';
    }
  }
  renderConfetti();
}

// Next question advancement
window.proceedToNextQuestion = function() {
  if (game.lastAnswerCorrect === false) {
    show('screen-gameover');
    return;
  }
  game.qIndex++;
  game.locked = false;
  game.selectedOption = null;
  game.lastAnswerCorrect = null;
  show('screen-intro');
};

// ==========================================================================
// PHASE 2D: FLOW HARDENING & MODAL AUDITS
// ==========================================================================

// c2D.1: Quit Confirmation Modal ("₹X lekar quit?")
window.promptQuit = function() {
  const isResultScreen = document.getElementById('screen-result') && document.getElementById('screen-result').classList.contains('active');
  if (game.locked && !isResultScreen) return;
  stopTimer(); // Pause timer in quit modal

  // Calculate current winnings (last completed question prize)
  const lastWon = game.qIndex > 0 ? KBC_LADDER[game.qIndex - 1].prize : "₹ 0";
  const prizeText = document.getElementById('quit-modal-prize-text');
  if (prizeText) prizeText.textContent = `${lastWon} lekar quit karein?`;

  const modal = document.getElementById('modal-quit-confirm');
  if (modal) modal.classList.add('active');
};

window.cancelQuit = function() {
  const modal = document.getElementById('modal-quit-confirm');
  if (modal) modal.classList.remove('active');
  startTimer(); // Resume timer
};

window.confirmQuit = function() {
  const modal = document.getElementById('modal-quit-confirm');
  if (modal) modal.classList.remove('active');
  
  // Player keeps last completed prize
  const lastWon = game.qIndex > 0 ? KBC_LADDER[game.qIndex - 1].prize : "₹ 0";
  game.guaranteedPrize = lastWon;
  game.currentPrize = lastWon;
  endServerSession('quit');
  show('screen-gameover');
};

// c2D.2: Option Double-Tap Race Prevention (already verified in onOptionSelect via game.locked & modal active)
function isAnyModalOpen() {
  return document.querySelector('.modal-overlay.active') !== null;
}

// c2D.4: Empty State & Graceful Exhaustion Handling
window.checkFriendsState = function() {
  if (!profile.friends || profile.friends.length === 0) {
    showToast("Pehle Home screen par dost add karo!");
    show('screen-home');
    return false;
  }
  return true;
};

// --- SCREEN 5: GAME OVER ---
function renderGameOver() {
  stopTimer();
  profile.gamesPlayed++;

  const finalAmount = game.guaranteedPrize || "₹ 0";
  const finalEl = document.getElementById('gameover-prize-text');
  if (finalEl) finalEl.textContent = `Aapne jeete: ${finalAmount}`;

  profile.highScore = game.currentPrize;
  saveProfile();
  endServerSession(game.lastAnswerCorrect === false ? 'lost' : 'won');
}

window.restartGame = function() {
  clearGameState();
  game = createNewGameState();
  show('screen-home');
};

// --- SCREEN 6: SETTINGS ---
function renderSettings() {
  const diffSelect = document.getElementById('settings-difficulty-select');
  if (diffSelect) diffSelect.value = profile.difficulty || 'easy';
}

window.saveSettings = function() {
  const diffSelect = document.getElementById('settings-difficulty-select');
  if (diffSelect) {
    profile.difficulty = diffSelect.value;
    saveProfile();
    game = createNewGameState();
    showToast("Settings Save Ho Gayi!");
    show('screen-home');
  }
};

// ==========================================================================
// PHASE 2B: REAL LIFELINE IMPLEMENTATIONS
// ==========================================================================

// c2B.1: 50:50 Lifeline
window.useFiftyFifty = function() {
  if (game.used.fifty) {
    showToast("Ye lifeline use ho chuki hai!");
    return;
  }
  if (game.locked) return;

  game.used.fifty = true;
  updateLifelineHUD();

  const qList = game.questions.length ? game.questions : SAMPLE_QUESTIONS;
  const q = qList[game.qIndex % qList.length];
  const correctIdx = q.answer;

  // Find incorrect option indices
  const wrongIndices = [0, 1, 2, 3].filter(i => i !== correctIdx);
  // Randomly pick 2 wrong to eliminate
  const shuffled = wrongIndices.sort(() => 0.5 - Math.random());
  const toHide = shuffled.slice(0, 2);

  toHide.forEach(idx => {
    const btn = document.getElementById(`opt-btn-${idx}`);
    if (btn) {
      btn.style.visibility = 'hidden';
      btn.disabled = true;
    }
  });

  showToast("50:50: Do galat vikalp mita diye gaye!");
};

// c2B.2: Audience Poll Lifeline
window.useAudiencePoll = function() {
  if (game.used.poll) {
    showToast("Ye lifeline use ho chuki hai!");
    return;
  }
  if (game.locked) return;

  stopTimer(); // Pause timer during poll modal
  game.used.poll = true;
  updateLifelineHUD();

  const qList = game.questions.length ? game.questions : SAMPLE_QUESTIONS;
  const q = qList[game.qIndex % qList.length];
  const correctIdx = q.answer;

  // Weight correct option based on difficulty
  const diff = profile.difficulty || 'easy';
  let correctWeight = diff === 'easy' ? 70 : (diff === 'medium' ? 55 : 40);

  // Distribute remaining % among other 3 options
  let remaining = 100 - correctWeight;
  const r1 = Math.floor(Math.random() * (remaining - 10)) + 3;
  remaining -= r1;
  const r2 = Math.floor(Math.random() * (remaining - 5)) + 2;
  const r3 = remaining - r2;

  const otherPercents = [r1, r2, r3].sort(() => 0.5 - Math.random());
  let otherIdx = 0;

  const percentages = [0, 1, 2, 3].map(i => {
    if (i === correctIdx) return correctWeight;
    return otherPercents[otherIdx++];
  });

  // Render Poll Modal
  const pollContainer = document.getElementById('audience-poll-bars');
  if (pollContainer) {
    const letters = ["A", "B", "C", "D"];
    pollContainer.innerHTML = percentages.map((pct, i) => `
      <div class="poll-bar-col">
        <span class="poll-pct-label">${pct}%</span>
        <div class="poll-bar-track">
          <div class="poll-bar-fill" style="height: ${pct}%;"></div>
        </div>
        <span class="poll-letter-label">${letters[i]}</span>
      </div>
    `).join('');
  }

  const pollModal = document.getElementById('modal-audience-poll');
  if (pollModal) pollModal.classList.add('active');
};

window.closeAudiencePoll = function() {
  const pollModal = document.getElementById('modal-audience-poll');
  if (pollModal) pollModal.classList.remove('active');
  startTimer(); // Resume timer
};

// c2B.3 & c4B.6: Phone a Friend v2 (Cloud-Driven WhatsApp Dispatch + Live Modal Push)
let friendAnswerPollTimer = null;
let friendAnswerWs = null;
let currentFriendPendingAnswer = null;

window.usePhoneAFriend = function() {
  if (game.used.phone) {
    showToast("Ye lifeline use ho chuki hai!");
    return;
  }
  if (game.locked) return;

  if (!profile.friends || profile.friends.length === 0) {
    showToast("Pehle Home par dost add karo!");
    return;
  }

  stopTimer(); // Pause timer while lifeline modal is active

  // Reset modal display areas
  const pickerArea = document.getElementById('phone-friend-picker-area');
  const waitingArea = document.getElementById('phone-friend-waiting-area');
  const manualArea = document.getElementById('phone-friend-manual-area');
  if (pickerArea) pickerArea.style.display = 'block';
  if (waitingArea) waitingArea.style.display = 'none';
  if (manualArea) manualArea.style.display = 'none';

  const listEl = document.getElementById('modal-friend-picker-list');
  if (listEl) {
    listEl.innerHTML = profile.friends.map(f => `
      <button class="friend-picker-btn" onclick="triggerPhoneAFriendDispatch('${String(f.id)}')">
        <div style="display: flex; flex-direction: column; text-align: left;">
          <span style="font-weight: 800;">👤 ${escapeHtml(f.name)}</span>
          <span style="font-size: 10px; color: var(--neon-cyan);">${escapeHtml(f.phone || '⚠️ No number')}</span>
        </div>
        <span style="font-size: 11px; background: rgba(0, 210, 255, 0.2); padding: 4px 8px; border-radius: 4px;">WhatsApp ↗</span>
      </button>
    `).join('');
  }

  const modal = document.getElementById('modal-phone-friend');
  if (modal) modal.classList.add('active');
};

window.triggerPhoneAFriendDispatch = async function(friendId) {
  const friend = profile.friends.find(f => String(f.id) === String(friendId));
  if (!friend) return;

  if (!friend.phone) {
    const raw = prompt(`'${friend.name}' ka WhatsApp number likhein (+91...):`);
    const valid = normalizePhoneNumber(raw);
    if (!valid) {
      showToast("Sahi WhatsApp number dalein!");
      return;
    }
    friend.phone = valid;
    saveProfile();
  }

  currentChatFriendPhone = friend.phone;

  const pickerArea = document.getElementById('phone-friend-picker-area');
  const waitingArea = document.getElementById('phone-friend-waiting-area');
  const manualArea = document.getElementById('phone-friend-manual-area');
  if (pickerArea) pickerArea.style.display = 'none';
  if (waitingArea) waitingArea.style.display = 'block';
  if (manualArea) manualArea.style.display = 'none';
  resetInGameWhatsAppChat();

  const waitMsg = document.getElementById('phone-friend-wait-msg');
  if (waitMsg) waitMsg.textContent = `${friend.name} ko WhatsApp bhej diya gaya!`;

  // Set Call links & Init PeerJS
  const activeSess = game.sessionId || 'game';
  initPlayerPeerSession();
  const playerAudio = document.getElementById('btn-player-jitsi-audio');
  const playerVideo = document.getElementById('btn-player-jitsi-video');
  if (playerAudio) playerAudio.href = `/friend-call.html?session=${encodeURIComponent(activeSess)}&mode=audio`;
  if (playerVideo) playerVideo.href = `/friend-call.html?session=${encodeURIComponent(activeSess)}&mode=video`;

  const qList = game.questions.length ? game.questions : SAMPLE_QUESTIONS;
  const q = qList[game.qIndex % qList.length];

  try {
    const res = await fetch(`${API_BASE}/api/phone-friend/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Token': getDeviceToken()
      },
      body: JSON.stringify({
        sessionId: game.sessionId,
        friendName: friend.name,
        friendPhone: friend.phone,
        question: q.question,
        options: q.options,
        playerName: profile.name
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.gateway === 'wa-me-fallback' && data.waLink) {
        window.open(data.waLink, '_blank');
      }
    } else {
      fallbackDirectWhatsAppShare(friend, q);
    }
  } catch (e) {
    fallbackDirectWhatsAppShare(friend, q);
  }

  startFriendAnswerListener(friend.name);
};

function fallbackDirectWhatsAppShare(friend, q) {
  const origin = window.location.origin.includes("localhost") ? window.location.origin : "https://kbc.harjani.me";
  const sId = game.sessionId || 'game';
  const ansUrl = `${origin}/friend.html?session=${encodeURIComponent(sId)}&token=manual`;
  const audioUrl = `https://meet.jit.si/surkbc-${encodeURIComponent(sId)}#config.startWithVideoMuted=true`;
  const videoUrl = `https://meet.jit.si/surkbc-${encodeURIComponent(sId)}`;

  const text = `🎵 SurKBC — Aapke dost ${profile.name} ko aapki madad chahiye!\n\nSawaal: ${q.question}\nA) ${q.options[0]}\nB) ${q.options[1]}\nC) ${q.options[2]}\nD) ${q.options[3]}\n\n👉 Uttar dene ke liye link:\n${ansUrl}\n\n🎙️ Audio call:\n${audioUrl}\n\n📹 Video call:\n${videoUrl}`;
  const cleanPhone = (friend.phone || "").replace(/[\s\-\(\)\+]/g, "");
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(waUrl, '_blank');

  // Switch to manual input mode for reliable offline entry
  const pickerArea = document.getElementById('phone-friend-picker-area');
  const waitingArea = document.getElementById('phone-friend-waiting-area');
  const manualArea = document.getElementById('phone-friend-manual-area');
  if (pickerArea) pickerArea.style.display = 'none';
  if (waitingArea) waitingArea.style.display = 'none';
  if (manualArea) manualArea.style.display = 'block';
  showToast("Offline fallback: Manual vikalp entry sakriya!");
}

function startFriendAnswerListener(friendName) {
  stopFriendAnswerListener();

  // 1. Try WebSocket connection to /ws
  try {
    const wsProto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProto}//${location.host}/ws?session=${encodeURIComponent(game.sessionId || 'game')}`;
    friendAnswerWs = new WebSocket(wsUrl);

    friendAnswerWs.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'friend_answered' && msg.answer) {
          onFriendAnswerReceived(msg.answer, msg.note, msg.friendName || friendName);
        } else if (msg.type === 'whatsapp_chat') {
          onWhatsAppChatMessageReceived(msg);
        } else if (msg.type === 'call_started') {
          onIncomingCallTriggered(msg);
        }
      } catch (e) {}
    };
  } catch (e) {}

  // 2. HTTP Polling Fallback every 1.2 seconds (Both Answer AND WhatsApp Chat)
  const pollSync = async () => {
    const sId = game.sessionId || 'game';
    try {
      const res = await fetch(`${API_BASE}/api/phone-friend/poll?session=${encodeURIComponent(sId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'answered' && data.answer) {
          onFriendAnswerReceived(data.answer, data.note, data.friendName || friendName);
        }
      }

      // Sync chat messages
      const chatRes = await fetch(`${API_BASE}/api/phone-friend/messages?session=${encodeURIComponent(sId)}`);
      if (chatRes.ok) {
        const chatData = await chatRes.json();
        if (Array.isArray(chatData.messages)) {
          chatData.messages.forEach(m => onWhatsAppChatMessageReceived(m));
        }
      }
    } catch (e) {}
  };

  // Immediate poll on open
  pollSync();
  friendAnswerPollTimer = setInterval(pollSync, 1200);
}

function stopFriendAnswerListener() {
  if (friendAnswerPollTimer) {
    clearInterval(friendAnswerPollTimer);
    friendAnswerPollTimer = null;
  }
  if (friendAnswerWs) {
    try { friendAnswerWs.close(); } catch (e) {}
    friendAnswerWs = null;
  }
}

function onFriendAnswerReceived(optLetter, note, friendName) {
  stopFriendAnswerListener();

  // Close waiting modal
  const phoneModal = document.getElementById('modal-phone-friend');
  if (phoneModal) phoneModal.classList.remove('active');

  // Mark lifeline used
  game.used.phone = true;
  updateLifelineHUD();
  syncServerSession();

  const letterMap = { "A": 0, "B": 1, "C": 2, "D": 3 };
  const optIdx = letterMap[String(optLetter).toUpperCase()] ?? 0;
  currentFriendPendingAnswer = optIdx;

  // Highlight option card on stage
  document.querySelectorAll('.option-card').forEach((el, i) => {
    el.classList.toggle('selected', i === optIdx);
  });

  const qList = game.questions.length ? game.questions : SAMPLE_QUESTIONS;
  const q = qList[game.qIndex % qList.length];
  const optName = q.options[optIdx];

  // Open Friend Answer Prompt Modal
  const ansModal = document.getElementById('modal-friend-answer');
  const titleEl = document.getElementById('friend-answer-title');
  const textEl = document.getElementById('friend-answer-text');
  const noteEl = document.getElementById('friend-answer-note');

  if (titleEl) titleEl.textContent = `📞 ${friendName} Ne Uttar Diya!`;
  if (textEl) textEl.textContent = `Option ${optLetter}: ${optName}`;
  if (noteEl) {
    noteEl.textContent = note ? `Salah: "${note}"` : "Dost ne ye option chuna hai.";
  }

  if (ansModal) ansModal.classList.add('active');

  if (window.audioEngine) {
    window.audioEngine.speak(`${friendName} ne kaha: Option ${optLetter}, ${optName}`);
  }
}

window.acceptFriendAnswer = function() {
  const ansModal = document.getElementById('modal-friend-answer');
  if (ansModal) ansModal.classList.remove('active');

  if (currentFriendPendingAnswer !== null) {
    game.selectedOption = currentFriendPendingAnswer;
    confirmLock();
  }
};

window.dismissFriendAnswer = function() {
  const ansModal = document.getElementById('modal-friend-answer');
  if (ansModal) ansModal.classList.remove('active');
  game.selectedOption = null;
  document.querySelectorAll('.option-card').forEach(el => el.classList.remove('selected'));
  startTimer(); // Resume timer
};

window.switchToManualFriendAnswer = function() {
  const waitingArea = document.getElementById('phone-friend-waiting-area');
  const manualArea = document.getElementById('phone-friend-manual-area');
  if (waitingArea) waitingArea.style.display = 'none';
  if (manualArea) manualArea.style.display = 'block';
};

window.submitFriendManualAnswer = function(optLetter) {
  stopFriendAnswerListener();
  const modal = document.getElementById('modal-phone-friend');
  if (modal) modal.classList.remove('active');

  onFriendAnswerReceived(optLetter, "", "Dost");
};

window.closePhoneAFriendModal = function() {
  stopFriendAnswerListener();
  endCustomCall();
  const modal = document.getElementById('modal-phone-friend');
  if (modal) modal.classList.remove('active');
  startTimer(); // Resume timer without consuming lifeline if cancelled before send
};

// ==========================================================================
// TWO-WAY WHATSAPP IN-GAME CHAT ENGINE
// ==========================================================================
let lastDetectedOptionFromChat = null;
let currentChatFriendPhone = null;
const seenChatMsgIds = new Set();

function resetInGameWhatsAppChat() {
  seenChatMsgIds.clear();
  lastDetectedOptionFromChat = null;
  const container = document.getElementById('wa-chat-messages');
  if (container) {
    container.innerHTML = `
      <div class="wa-bubble friend">
        <div class="wa-bubble-sender">SurKBC Bot</div>
        Dost ko WhatsApp bhej diya hai. Unka reply yahan aayega!
      </div>
    `;
  }
  const optBar = document.getElementById('wa-option-bar');
  if (optBar) optBar.style.display = 'none';
}

function onWhatsAppChatMessageReceived(msg) {
  const msgKey = msg.id || `${msg.sender}_${msg.text}_${msg.created_at || msg.timestamp || ''}`;
  if (seenChatMsgIds.has(msgKey)) return;
  seenChatMsgIds.add(msgKey);

  const container = document.getElementById('wa-chat-messages');
  if (!container) return;

  const isPlayer = (msg.sender === 'player');
  const senderTitle = isPlayer ? 'Aap' : (msg.friend_name || msg.friendName || 'Dost');
  const bubbleClass = isPlayer ? 'wa-bubble player' : 'wa-bubble friend';

  const bubble = document.createElement('div');
  bubble.className = bubbleClass;
  bubble.innerHTML = `
    <div class="wa-bubble-sender">${escapeHtml(senderTitle)}</div>
    <div>${escapeHtml(msg.text)}</div>
  `;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;

  // If friend suggested an option, highlight quick-lock bar
  const detOpt = msg.detected_option || msg.detectedOption;
  if (!isPlayer && detOpt) {
    lastDetectedOptionFromChat = String(detOpt).toUpperCase();
    const optBar = document.getElementById('wa-option-bar');
    const optText = document.getElementById('wa-option-text');
    if (optBar && optText) {
      optText.textContent = `Dost ne kaha: Option ${lastDetectedOptionFromChat}`;
      optBar.style.display = 'flex';
    }
  }

  // Play audio chime if available
  if (window.audioEngine && typeof window.audioEngine.playSfx === 'function') {
    window.audioEngine.playSfx('ding');
  }
}

window.sendPlayerChat = async function() {
  const input = document.getElementById('wa-chat-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  input.value = "";
  const sId = game.sessionId || 'game';
  const friendPhone = currentChatFriendPhone || (profile.friends[0]?.phone) || "";

  try {
    await fetch(`${API_BASE}/api/phone-friend/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Token': getDeviceToken()
      },
      body: JSON.stringify({
        sessionId: sId,
        friendPhone,
        messageText: text
      })
    });
  } catch (e) {
    showToast("Chat message send nahi ho saka");
  }
};

window.lockSuggestedOption = function() {
  if (!lastDetectedOptionFromChat) return;
  const modal = document.getElementById('modal-phone-friend');
  if (modal) modal.classList.remove('active');
  endCustomCall();
  onFriendAnswerReceived(lastDetectedOptionFromChat, "WhatsApp chat se prapt", "Dost");
};

// ==========================================================================
// CUSTOM IN-APP KBC CALL ENGINE (AUDIO VISUALIZER & DUAL VIDEO TILES)
// ==========================================================================
// PURE NATIVE P2P WEBRTC CALL ENGINE (PEERJS — ZERO LOGIN, ZERO CHROME)
// ==========================================================================
let activeCallMode = null;
let callVisualizerInterval = null;
let playerPeer = null;
let activePeerCall = null;
let playerLocalMediaStream = null;
let isCallMuted = false;

function initPlayerPeerSession() {
  const sId = game.sessionId || 'game';
  const playerPeerId = `surkbc-player-${sId}`;

  if (playerPeer) {
    try { playerPeer.destroy(); } catch (e) {}
  }

  if (typeof Peer === 'undefined') return;

  try {
    playerPeer = new Peer(playerPeerId, { debug: 1 });

    playerPeer.on('open', () => {
      console.log('Player PeerJS Ready:', playerPeerId);
    });

    playerPeer.on('call', async (call) => {
      // Incoming call from friend!
      const callMode = call.metadata?.mode === 'video' ? 'video' : 'audio';
      activeCallMode = callMode;
      activePeerCall = call;

      showToast(`Dost se ${callMode === 'video' ? 'Video' : 'Audio'} Call jud rahi hai!`);
      launchCustomCallModal(callMode);

      try {
        // Capture local microphone (and camera if video mode)
        playerLocalMediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: (callMode === 'video')
        });

        if (callMode === 'video') {
          const localVid = document.getElementById('player-local-video');
          if (localVid) localVid.srcObject = playerLocalMediaStream;
        }

        call.answer(playerLocalMediaStream);

        call.on('stream', (remoteStream) => {
          attachRemoteMediaStream(remoteStream, callMode);
        });

        call.on('close', () => {
          endCustomCall();
        });

      } catch (err) {
        console.warn('Microphone/Camera permission error:', err);
        // Answer audio-only or empty if permission denied
        call.answer();
        call.on('stream', (remoteStream) => {
          attachRemoteMediaStream(remoteStream, callMode);
        });
      }
    });

    playerPeer.on('error', (err) => {
      console.warn('Player PeerJS error:', err);
    });
  } catch (err) {
    console.warn('PeerJS init error:', err);
  }
}

function attachRemoteMediaStream(remoteStream, mode) {
  if (mode === 'video') {
    const remoteVid = document.getElementById('player-remote-video');
    if (remoteVid) remoteVid.srcObject = remoteStream;
  } else {
    const remoteAud = document.getElementById('player-remote-audio');
    if (remoteAud) {
      remoteAud.srcObject = remoteStream;
      remoteAud.play().catch(() => {});
    }
  }
}

window.startCustomCall = function(mode) {
  launchCustomCallModal(mode);
};

function onIncomingCallTriggered(msg) {
  showToast(`Dost ne ${msg.mode === 'video' ? 'Video' : 'Audio'} Call shuru ki!`);
  launchCustomCallModal(msg.mode);
}

function launchCustomCallModal(mode) {
  activeCallMode = mode;
  const modal = document.getElementById('modal-kbc-call');
  const audioStage = document.getElementById('call-audio-stage');
  const videoStage = document.getElementById('call-video-stage');
  const statusLabel = document.getElementById('call-status-label');
  const friendNameAudio = document.getElementById('call-friend-name-audio');

  const activeFriend = profile.friends && profile.friends[0];
  if (friendNameAudio) {
    friendNameAudio.textContent = activeFriend ? activeFriend.name : "Dost";
  }

  if (statusLabel) {
    statusLabel.textContent = (mode === 'video') ? "📹 Video Call Connected" : "🎙️ Audio Call Connected";
  }

  if (modal) modal.classList.add('active');

  if (mode === 'audio') {
    if (audioStage) audioStage.style.display = 'flex';
    if (videoStage) videoStage.style.display = 'none';
    startAudioVisualizerLoop();
  } else {
    if (audioStage) audioStage.style.display = 'none';
    if (videoStage) videoStage.style.display = 'grid';
  }

  // Request contestant's camera/mic
  acquirePlayerMediaStream(mode);
}

async function acquirePlayerMediaStream(mode) {
  if (playerLocalMediaStream) return;
  try {
    playerLocalMediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: (mode === 'video')
    });

    if (mode === 'video') {
      const localVid = document.getElementById('player-local-video');
      if (localVid) localVid.srcObject = playerLocalMediaStream;
    }

    // If an incoming call is waiting, answer it with stream
    if (activePeerCall && !activePeerCall.open) {
      activePeerCall.answer(playerLocalMediaStream);
    }
  } catch (err) {
    console.warn("Player media permission denied or not available:", err);
  }
}

function startAudioVisualizerLoop() {
  stopAudioVisualizerLoop();
  const bars = document.querySelectorAll('#call-vbars .call-vbar');
  if (!bars.length) return;

  callVisualizerInterval = setInterval(() => {
    bars.forEach(bar => {
      const height = Math.floor(Math.random() * 42) + 6;
      bar.style.height = `${height}px`;
    });
  }, 90);
}

function stopAudioVisualizerLoop() {
  if (callVisualizerInterval) {
    clearInterval(callVisualizerInterval);
    callVisualizerInterval = null;
  }
}

window.toggleCallMute = function() {
  isCallMuted = !isCallMuted;
  if (playerLocalMediaStream) {
    playerLocalMediaStream.getAudioTracks().forEach(track => track.enabled = !isCallMuted);
  }
  const btn = document.getElementById('btn-call-mute');
  if (btn) {
    btn.textContent = isCallMuted ? "🔇 Mic Muted" : "🎙️ Mic On";
    btn.style.color = isCallMuted ? "var(--color-red)" : "#fff";
  }
};

window.lockFromCall = function() {
  endCustomCall();
  if (lastDetectedOptionFromChat) {
    onFriendAnswerReceived(lastDetectedOptionFromChat, "Call ke dauraan chuna", "Dost");
  } else {
    const modal = document.getElementById('modal-phone-friend');
    if (modal) modal.classList.add('active');
    switchToManualFriendAnswer();
  }
};

window.endCustomCall = function() {
  stopAudioVisualizerLoop();
  const modal = document.getElementById('modal-kbc-call');
  if (modal) modal.classList.remove('active');

  if (playerLocalMediaStream) {
    playerLocalMediaStream.getTracks().forEach(track => track.stop());
    playerLocalMediaStream = null;
  }

  if (activePeerCall) {
    try { activePeerCall.close(); } catch (e) {}
    activePeerCall = null;
  }

  const localVid = document.getElementById('player-local-video');
  const remoteVid = document.getElementById('player-remote-video');
  const remoteAud = document.getElementById('player-remote-audio');
  if (localVid) localVid.srcObject = null;
  if (remoteVid) remoteVid.srcObject = null;
  if (remoteAud) remoteAud.srcObject = null;

  if (!game.used.phone) {
    const phoneModal = document.getElementById('modal-phone-friend');
    if (phoneModal) phoneModal.classList.add('active');
  }
};


// c2B.4: Flip the Question Lifeline
window.useFlipQuestion = function() {
  if (game.used.flip) {
    showToast("Ye lifeline use ho chuki hai!");
    return;
  }
  if (game.locked) return;

  game.used.flip = true;
  updateLifelineHUD();

  const qList = game.questions.length ? game.questions : SAMPLE_QUESTIONS;
  const currentQ = qList[game.qIndex % qList.length];

  // Find unused backup question with matching difficulty
  const backup = SAMPLE_QUESTIONS.find(q => q.id !== currentQ.id && q.difficulty === currentQ.difficulty);

  if (backup) {
    game.questions[game.qIndex] = backup;
  } else {
    // If no exact difficulty match, pick any other question
    const anyBackup = SAMPLE_QUESTIONS.find(q => q.id !== currentQ.id);
    if (anyBackup) game.questions[game.qIndex] = anyBackup;
  }

  showToast("Prashn Badal Diya Gaya!");
  // Restart timer & render new question
  renderQuestion();
};

// Lifeline Dispatcher
window.useLifeline = function(type) {
  if (type === 'fifty') useFiftyFifty();
  else if (type === 'phone') usePhoneAFriend();
  else if (type === 'poll') useAudiencePoll();
  else if (type === 'flip') useFlipQuestion();
};

// c2B.5: Lifeline HUD Update (dims used buttons across all screens)
function updateLifelineHUD() {
  const keys = ['fifty', 'phone', 'poll', 'flip'];
  keys.forEach(k => {
    const btn = document.getElementById(`lifeline-btn-${k}`);
    if (btn) {
      if (game.used[k]) {
        btn.classList.add('used');
      } else {
        btn.classList.remove('used');
      }
    }
  });
}

function updateLifelineChips() {
  const keys = ['fifty', 'phone', 'poll', 'flip'];
  keys.forEach(k => {
    const chip = document.getElementById(`intro-chip-${k}`);
    if (chip) {
      if (game.used[k]) {
        chip.classList.add('used');
      } else {
        chip.classList.remove('used');
      }
    }
  });
}

// --- HELPER ---
function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
}

// Initializer
document.addEventListener('DOMContentLoaded', () => {
  // Check if a saved session was active
  let restoreScreen = 'screen-home';
  try {
    const raw = sessionStorage.getItem('surkbc_session_state');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.activeScreen) {
        restoreScreen = parsed.activeScreen;
      }
    }
  } catch (e) {}

  show(restoreScreen);
  syncProfileFromServer();
});
