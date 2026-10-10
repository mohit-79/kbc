// ==========================================================================
// SurKBC — questions.js
// Curated Question Bank & Schema Documentation
//
// SCHEMA:
// {
//   id: number,                 // Unique question ID
//   clip: string,               // Path or audio hook identifier
//   options: [string, string, string, string], // 4 multiple choice options
//   answer: number,             // 0-based index of correct option (0, 1, 2, or 3)
//   song: string,               // Bollywood song title
//   movie: string,              // Film title / Album name
//   singer: string,             // Correct playback singer name
//   music: string,              // Music director / composer
//   difficulty: "easy" | "medium" | "hard", // Difficulty tier
//   trivia: string,             // Interesting Bollywood trivia fact
//   photo?: string              // Wikimedia Commons / local avatar image path
// }
// ==========================================================================

const SAMPLE_QUESTIONS = [
  // --- 5 EASY QUESTIONS ---
  {
    id: 1,
    clip: "tum_hi_ho",
    options: ["Arijit Singh", "Sonu Nigam", "KK", "Mohd. Rafi"],
    answer: 0,
    song: "Tum Hi Ho",
    movie: "Aashiqui 2",
    singer: "Arijit Singh",
    music: "Mithoon",
    difficulty: "easy",
    trivia: "Arijit Singh won his first Filmfare Award for Best Male Playback Singer for 'Tum Hi Ho' in 2013.",
    photo: "images/singers/arijit.jpg"
  },
  {
    id: 2,
    clip: "kal_ho_naa_ho",
    options: ["Kishore Kumar", "Sonu Nigam", "Shaan", "Udit Narayan"],
    answer: 1,
    song: "Kal Ho Naa Ho",
    movie: "Kal Ho Naa Ho",
    singer: "Sonu Nigam",
    music: "Shankar-Ehsaan-Loy",
    difficulty: "easy",
    trivia: "Sonu Nigam received the National Film Award for Best Male Playback Singer in 2004 for this track.",
    photo: "images/singers/sonu.jpg"
  },
  {
    id: 3,
    clip: "pal",
    options: ["Lucky Ali", "Mohit Chauhan", "KK", "Shaan"],
    answer: 2,
    song: "Pal",
    movie: "Pal (Album)",
    singer: "KK",
    music: "Leslie Lewis",
    difficulty: "easy",
    trivia: "Released in 1999, 'Pal' became an eternal youth anthem for farewells and lifelong memories.",
    photo: "images/singers/kk.jpg"
  },
  {
    id: 4,
    clip: "deewani_mastani",
    options: ["Sunidhi Chauhan", "Shreya Ghoshal", "Lata Mangeshkar", "Alka Yagnik"],
    answer: 1,
    song: "Deewani Mastani",
    movie: "Bajirao Mastani",
    singer: "Shreya Ghoshal",
    music: "Sanjay Leela Bhansali",
    difficulty: "easy",
    trivia: "Shreya Ghoshal won the Filmfare Award for Best Female Playback Singer for her ethereal vocals here.",
    photo: "images/singers/shreya.jpg"
  },
  {
    id: 5,
    clip: "roop_tera_mastana",
    options: ["Kishore Kumar", "Mohd. Rafi", "Mukesh", "Manna Dey"],
    answer: 0,
    song: "Roop Tera Mastana",
    movie: "Aradhana",
    singer: "Kishore Kumar",
    music: "S. D. Burman",
    difficulty: "easy",
    trivia: "Filmed in a single continuous camera take, this 1969 track won Kishore Kumar his first Filmfare Award.",
    photo: "images/singers/kishore.jpg"
  },

  // --- 5 MEDIUM QUESTIONS ---
  {
    id: 6,
    clip: "chaiyya_chaiyya",
    options: ["Lucky Ali", "Sukhwinder Singh", "Daler Mehndi", "Mika Singh"],
    answer: 1,
    song: "Chaiyya Chaiyya",
    movie: "Dil Se..",
    singer: "Sukhwinder Singh",
    music: "A. R. Rahman",
    difficulty: "medium",
    trivia: "Sukhwinder Singh recorded this iconic moving-train track with Sapna Awasthi, composed by A. R. Rahman.",
    photo: "images/singers/sukhwinder.jpg"
  },
  {
    id: 7,
    clip: "lag_jaa_gale",
    options: ["Asha Bhosle", "Geeta Dutt", "Lata Mangeshkar", "Noor Jehan"],
    answer: 2,
    song: "Lag Jaa Gale",
    movie: "Woh Kaun Thi?",
    singer: "Lata Mangeshkar",
    music: "Madan Mohan",
    difficulty: "medium",
    trivia: "Initially rejected by the film director, Madan Mohan and Lata ji insisted on keeping this timeless ghazal.",
    photo: "images/singers/lata.jpg"
  },
  {
    id: 8,
    clip: "pee_loon",
    options: ["Mohit Chauhan", "Atif Aslam", "Rahat Fateh Ali Khan", "Javed Ali"],
    answer: 0,
    song: "Pee Loon",
    movie: "Once Upon a Time in Mumbaai",
    singer: "Mohit Chauhan",
    music: "Pritam",
    difficulty: "medium",
    trivia: "Mohit Chauhan's silky mountain-folk inflection gave this retro underworld romance its distinctive heart.",
    photo: "images/singers/mohit.jpg"
  },
  {
    id: 9,
    clip: "kamli",
    options: ["Neha Kakkar", "Sunidhi Chauhan", "Monali Thakur", "Kanika Kapoor"],
    answer: 1,
    song: "Kamli",
    movie: "Dhoom 3",
    singer: "Sunidhi Chauhan",
    music: "Pritam",
    difficulty: "medium",
    trivia: "Sunidhi Chauhan delivered powerhouse high-octane Sufi-dance vocals over complex rhythmic shifts.",
    photo: "images/singers/sunidhi.jpg"
  },
  {
    id: 10,
    clip: "kabhie_kabhie_mere_dil_mein",
    options: ["Mukesh", "Mohd. Rafi", "Hemant Kumar", "Talat Mahmood"],
    answer: 0,
    song: "Kabhi Kabhie Mere Dil Mein",
    movie: "Kabhi Kabhie",
    singer: "Mukesh",
    music: "Khayyam",
    difficulty: "medium",
    trivia: "Mukesh won the National Film Award for Best Male Playback Singer for this poignant Sahir Ludhianvi poetry.",
    photo: "images/singers/mukesh.jpg"
  },

  // --- 5 HARD QUESTIONS ---
  {
    id: 11,
    clip: "kuhu_kuhu_bole_koyaliya",
    options: ["Manna Dey & Lata Mangeshkar", "Mohd. Rafi & Lata Mangeshkar", "Kishore Kumar & Asha Bhosle", "Bhupen Hazarika & Suman Kalyanpur"],
    answer: 1,
    song: "Kuhu Kuhu Bole Koyaliya",
    movie: "Suvarna Sundari",
    singer: "Mohd. Rafi & Lata Mangeshkar",
    music: "Adi Narayana Rao",
    difficulty: "hard",
    trivia: "A legendary classical jugalbandi weaving four classical ragas: Sohni, Bahar, Jaunpuri, and Yaman Kalyan.",
    photo: "images/singers/rafi.jpg"
  },
  {
    id: 12,
    clip: "tu_hi_re",
    options: ["Hariharan", "S. P. Balasubrahmanyam", "K. J. Yesudas", "Udit Narayan"],
    answer: 0,
    song: "Tu Hi Re",
    movie: "Bombay",
    singer: "Hariharan",
    music: "A. R. Rahman",
    difficulty: "hard",
    trivia: "Hariharan blended classical ghazal dynamics with symphonic orchestration, featuring Kavita Krishnamurthy.",
    photo: "images/singers/hariharan.jpg"
  },
  {
    id: 13,
    clip: "laaga_chunari_mein_daag",
    options: ["Bhimsen Joshi", "Manna Dey", "Pandit Jasraj", "K. L. Saigal"],
    answer: 1,
    song: "Laaga Chunari Mein Daag",
    movie: "Dil Hi To Hai",
    singer: "Manna Dey",
    music: "Roshan",
    difficulty: "hard",
    trivia: "Composed in Raga Bhairavi, Manna Dey executed blistering taans that became a gold standard for classical film songs.",
    photo: "images/singers/manna.jpg"
  },
  {
    id: 14,
    clip: "kun_faya_kun",
    options: ["Rahat Fateh Ali Khan & Javed Ali", "A. R. Rahman, Javed Ali & Mohit Chauhan", "Nizami Brothers & Kailash Kher", "Atif Aslam & Sukhwinder Singh"],
    answer: 1,
    song: "Kun Faya Kun",
    movie: "Rockstar",
    singer: "A. R. Rahman, Javed Ali & Mohit Chauhan",
    music: "A. R. Rahman",
    difficulty: "hard",
    trivia: "Recorded in honor of Hazrat Nizamuddin Auliya, this Sufi qawwali blends Arabic hymns with Urdu poetry.",
    photo: "images/singers/arrahman.jpg"
  },
  {
    id: 15,
    clip: "zindagi_kaisi_hai_paheli",
    options: ["Mukesh", "Talat Mahmood", "Manna Dey", "Kishore Kumar"],
    answer: 2,
    song: "Zindagi Kaisi Hai Paheli",
    movie: "Anand",
    singer: "Manna Dey",
    music: "Salil Chowdhury",
    difficulty: "hard",
    trivia: "Salil Chowdhury originally envisioned this as a background instrumental before lyricist Yogesh and Manna Dey turned it into an immortal classic.",
    photo: "images/singers/manna.jpg"
  }
];
