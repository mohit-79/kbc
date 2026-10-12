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

const DEFAULT_SECURITY_CODE = "0504";

const TIMER_PRESETS = {
  casual: null, // No timer capping
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
let singersDirectory = (typeof window !== 'undefined' && window.singersDirectory) || [];

fetch('singers.json')
  .then(res => res.json())
  .then(data => {
    if (Array.isArray(data)) {
      singersDirectory = data;
      if (typeof window !== 'undefined') window.singersDirectory = data;
      data.forEach(s => {
        if (s.name) {
          const norm = s.name.toLowerCase().trim().replace(/^mohd\.?\s+/i, 'mohammed ').replace(/[^a-z0-9]/g, '');
          const localImg = `images/singers/${norm}.jpg`;
          gallerySingers[s.name.toLowerCase().trim()] = localImg;
        }
      });
      // If active game has no questions or is at question 0, enrich with dynamic questions
      if (game && (!game.questions || !game.questions.length || game.qIndex === 0) && typeof getQuestionsForGame === 'function') {
        game.questions = getQuestionsForGame();
      }
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
window.profile = profile;
let musicFactsData = null;
let previewsCache = (typeof window !== 'undefined' && window.previewsCache) || {};

fetch('musicFacts.json')
  .then(res => res.json())
  .then(data => { musicFactsData = data; })
  .catch(err => console.warn('Could not load musicFacts.json:', err));

fetch('previews_cache.json')
  .then(res => res.json())
  .then(data => {
    previewsCache = data || {};
    if (typeof window !== 'undefined') window.previewsCache = previewsCache;
  })
  .catch(err => console.warn('Could not load previews_cache.json:', err));

function getSongEra(songOrYear) {
  const y = (typeof songOrYear === 'number')
    ? songOrYear
    : ((songOrYear && typeof songOrYear.y === 'number') ? songOrYear.y : null);
  if (!y) return "retro";
  if (y < 1970) return "golden";
  if (y < 1990) return "retro";
  if (y < 2000) return "90s";
  if (y < 2010) return "2000s";
  if (y < 2020) return "2010s";
  return "modern";
}

function getSongPreview(songTitle, singerName) {
  if (!songTitle) return "";
  const clean = songTitle.toLowerCase().trim();
  const slug = clean.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const cleanSinger = (singerName || '').toLowerCase().trim();

  // 1. Composite singer + song key
  if (cleanSinger) {
    const compKey = `${cleanSinger}|${clean}`;
    if (previewsCache[compKey]) return previewsCache[compKey];
  }

  // 2. Exact match on clean title or slug
  if (previewsCache[clean]) return previewsCache[clean];
  if (previewsCache[slug]) return previewsCache[slug];

  // 3. Normalized title (strip trailing parenthetical info like '(From "Movie")' or '- Remix')
  const simplified = clean.replace(/\s*[\(\[\-].*$/, '').trim();
  if (simplified && simplified.length > 3 && simplified !== clean) {
    if (previewsCache[simplified]) return previewsCache[simplified];
    const simplifiedSlug = simplified.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    if (previewsCache[simplifiedSlug]) return previewsCache[simplifiedSlug];
  }

  return "";
}

async function ensureQuestionClip(q) {
  if (!q) return "";
  if (q.clip && (typeof q.clip === 'string') && (q.clip.startsWith('http://') || q.clip.startsWith('https://'))) {
    return q.clip;
  }
  const cached = getSongPreview(q.song, q.singer);
  if (cached) {
    q.clip = cached;
    q.preview = cached;
    return cached;
  }
  try {
    const res = await fetch(`/api/song-preview?song=${encodeURIComponent(q.song || '')}&singer=${encodeURIComponent(q.singer || '')}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.previewUrl) {
        q.clip = data.previewUrl;
        q.preview = data.previewUrl;
        const clean = (q.song || '').toLowerCase().trim();
        previewsCache[clean] = data.previewUrl;
        return data.previewUrl;
      }
    }
  } catch (e) {}

  try {
    const term = `${q.song || ''} ${q.singer || ''}`.trim();
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&country=IN&entity=song&limit=1`;
    const res = await fetch(itunesUrl);
    if (res.ok) {
      const data = await res.json();
      if (data && data.results && data.results.length > 0 && data.results[0].previewUrl) {
        const previewUrl = data.results[0].previewUrl;
        q.clip = previewUrl;
        q.preview = previewUrl;
        const clean = (q.song || '').toLowerCase().trim();
        previewsCache[clean] = previewUrl;
        return previewUrl;
      }
    }
  } catch (e) {}

  return "";
}

function loadProfile() {
  try {
    const raw = localStorage.getItem('surkbc_profile');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed.selectedEras) || parsed.selectedEras.length === 0) {
        parsed.selectedEras = ["golden", "retro", "90s", "2000s", "2010s", "modern"];
      }
      return parsed;
    }
  } catch (e) {}
  return {
    name: "Contestant",
    highScore: "₹ 0",
    gamesPlayed: 0,
    difficulty: "easy",
    voiceMode: "madhur",
    voicePitch: -6,
    voiceSpeed: 1.0,
    friends: [],
    selectedEras: ["golden", "retro", "90s", "2000s", "2010s", "modern"]
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
    const token = getDeviceToken();
    const res = await fetch(`${API_BASE}/api/profile?name=${encodeURIComponent(profile.name || 'Contestant')}&token=${encodeURIComponent(token)}`, {
      headers: { 'X-Device-Token': token }
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
      if (Array.isArray(data.profile.friends)) {
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

// --- ERA FILTERING & ANTI-REPETITION HELPERS ---
function getActiveEras() {
  if (Array.isArray(profile && profile.selectedEras) && profile.selectedEras.length > 0) {
    return profile.selectedEras;
  }
  return ["golden", "retro", "90s", "2000s", "2010s", "modern"];
}

function loadUsedSongKeys() {
  try {
    const raw = sessionStorage.getItem('surkbc_used_song_keys');
    if (raw) return new Set(JSON.parse(raw));
  } catch (e) {}
  return new Set();
}

function recordUsedSongKey(key) {
  try {
    const keys = loadUsedSongKeys();
    keys.add(key);
    const arr = Array.from(keys).slice(-300);
    sessionStorage.setItem('surkbc_used_song_keys', JSON.stringify(arr));
  } catch (e) {}
}

// --- GENDER & ERA SINGER MATCHING (Peer-Matched Distractors) ---
const FEMALE_SINGER_NAMES = new Set([
  'alisha chinai', 'alka yagnik', 'anuradha paudwal', 'asees kaur',
  'asha bhosle', 'dhvani bhanushali', 'geeta dutt', 'harshdeep kaur',
  'jasleen royal', 'jonita gandhi', 'kanika kapoor', 'kavita krishnamurthy',
  'lata mangeshkar', 'lisa mishra', 'mahalakshmi iyer', 'monali thakur',
  'neeti mohan', 'neha kakkar', 'nikhita gandhi', 'palak muchhal',
  'poornima', 'rekha bhardwaj', 'richa sharma', 'sadhana sargam',
  'sapna mukherjee', 'shalmali kholgade', 'shamshad begum', 'shilpa rao',
  'shreya ghoshal', 'sona mohapatra', 'sunidhi chauhan', 'tulsi kumar'
]);

function getSingerGender(name) {
  if (!name) return 'male';
  const clean = name.toLowerCase().trim();
  const directory = (Array.isArray(singersDirectory) && singersDirectory.length > 0)
    ? singersDirectory
    : ((typeof window !== 'undefined' && Array.isArray(window.singersDirectory)) ? window.singersDirectory : []);
  const found = directory.find(s => s && s.name && s.name.toLowerCase().trim() === clean);
  if (found && found.gender) {
    return found.gender.toLowerCase();
  }
  return FEMALE_SINGER_NAMES.has(clean) ? 'female' : 'male';
}

const ERA_ANCHOR_YEARS = {
  "golden": 1960,
  "retro": 1978,
  "90s": 1995,
  "2000s": 2005,
  "2010s": 2015,
  "modern": 2022
};

let singerMetadataMap = null;
function getSingerMetadataMap(directory) {
  if (singerMetadataMap && singerMetadataMap.size > 0) return singerMetadataMap;
  singerMetadataMap = new Map();
  (directory || []).forEach(s => {
    if (!s || !s.name) return;
    const gender = getSingerGender(s.name);
    const validSongs = (s.songs || []).filter(x => x && typeof x.y === 'number' && x.y > 1900 && x.y < 2030);
    const years = validSongs.map(x => x.y).sort((a, b) => a - b);
    const medianYear = years.length ? years[Math.floor(years.length / 2)] : 2005;

    // Tally era counts for this singer
    const eraCounts = {};
    validSongs.forEach(x => {
      const era = getSongEra(x.y);
      eraCounts[era] = (eraCounts[era] || 0) + 1;
    });

    // Active in era if singer has at least 2 songs or >= 10% of their valid catalog
    const activeEras = new Set();
    Object.keys(eraCounts).forEach(e => {
      if (eraCounts[e] >= 2 || (validSongs.length > 0 && eraCounts[e] / validSongs.length >= 0.1)) {
        activeEras.add(e);
      }
    });

    // Also include any era if singer has small catalog (<= 5 songs)
    if (validSongs.length <= 5) {
      Object.keys(eraCounts).forEach(e => activeEras.add(e));
    }

    singerMetadataMap.set(s.name.toLowerCase().trim(), {
      name: s.name,
      gender,
      medianYear,
      eras: activeEras
    });
  });
  return singerMetadataMap;
}

function getEraAndGenderMatchedDistractors(targetSingerName, targetYear, targetEra, directory, count = 3) {
  const metaMap = getSingerMetadataMap(directory);
  const targetClean = (targetSingerName || '').toLowerCase().trim();
  const targetGender = getSingerGender(targetSingerName);
  const year = targetYear || ERA_ANCHOR_YEARS[targetEra] || 2000;

  // Separate candidates strictly matching gender into Tier 1 (active in targetEra) & Tier 2 (active in neighboring eras)
  const tier1 = [];
  const tier2 = [];

  metaMap.forEach((meta, key) => {
    if (key === targetClean) return;
    if (meta.gender !== targetGender) return;

    const yearDiff = Math.abs(year - meta.medianYear);
    const item = { name: meta.name, yearDiff };

    if (meta.eras && meta.eras.has(targetEra)) {
      tier1.push(item);
    } else {
      tier2.push(item);
    }
  });

  // Sort candidates by proximity to the question's year
  tier1.sort((a, b) => a.yearDiff - b.yearDiff);
  tier2.sort((a, b) => a.yearDiff - b.yearDiff);

  let pool = [];
  if (tier1.length >= count) {
    const candidateWindow = Math.min(tier1.length, Math.max(count + 3, 6));
    pool = shuffleArray(tier1.slice(0, candidateWindow)).slice(0, count).map(c => c.name);
  } else {
    const needed = count - tier1.length;
    pool = [
      ...tier1.map(c => c.name),
      ...tier2.slice(0, needed).map(c => c.name)
    ];
  }

  // Safety fallback if directory was small: ensure strictly matching gender
  if (pool.length < count) {
    (directory || []).forEach(s => {
      if (!s || !s.name) return;
      if (s.name.toLowerCase().trim() === targetClean) return;
      if (getSingerGender(s.name) === targetGender && !pool.includes(s.name)) {
        pool.push(s.name);
      }
    });
  }

  return pool.slice(0, count);
}

// --- DYNAMIC QUESTION GENERATION (Era-filtered from full 3,199-song catalog in singers.json + previews_cache.json) ---
function buildDynamicQuestionsFromSingers(count = 15) {
  const directory = (Array.isArray(singersDirectory) && singersDirectory.length > 0)
    ? singersDirectory
    : ((typeof window !== 'undefined' && Array.isArray(window.singersDirectory)) ? window.singersDirectory : []);

  if (!Array.isArray(directory) || directory.length < 4) {
    return [];
  }

  const activeEras = getActiveEras();
  const usedKeys = loadUsedSongKeys();
  const candidates = [];
  const seenSongTitles = new Set();

  directory.forEach(singer => {
    if (!singer.name || !Array.isArray(singer.songs)) return;
    singer.songs.forEach(song => {
      if (!song || !(song.t || song.title)) return;
      const songTitle = song.t || song.title;
      const cleanTitle = songTitle.toLowerCase().trim();
      const era = getSongEra(song);
      // Zero-leak check: must belong strictly to activeEras
      if (!activeEras.includes(era)) return;
      if (seenSongTitles.has(cleanTitle)) return;
      seenSongTitles.add(cleanTitle);

      const preview = song.preview || song.previewUrl || song.clip || getSongPreview(songTitle, singer.name) || "";
      candidates.push({
        singer: singer.name,
        song: songTitle,
        movie: song.m || song.movie || "Bollywood",
        music: (song.co && song.co.length) ? song.co.join(', ') : "Bollywood",
        year: song.y,
        era: era,
        preview: preview,
        hasPreview: !!preview,
        key: songTitle.toLowerCase().trim()
      });
    });
  });

  if (candidates.length < 4) {
    return [];
  }

  // Prioritize unused songs to eliminate repetition across games
  let unused = candidates.filter(c => !usedKeys.has(c.key));
  // If user has played through the entire era catalog, reset the pool so game never starves
  if (unused.length < count) {
    unused = candidates;
  }

  // Separate unused pool into verified preview tracks and broader catalog tracks
  const withPrev = shuffleArray(unused.filter(c => c.hasPreview));
  const withoutPrev = shuffleArray(unused.filter(c => !c.hasPreview));

  // Blend up to 9 verified preview tracks with 6 catalog tracks for rich variety
  const targetWith = Math.min(withPrev.length, Math.min(count, 9));
  const targetWithout = count - targetWith;

  const selectedCandidates = [
    ...withPrev.slice(0, targetWith),
    ...withoutPrev.slice(0, targetWithout)
  ];

  // If still fewer than count, take whatever remains
  if (selectedCandidates.length < count) {
    const remaining = [...withPrev.slice(targetWith), ...withoutPrev.slice(targetWithout)];
    selectedCandidates.push(...remaining.slice(0, count - selectedCandidates.length));
  }

  // Shuffle the chosen 15 candidates
  const shuffledPool = shuffleArray(selectedCandidates);

  const generated = [];
  const chosenSingers = new Map();

  for (const item of shuffledPool) {
    if (generated.length >= count) break;
    const singerCount = chosenSingers.get(item.singer) || 0;
    // Don't repeat the same singer more than twice unless pool of singers is tiny
    if (singerCount >= 2 && chosenSingers.size < directory.length) {
      continue;
    }

    const distractors = getEraAndGenderMatchedDistractors(item.singer, item.year, item.era, directory, 3);
    if (distractors.length < 3) continue;

    const options = [item.singer, distractors[0], distractors[1], distractors[2]];
    const shuffledOptions = shuffleArray(options);
    const answerIdx = shuffledOptions.indexOf(item.singer);

    generated.push({
      id: 2000 + generated.length,
      clip: item.preview,
      preview: item.preview,
      options: shuffledOptions,
      answer: answerIdx,
      song: item.song,
      movie: item.movie,
      singer: item.singer,
      music: item.music,
      era: item.era,
      difficulty: generated.length < 5 ? "easy" : (generated.length < 10 ? "medium" : "hard"),
      trivia: `${item.singer} ka yeh mashhoor gaana '${item.song}' (${item.movie}) hai.`,
      photo: getSingerPhoto(item.singer)
    });

    chosenSingers.set(item.singer, singerCount + 1);
    recordUsedSongKey(item.key);
  }

  // Fallback pass if singer diversity constraints left us slightly short of count
  if (generated.length < count) {
    for (const item of shuffledPool) {
      if (generated.length >= count) break;
      if (generated.some(g => g.song === item.song && g.singer === item.singer)) continue;

      const distractors = getEraAndGenderMatchedDistractors(item.singer, item.year, item.era, directory, 3);
      if (distractors.length < 3) continue;

      const options = [item.singer, distractors[0], distractors[1], distractors[2]];
      const shuffledOptions = shuffleArray(options);
      const answerIdx = shuffledOptions.indexOf(item.singer);

      generated.push({
        id: 2000 + generated.length,
        clip: item.preview,
        preview: item.preview,
        options: shuffledOptions,
        answer: answerIdx,
        song: item.song,
        movie: item.movie,
        singer: item.singer,
        music: item.music,
        era: item.era,
        difficulty: generated.length < 5 ? "easy" : (generated.length < 10 ? "medium" : "hard"),
        trivia: `${item.singer} ka yeh mashhoor gaana '${item.song}' (${item.movie}) hai.`,
        photo: getSingerPhoto(item.singer)
      });
      recordUsedSongKey(item.key);
    }
  }

  return generated;
}

// --- RANDOMIZATION & SHUFFLE HELPERS (Fix 6) ---
function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function randomizeQuestionOptions(q) {
  if (!q) return q;
  const directory = (Array.isArray(singersDirectory) && singersDirectory.length > 0)
    ? singersDirectory
    : ((typeof window !== 'undefined' && Array.isArray(window.singersDirectory)) ? window.singersDirectory : []);

  if (q.singer && Array.isArray(directory) && directory.length >= 4) {
    const distractors = getEraAndGenderMatchedDistractors(q.singer, q.year, q.era || getSongEra(q.song), directory, 3);
    if (distractors.length >= 3) {
      const options = [q.singer, distractors[0], distractors[1], distractors[2]];
      const shuffledOptions = shuffleArray(options);
      const answerIdx = shuffledOptions.indexOf(q.singer);
      return {
        ...q,
        options: shuffledOptions,
        answer: answerIdx
      };
    }
  }

  if (!Array.isArray(q.options) || q.options.length < 2) return q;
  const correctOptionText = q.options[q.answer];
  const shuffledOptions = shuffleArray(q.options);
  const newAnswerIdx = shuffledOptions.indexOf(correctOptionText);
  return {
    ...q,
    options: shuffledOptions,
    answer: newAnswerIdx
  };
}

function getQuestionsForGame() {
  const activeEras = getActiveEras();
  const dynamicQs = buildDynamicQuestionsFromSingers(15);
  if (dynamicQs.length >= 15) {
    return dynamicQs.map(randomizeQuestionOptions);
  }

  // Combine with curated bank filtered strictly by active eras
  const curatedMatching = (typeof SAMPLE_QUESTIONS !== 'undefined' && SAMPLE_QUESTIONS.length)
    ? SAMPLE_QUESTIONS.filter(q => activeEras.includes(q.era || "retro"))
    : [];

  const combined = [...dynamicQs, ...curatedMatching].filter(q => activeEras.includes(q.era));
  if (combined.length >= 15) {
    return shuffleArray(combined).slice(0, 15).map(randomizeQuestionOptions);
  }
  if (combined.length > 0) {
    // If fewer than 15 total questions exist in this era, loop ONLY matching questions
    const padded = [];
    while (padded.length < 15) {
      padded.push(...shuffleArray(combined));
    }
    return padded.slice(0, 15).map(randomizeQuestionOptions);
  }

  // Ultimate fallback (e.g. if singersDirectory not yet loaded and SAMPLE_QUESTIONS has active era):
  const strictSamples = (typeof SAMPLE_QUESTIONS !== 'undefined' && SAMPLE_QUESTIONS.length)
    ? SAMPLE_QUESTIONS.filter(q => activeEras.includes(q.era || "retro"))
    : [];
  if (strictSamples.length > 0) {
    const padded = [];
    while (padded.length < 15) {
      padded.push(...shuffleArray(strictSamples));
    }
    return padded.slice(0, 15).map(randomizeQuestionOptions);
  }

  // Zero-leak fallback placeholder for active eras
  return Array.from({ length: 15 }, (_, i) => ({
    id: 9000 + i,
    clip: "",
    preview: "",
    options: ["Kishore Kumar", "Mohammed Rafi", "Mukesh", "Manna Dey"],
    answer: 0,
    song: "Gaata Rahe Mera Dil",
    movie: "Guide",
    singer: "Kishore Kumar",
    music: "S. D. Burman",
    era: activeEras[0] || "retro",
    difficulty: i < 5 ? "easy" : (i < 10 ? "medium" : "hard"),
    trivia: "Classic Bollywood music trivia.",
    photo: getSingerPhoto("Kishore Kumar")
  })).map(randomizeQuestionOptions);
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
    usedSongKeys: [],
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

// --- APP TIMER REGISTRY (Kill pending timers on screen transition) ---
let appTimers = [];
function registerAppTimer(timerId) {
  appTimers.push(timerId);
  return timerId;
}
function clearAppTimers() {
  appTimers.forEach(id => clearTimeout(id));
  appTimers = [];
}

// --- ROUTER: show(id) toggles .active ---
window.show = function(screenId) {
  clearAppTimers();
  if (window.audioEngine) {
    window.audioEngine.stopAllMedia(true);
  }
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
  if (window.audioEngine) {
    if (screenId === 'screen-home' || screenId === 'screen-intro') {
      window.audioEngine.playIntroBg();
    } else if (screenId === 'screen-question') {
      window.audioEngine.playQuestionBed();
    } else {
      window.audioEngine.stopBgMusic();
    }
  }

  if (screenId === 'screen-home') renderHome();
  if (screenId === 'screen-intro') renderIntro();
  if (screenId === 'screen-question') renderQuestion();
  if (screenId === 'screen-result') renderResult();
  if (screenId === 'screen-gameover') renderGameOver();
  if (screenId === 'screen-settings') renderSettings();
}

// --- SCREEN 1: HOME ---
function updateThemeMuteUI(isMuted) {
  const btn = document.getElementById('btn-theme-mute');
  const icon = document.getElementById('theme-mute-icon');
  if (!btn || !icon) return;
  const muted = (typeof isMuted === 'boolean') 
    ? isMuted 
    : (window.audioEngine ? window.audioEngine.isThemeMuted() : false);
  if (muted) {
    btn.classList.add('muted');
    icon.textContent = '🔇';
    btn.setAttribute('title', 'Unmute Theme Music');
  } else {
    btn.classList.remove('muted');
    icon.textContent = '🔊';
    btn.setAttribute('title', 'Mute Theme Music');
  }
}

window.toggleThemeMute = function() {
  if (window.audioEngine) {
    const isMuted = window.audioEngine.toggleThemeMute();
    updateThemeMuteUI(isMuted);
  }
};

function renderHome() {
  updateThemeMuteUI();
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
  if (profile.friends.length >= 7) {
    showToast("Adhik-tam 7 dost allow hain!");
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
  const targetId = String(id);
  const found = profile.friends.find(f => String(f.id) === targetId);
  const removedName = found ? found.name : "Dost";
  profile.friends = profile.friends.filter(f => String(f.id) !== targetId);
  saveProfile();
  renderHome();
  showToast(`${removedName} ko list se hata diya gaya!`);
};

// Fix 5: Grand Opening Intro Dialogue ("Namaskar mai hu amarnath bachpan...")
window.startHotSeatGame = function() {
  if (typeof getQuestionsForGame === 'function') {
    game.questions = getQuestionsForGame();
    game.qIndex = 0;
  }
  show('screen-intro');
  if (window.audioEngine) {
    window.audioEngine.cancelVoice();
    const introSpeech = "नमस्कार! मैं हूँ अमरनाथ बच्चन, और आप देख रहे हैं कौन बनेगा करोड़पति! शुरू करते हैं खेल बिना किसी देरी के!";
    window.audioEngine.speak(introSpeech, () => {
      const introScreen = document.getElementById('screen-intro');
      if (!introScreen || !introScreen.classList.contains('active')) return;
      // Announce question 1 after opening monologue concludes
      const upcomingLadder = KBC_LADDER[0];
      const levelAnnouncement = `पहला प्रश्न... ${upcomingLadder.prize} के लिए!`;
      window.audioEngine.speak(levelAnnouncement);
    });
  }
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
        <div id="ladder-row-${idx}" class="ladder-row ${isCurrent ? 'active' : ''} ${isPadaav ? 'padaav' : ''}">
          <span class="ladder-idx">${t.level} ${isCurrent ? '▶' : ''}</span>
          <span class="ladder-val">${t.prize}</span>
        </div>
      `;
    }).join('');

    // Smoothly scroll the upcoming question's row into view and center it
    setTimeout(() => {
      const activeRow = document.getElementById(`ladder-row-${game.qIndex}`);
      if (activeRow) {
        activeRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 250);
  }

  // Vocal announcement of the upcoming question level & prize (for question 2 onwards)
  if (game.qIndex > 0 && window.audioEngine) {
    const upcomingLadder = KBC_LADDER[game.qIndex] || KBC_LADDER[0];
    const qNum = game.qIndex + 1;
    const isPadaav = PADAAV.includes(game.qIndex);
    let levelAnnouncement = `अगला पड़ाव, प्रश्न संख्या ${qNum}... ${upcomingLadder.prize} के लिए!`;
    if (isPadaav) {
      levelAnnouncement = `सावधान! यह एक महत्वपूर्ण पड़ाव है... प्रश्न संख्या ${qNum}... पूरे ${upcomingLadder.prize} के लिए!`;
    }

    registerAppTimer(setTimeout(() => {
      const introScreen = document.getElementById('screen-intro');
      if (introScreen && introScreen.classList.contains('active') && window.audioEngine) {
        window.audioEngine.cancelVoice();
        window.audioEngine.speak(levelAnnouncement);
      }
    }, 450));
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
  ensureQuestionClip(q);
  if (qList[(game.qIndex + 1) % qList.length]) {
    ensureQuestionClip(qList[(game.qIndex + 1) % qList.length]);
  }
  const qNum = document.getElementById('q-num-badge');
  const qPrize = document.getElementById('q-prize-badge');
  const qText = document.getElementById('q-text');

  const promptText = q.question || `Yeh gaana kis gayak ka hai? 🎵 "${q.song}" (${q.movie || ''})`;
  if (qNum) qNum.textContent = `Prashn ${game.qIndex + 1}`;
  if (qPrize) qPrize.textContent = KBC_LADDER[game.qIndex].prize;
  if (qText) qText.textContent = promptText;

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
  stopTimer(); // Keep clock stopped during host's presentation

  // Fix 2: Authentic KBC Presentation Choreography in Native Devanagari
  const isFirst = (game.qIndex === 0);
  const qAnnouncement = isFirst
    ? `पहला सवाल आपकी स्क्रीन पर... इस गाने ${q.song || 'इस गाने'} के गायक कौन हैं?`
    : `अगला सवाल आपकी स्क्रीन पर... इस गाने ${q.song || 'इस गाने'} के गायक कौन हैं?`;

  const activeIndex = game.qIndex;
  const isQuestionActive = () => {
    const qScreen = document.getElementById('screen-question');
    return qScreen && qScreen.classList.contains('active') && game.qIndex === activeIndex && !game.locked;
  };

  if (window.audioEngine) {
    window.audioEngine.cancelVoice();
    window.audioEngine.stopClip();

    // Step 1: Host announces question in Hindi
    window.audioEngine.speak(qAnnouncement, () => {
      if (!isQuestionActive()) return;

      // Step 2: Song clip plays
      window.audioEngine.playClip(q.clip, () => {
        if (!isQuestionActive()) return;

        // Step 3: Host vocally recites all 4 options in Hindi
        const optsText = `ऑप्शन ए: ${q.options[0]}... ऑप्शन बी: ${q.options[1]}... ऑप्शन सी: ${q.options[2]}... ऑप्शन डी: ${q.options[3]}!`;
        window.audioEngine.speak(optsText, () => {
          if (!isQuestionActive()) return;

          // Step 4: Host declares timer start in Hindi
          window.audioEngine.speak("आपका समय शुरू होता है... अब!", () => {
            if (!isQuestionActive()) return;

            // Step 5: Clock begins ticking and countdown starts!
            startTimer();
          });
        });
      });
    });
  } else {
    startTimer();
  }
}

window.playQuestionClip = function() {
  const qList = game.questions.length ? game.questions : SAMPLE_QUESTIONS;
  const q = qList[game.qIndex % qList.length];
  if (window.audioEngine) {
    if (!q.clip || (typeof q.clip === 'string' && !q.clip.startsWith('http'))) {
      ensureQuestionClip(q).then(clipUrl => {
        window.audioEngine.playClip(clipUrl || q.clip);
      });
    } else {
      window.audioEngine.playClip(q.clip);
    }
  }
};

function startTimer() {
  stopTimer();
  const timerDisplay = document.getElementById('q-timer-display');
  const ringProgress = document.getElementById('timer-ring-progress');
  const diff = profile.difficulty || 'easy';
  const maxSec = TIMER_PRESETS[diff];

  // Fix 1: Casual mode has no timer capping / time limit
  if (diff === 'casual' || maxSec === null || maxSec === undefined) {
    game.timerSeconds = null;
    if (timerDisplay) timerDisplay.textContent = '∞';
    if (ringProgress) {
      ringProgress.style.strokeDashoffset = 0;
      ringProgress.classList.remove('danger');
    }
    return;
  }

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
  if (!totalSec) {
    ring.style.strokeDashoffset = 0;
    ring.classList.remove('danger');
    return;
  }
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
  if (window.audioEngine) {
    window.audioEngine.cancelVoice();
    window.audioEngine.stopClip();
  }
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
    window.audioEngine.cancelVoice();
    window.audioEngine.stopClip();
    // Fix 3: Host asks: "ऑप्शन X: {singer name} को लॉक किया जाए?"
    const hindiLetter = { "A": "ए", "B": "बी", "C": "सी", "D": "डी" }[letter] || letter;
    window.audioEngine.speak(`ऑप्शन ${hindiLetter}: ${optName} को लॉक किया जाए?`);
  }
};

window.declineLock = function() {
  const modal = document.getElementById('modal-lock-confirm');
  if (modal) modal.classList.remove('active');
  game.selectedOption = null;
  document.querySelectorAll('.option-card').forEach(el => el.classList.remove('selected'));
  if (window.audioEngine) window.audioEngine.cancelVoice();
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
  if (suspText) suspText.textContent = `Computer ji, lock kar dijiye!`;
  if (suspenseModal) suspenseModal.classList.add('active');

  // Fix 3: Host commands: "कंप्यूटर जी... लॉक कर दीजिए!" with suspense music
  if (window.audioEngine) {
    window.audioEngine.startTensionLoop();
    window.audioEngine.speak("कंप्यूटर जी... लॉक कर दीजिए!");
  }

  setTimeout(() => {
    if (suspenseModal) suspenseModal.classList.remove('active');
    if (window.audioEngine) window.audioEngine.stopTensionLoop();
    evaluateAnswer(game.selectedOption);
  }, 2600);
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
      // Fix 4: Vocal praise and exact prize won declaration in Devanagari
      window.audioEngine.speak(`बिल्कुल सही जवाब! अद्भुत! आप जीत चुके हैं ${KBC_LADDER[game.qIndex].prize}!`);
    }
  } else {
    // Wrong answer drops winnings to guaranteed padaav prize
    game.currentPrize = game.guaranteedPrize || "₹ 0";
    if (window.audioEngine) {
      window.audioEngine.playWrongSting();
      const answerLetter = ["A", "B", "C", "D"][q.answer];
      const hindiLetter = { "A": "ए", "B": "बी", "C": "सी", "D": "डी" }[answerLetter] || answerLetter;
      // Fix 4: Vocal wrong announcement with correct answer and final money won in Devanagari
      const wonText = (game.guaranteedPrize && game.guaranteedPrize !== "₹ 0")
        ? `आपने जीते हैं ${game.guaranteedPrize}!`
        : "आप यहाँ से बिना किसी धनराशि के जा रहे हैं!";
      window.audioEngine.speak(`गलत जवाब! सही उत्तर था ऑप्शन ${hindiLetter}: ${q.options[q.answer]}! ${wonText}`);
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
    // Find popular songs for this singer from singers.json
    let singerSongsHtml = '';
    const normSinger = (q.singer || '').toLowerCase().trim().replace(/^mohd\.?\s+/i, 'mohammed ').replace(/[^a-z0-9]/g, '');
    const entry = singersDirectory.find(s => {
      const sNorm = (s.name || '').toLowerCase().trim().replace(/^mohd\.?\s+/i, 'mohammed ').replace(/[^a-z0-9]/g, '');
      return sNorm === normSinger || normSinger.includes(sNorm) || sNorm.includes(normSinger);
    });

    if (entry && Array.isArray(entry.songs) && entry.songs.length > 0) {
      const topSongs = entry.songs.slice(0, 4);
      singerSongsHtml = `
        <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed rgba(212,175,55,0.25); text-align: left;">
          <div style="font-size: 11px; font-weight: 800; color: var(--gold-secondary); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">🎼 ${escapeHtml(entry.name || q.singer)} Ke Mashhoor Gaane:</div>
          <div style="display: flex; flex-wrap: wrap; gap: 5px;">
            ${topSongs.map(s => `<span style="background: rgba(14,26,56,0.8); border: 1px solid rgba(212,175,55,0.3); border-radius: 12px; padding: 2px 8px; font-size: 11px; color: #fff;">🎶 ${escapeHtml(s.t || s.title || s.name || '')}${s.m ? ` <span style="opacity:0.7">(${escapeHtml(s.m)})</span>` : ''}</span>`).join('')}
          </div>
        </div>
      `;
    }

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
      ${singerSongsHtml}
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
  if (window.audioEngine) {
    window.audioEngine.playPadaavSting();
  }
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

  const voiceSelect = document.getElementById('settings-voice-select');
  if (voiceSelect) voiceSelect.value = profile.voiceMode || 'madhur';

  const pitchSlider = document.getElementById('settings-pitch-slider');
  const pitchVal = (typeof profile.voicePitch === 'number') ? profile.voicePitch : -6;
  if (pitchSlider) {
    pitchSlider.value = pitchVal;
    updatePitchDisplay(pitchVal);
  }

  const speedSlider = document.getElementById('settings-speed-slider');
  const speedVal = (typeof profile.voiceSpeed === 'number') ? profile.voiceSpeed : 1.0;
  if (speedSlider) {
    speedSlider.value = speedVal;
    updateSpeedDisplay(speedVal);
  }

  // Populate Era Checkboxes
  const activeEras = getActiveEras();
  const checkboxes = document.querySelectorAll('input[name="music-era"]');
  checkboxes.forEach(cb => {
    cb.checked = activeEras.includes(cb.value);
  });
  updateSelectAllErasButtonText();
}

function updateSelectAllErasButtonText() {
  const checkboxes = Array.from(document.querySelectorAll('input[name="music-era"]'));
  const allChecked = checkboxes.length > 0 && checkboxes.every(cb => cb.checked);
  const btnText = document.getElementById('btn-select-all-eras-text');
  if (btnText) {
    btnText.textContent = allChecked ? "Sabhi Hatayein (Deselect All)" : "Sabhi Daur (Select All)";
  }
}

window.onEraCheckboxChange = function() {
  const checkboxes = Array.from(document.querySelectorAll('input[name="music-era"]'));
  const checked = checkboxes.filter(cb => cb.checked);
  if (checked.length === 0) {
    showToast("Kam se kam ek daur chuna hona chahiye!");
    checkboxes.forEach(cb => { cb.checked = true; });
  }
  updateSelectAllErasButtonText();
};

window.toggleSelectAllEras = function() {
  const checkboxes = Array.from(document.querySelectorAll('input[name="music-era"]'));
  const allChecked = checkboxes.length > 0 && checkboxes.every(cb => cb.checked);
  checkboxes.forEach(cb => {
    cb.checked = !allChecked;
  });
  if (allChecked && checkboxes.length > 0) {
    checkboxes[0].checked = true;
  }
  updateSelectAllErasButtonText();
};

window.updatePitchDisplay = function(val) {
  const label = document.getElementById('settings-pitch-val');
  if (!label) return;
  const num = parseInt(val, 10);
  let desc = "Normal";
  if (num <= -8) desc = "Very Deep (Bachchan)";
  else if (num <= -4) desc = "Deep Baritone";
  else if (num < 0) desc = "Warm";
  else if (num > 0) desc = "High Pitch";
  label.textContent = `${num > 0 ? '+' : ''}${num} Hz (${desc})`;
};

window.updateSpeedDisplay = function(val) {
  const label = document.getElementById('settings-speed-val');
  if (!label) return;
  const num = parseFloat(val);
  let desc = "Normal";
  if (num <= 0.85) desc = "Slow & Dramatic";
  else if (num >= 1.2) desc = "Fast & Peppy";
  else if (num >= 1.1) desc = "Brisk";
  label.textContent = `${num.toFixed(2)}x (${desc})`;
};

window.onVoicePersonaChange = function() {
  const voiceSelect = document.getElementById('settings-voice-select');
  const pitchSlider = document.getElementById('settings-pitch-slider');
  const speedSlider = document.getElementById('settings-speed-slider');
  if (!voiceSelect) return;

  const mode = voiceSelect.value;
  if (mode === 'madhur') {
    if (pitchSlider) { pitchSlider.value = -6; updatePitchDisplay(-6); }
    if (speedSlider) { speedSlider.value = 1.0; updateSpeedDisplay(1.0); }
  } else if (mode === 'swara') {
    if (pitchSlider) { pitchSlider.value = 0; updatePitchDisplay(0); }
    if (speedSlider) { speedSlider.value = 1.0; updateSpeedDisplay(1.0); }
  } else if (mode === 'rj') {
    if (pitchSlider) { pitchSlider.value = 2; updatePitchDisplay(2); }
    if (speedSlider) { speedSlider.value = 1.2; updateSpeedDisplay(1.2); }
  }
};

window.testHostVoice = function() {
  const voiceSelect = document.getElementById('settings-voice-select');
  const pitchSlider = document.getElementById('settings-pitch-slider');
  const speedSlider = document.getElementById('settings-speed-slider');

  const selectedVoice = voiceSelect ? voiceSelect.value : (profile.voiceMode || 'madhur');
  const selectedPitch = pitchSlider ? parseInt(pitchSlider.value, 10) : -6;
  const selectedSpeed = speedSlider ? parseFloat(speedSlider.value) : 1.0;

  // Temporarily apply to profile for the test utterance
  const origVoice = profile.voiceMode;
  const origPitch = profile.voicePitch;
  const origSpeed = profile.voiceSpeed;

  profile.voiceMode = selectedVoice;
  profile.voicePitch = selectedPitch;
  profile.voiceSpeed = selectedSpeed;

  if (window.audioEngine) {
    window.audioEngine.cancelVoice();
    let previewSpeech = "नमस्कार! मैं हूँ आपका होस्ट, और आप देख रहे हैं सुर केबीसी! आपका स्वागत है!";
    if (selectedVoice === 'swara') {
      previewSpeech = "नमस्कार! मैं हूँ आपकी होस्ट स्वरा! सुर केबीसी में आप सभी का स्वागत है!";
    } else if (selectedVoice === 'rj') {
      previewSpeech = "हेल्लो दोस्तों! मैं हूँ आपका रेडियो आर-जे! चलिए शुरू करते हैं सुर केबीसी का ये धमाकेदार खेल!";
    }
    showToast("Voice Preview chalu...");
    window.audioEngine.speak(previewSpeech, () => {
      // Revert temporary preview state
      profile.voiceMode = origVoice;
      profile.voicePitch = origPitch;
      profile.voiceSpeed = origSpeed;
    });
  }
};

window.saveSettings = function() {
  const diffSelect = document.getElementById('settings-difficulty-select');
  const voiceSelect = document.getElementById('settings-voice-select');
  const pitchSlider = document.getElementById('settings-pitch-slider');
  const speedSlider = document.getElementById('settings-speed-slider');

  if (diffSelect) profile.difficulty = diffSelect.value;
  if (voiceSelect) profile.voiceMode = voiceSelect.value;
  if (pitchSlider) profile.voicePitch = parseInt(pitchSlider.value, 10);
  if (speedSlider) profile.voiceSpeed = parseFloat(speedSlider.value);

  // Collect checked music eras
  const eraCheckboxes = Array.from(document.querySelectorAll('input[name="music-era"]'));
  const checkedEras = eraCheckboxes.filter(cb => cb.checked).map(cb => cb.value);
  profile.selectedEras = checkedEras.length > 0
    ? checkedEras
    : ["golden", "retro", "90s", "2000s", "2010s", "modern"];

  saveProfile();
  game = createNewGameState();
  showToast("Settings & Voice Save Ho Gayi!");
  show('screen-home');
};

// ==========================================================================
// PHASE 2B: REAL LIFELINE IMPLEMENTATIONS
// ==========================================================================

// c2B.1: 50:50 Lifeline
window.useFiftyFifty = function() {
  const isCasual = (profile.difficulty === 'casual');
  if (!isCasual && game.used.fifty) {
    showToast("Ye lifeline use ho chuki hai!");
    return;
  }
  if (game.locked) return;

  if (!isCasual) {
    game.used.fifty = true;
  }
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
  const isCasual = (profile.difficulty === 'casual');
  if (!isCasual && game.used.poll) {
    showToast("Ye lifeline use ho chuki hai!");
    return;
  }
  if (game.locked) return;

  stopTimer(); // Pause timer during poll modal
  if (!isCasual) {
    game.used.poll = true;
  }
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
  const isCasual = (profile.difficulty === 'casual');
  if (!isCasual && game.used.phone) {
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

  const qList = game.questions.length ? game.questions : SAMPLE_QUESTIONS;
  const q = qList[game.qIndex % qList.length];
  const qPrompt = q.question || `Gaana '${q.song}' (${q.movie || "Bollywood"}) kis gaayak ne gaya hai?`;
  const clipParam = encodeURIComponent(q.clip || q.preview || "");
  const qTextParam = encodeURIComponent(qPrompt);
  const optsParam = encodeURIComponent(JSON.stringify(q.options));
  const playerParam = encodeURIComponent(profile.name || "Khiladi");

  // Set Call links & Init PeerJS
  const activeSess = game.sessionId || 'game';
  initPlayerPeerSession();
  const playerAudio = document.getElementById('btn-player-jitsi-audio');
  const playerVideo = document.getElementById('btn-player-jitsi-video');
  const baseCallUrl = `/friend-call.html?session=${encodeURIComponent(activeSess)}&clip=${clipParam}&q=${qTextParam}&opts=${optsParam}&player=${playerParam}`;
  if (playerAudio) playerAudio.href = `${baseCallUrl}&mode=audio`;
  if (playerVideo) playerVideo.href = `${baseCallUrl}&mode=video`;

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
        question: q.question || `${q.singer} ka gaana pehchano: '${q.song}' kisne gaya?`,
        options: q.options,
        clip: q.clip || q.preview || "",
        playerName: profile.name
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.delivered) {
        if (waitMsg) waitMsg.textContent = `✅ ${friend.name} ko automated WhatsApp sandesh bhej diya gaya!`;
      } else {
        if (waitMsg) {
          const manualLink = (data && data.waLink) ? data.waLink : `https://wa.me/?text=${encodeURIComponent(qPrompt)}`;
          waitMsg.innerHTML = `Helpline sakriya hai. <a href="${manualLink}" target="_blank" style="color:var(--neon-cyan);text-decoration:underline;display:inline-block;margin-top:4px;">(WhatsApp par sandesh bhejein ↗)</a>`;
        }
      }
    } else {
      if (waitMsg) {
        waitMsg.textContent = `${friend.name} ke liye in-game helpline chalu hai.`;
      }
    }
  } catch (e) {
    if (waitMsg) {
      waitMsg.textContent = `${friend.name} ke liye in-game helpline chalu hai.`;
    }
  }

  startFriendAnswerListener(friend.name);
};

function fallbackDirectWhatsAppShare(friend, q) {
  // Switch to manual input mode for reliable offline entry without hijacking browser window
  const pickerArea = document.getElementById('phone-friend-picker-area');
  const waitingArea = document.getElementById('phone-friend-waiting-area');
  const manualArea = document.getElementById('phone-friend-manual-area');
  if (pickerArea) pickerArea.style.display = 'none';
  if (waitingArea) waitingArea.style.display = 'none';
  if (manualArea) manualArea.style.display = 'block';
  showToast("Manual vikalp entry sakriya!");
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

  // Mark lifeline used (only for non-casual)
  if (profile.difficulty !== 'casual') {
    game.used.phone = true;
  }
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
    window.audioEngine.playVoice('phone', `${friendName} ne kaha: Option ${optLetter}, ${optName}`);
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
        // Ensure local microphone/camera stream is ready
        if (!playerLocalMediaStream) {
          playerLocalMediaStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: (callMode === 'video')
          });
        }

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
    if (remoteVid) {
      remoteVid.srcObject = remoteStream;
      remoteVid.play().catch(e => console.warn('Player remote video play error:', e));
    }
  } else {
    const remoteAud = document.getElementById('player-remote-audio');
    if (remoteAud) {
      remoteAud.srcObject = remoteStream;
      remoteAud.muted = false;
      remoteAud.volume = 1.0;
      remoteAud.play().catch(e => console.warn('Player remote audio play error:', e));
    }
  }

  // Auto re-ask question, play song clip, and vocally read options to Player
  triggerPlayerAutoReaskSequence();
}

let playerHasReasked = false;
let playerTtsCancel = false;
let playerCallClipAudio = null;

function triggerPlayerAutoReaskSequence() {
  if (playerHasReasked) return;
  playerHasReasked = true;
  playerTtsCancel = false;

  const qList = game.questions.length ? game.questions : SAMPLE_QUESTIONS;
  const q = qList[game.qIndex % qList.length];
  if (!q) return;

  const qPrompt = q.question || `Gaana '${q.song}' kis gaayak ne gaya hai?`;
  const clipUrl = q.clip || q.preview || "";
  const opts = q.options || [];

  setTimeout(() => {
    if (playerTtsCancel) return;

    // 1. Speak Question
    const qSpeech = `Sawaal hai: ${qPrompt}. Kripya gaana sunein.`;
    if (window.audioEngine && window.audioEngine.speak) {
      window.audioEngine.speak(qSpeech, () => {
        if (playerTtsCancel) return;

        // 2. Play Song Clip
        if (clipUrl) {
          if (playerCallClipAudio) {
            try { playerCallClipAudio.pause(); } catch (e) {}
          }
          playerCallClipAudio = new Audio(clipUrl);
          playerCallClipAudio.volume = 1.0;
          playerCallClipAudio.play().then(() => {
            let ended = false;
            const onEnd = () => {
              if (ended) return;
              ended = true;
              readPlayerOptionsVocally(opts);
            };
            playerCallClipAudio.onended = onEnd;
            setTimeout(onEnd, 12000);
          }).catch(() => {
            readPlayerOptionsVocally(opts);
          });
        } else {
          readPlayerOptionsVocally(opts);
        }
      });
    }
  }, 1000);
}

function readPlayerOptionsVocally(opts) {
  if (playerTtsCancel) return;
  if (Array.isArray(opts) && opts.length >= 4) {
    const letters = ["Option A", "Option B", "Option C", "Option D"];
    const optSpeech = `Vikalp hain: ${letters[0]}, ${opts[0]}. ${letters[1]}, ${opts[1]}. ${letters[2]}, ${opts[2]}. ${letters[3]}, ${opts[3]}.`;
    if (window.audioEngine && window.audioEngine.speak) {
      window.audioEngine.speak(optSpeech);
    }
  }
}

function stopPlayerAutoReaskSequence() {
  playerTtsCancel = true;
  playerHasReasked = false;
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  if (playerCallClipAudio) {
    try {
      playerCallClipAudio.pause();
      playerCallClipAudio.currentTime = 0;
    } catch (e) {}
    playerCallClipAudio = null;
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
  stopPlayerAutoReaskSequence();
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
  const isCasual = (profile.difficulty === 'casual');
  if (!isCasual && game.used.flip) {
    showToast("Ye lifeline use ho chuki hai!");
    return;
  }
  if (game.locked) return;

  if (!isCasual) {
    game.used.flip = true;
  }
  updateLifelineHUD();

  const currentQ = game.questions[game.qIndex];
  const freshQs = buildDynamicQuestionsFromSingers(5);
  const replacement = freshQs.find(q => !game.questions.some(g => g.song === q.song && g.singer === q.singer)) || freshQs[0];

  if (replacement) {
    game.questions[game.qIndex] = replacement;
  } else {
    // If no dynamic question available, pick from SAMPLE_QUESTIONS matching active eras
    const activeEras = getActiveEras();
    const backup = SAMPLE_QUESTIONS.find(q => (!currentQ || q.id !== currentQ.id) && activeEras.includes(q.era || "retro"));
    if (backup) {
      game.questions[game.qIndex] = randomizeQuestionOptions(backup);
    }
  }

  showToast("Prashn Badal Diya Gaya!");
  // Restart timer & render new question
  renderQuestion();
};

// Lifeline Dispatcher
window.useLifeline = function(type) {
  if (game.used && !game.used[type] && window.audioEngine) {
    window.audioEngine.playLifelineSting();
  }
  if (type === 'fifty') useFiftyFifty();
  else if (type === 'phone') usePhoneAFriend();
  else if (type === 'poll') useAudiencePoll();
  else if (type === 'flip') useFlipQuestion();
};

// c2B.5: Lifeline HUD Update (dims used buttons across all screens)
function updateLifelineHUD() {
  const isCasual = (profile.difficulty === 'casual');
  const keys = ['fifty', 'phone', 'poll', 'flip'];
  keys.forEach(k => {
    const btn = document.getElementById(`lifeline-btn-${k}`);
    if (btn) {
      if (!isCasual && game.used[k]) {
        btn.classList.add('used');
      } else {
        btn.classList.remove('used');
      }
    }
  });
}

function updateLifelineChips() {
  const isCasual = (profile.difficulty === 'casual');
  const keys = ['fifty', 'phone', 'poll', 'flip'];
  keys.forEach(k => {
    const chip = document.getElementById(`intro-chip-${k}`);
    if (chip) {
      if (!isCasual && game.used[k]) {
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

// --- FIX 4: ONE-TIME SECURITY CODE ONBOARDING GATE (Code: 0504) ---
function checkSecurityCodeOnLoad() {
  const isAuthPassed = localStorage.getItem('surkbc_auth_passed') === 'true';
  const modal = document.getElementById('modal-security-gate');
  if (!isAuthPassed && modal) {
    modal.classList.add('active');
    const input = document.getElementById('input-security-code');
    if (input) {
      input.value = '';
      setTimeout(() => input.focus(), 300);
    }
  }
}

window.submitSecurityCode = function() {
  const input = document.getElementById('input-security-code');
  const errorMsg = document.getElementById('security-error-msg');
  const modal = document.getElementById('modal-security-gate');
  if (!input) return;

  const entered = input.value.trim();
  if (entered === DEFAULT_SECURITY_CODE) {
    localStorage.setItem('surkbc_auth_passed', 'true');
    if (modal) modal.classList.remove('active');
    if (errorMsg) errorMsg.style.display = 'none';
    showToast("Suraksha Code Swikaar! Swagat Hai!");
  } else {
    if (errorMsg) errorMsg.style.display = 'block';
    input.classList.add('shake');
    setTimeout(() => input.classList.remove('shake'), 500);
    input.value = '';
    input.focus();
  }
};

// Initializer
document.addEventListener('DOMContentLoaded', () => {
  // Check one-time security code for first-time user
  checkSecurityCodeOnLoad();

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
