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
    clip: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/3a/8c/9b/3a8c9b0b-2def-750a-f615-1555bf941edf/mzaf_17229496441442805917.plus.aac.p.m4a",
    options: ["Arijit Singh", "Sonu Nigam", "KK", "Mohd. Rafi"],
    answer: 0,
    song: "Tum Hi Ho",
    movie: "Aashiqui 2",
    singer: "Arijit Singh",
    music: "Mithoon",
    difficulty: "easy",
    era: "2010s",
    trivia: "Arijit Singh won his first Filmfare Award for Best Male Playback Singer for 'Tum Hi Ho' in 2013.",
    photo: "images/singers/arijit.jpg"
  },
  {
    id: 2,
    clip: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f2/dc/3d/f2dc3d30-c133-b7db-b78f-235c1439f1f2/mzaf_956586774622856416.plus.aac.p.m4a",
    options: ["Kishore Kumar", "Sonu Nigam", "Shaan", "Udit Narayan"],
    answer: 1,
    song: "Kal Ho Naa Ho",
    movie: "Kal Ho Naa Ho",
    singer: "Sonu Nigam",
    music: "Shankar-Ehsaan-Loy",
    difficulty: "easy",
    era: "2000s",
    trivia: "Sonu Nigam received the National Film Award for Best Male Playback Singer in 2004 for this track.",
    photo: "images/singers/sonu.jpg"
  },
  {
    id: 3,
    clip: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/99/10/12/9910123a-acad-39b2-75e9-f6a8f7e2534f/mzaf_12778523448332716611.plus.aac.p.m4a",
    options: ["Lucky Ali", "Mohit Chauhan", "KK", "Shaan"],
    answer: 2,
    song: "Pal",
    movie: "Pal (Album)",
    singer: "KK",
    music: "Leslie Lewis",
    difficulty: "easy",
    era: "90s",
    trivia: "Released in 1999, 'Pal' became an eternal youth anthem for farewells and lifelong memories.",
    photo: "images/singers/kk.jpg"
  },
  {
    id: 4,
    clip: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/ef/e6/b9/efe6b9d4-3318-19ff-01fa-5c51f2ffe9b9/mzaf_3533703985365202572.plus.aac.p.m4a",
    options: ["Sunidhi Chauhan", "Shreya Ghoshal", "Lata Mangeshkar", "Alka Yagnik"],
    answer: 1,
    song: "Deewani Mastani",
    movie: "Bajirao Mastani",
    singer: "Shreya Ghoshal",
    music: "Sanjay Leela Bhansali",
    difficulty: "easy",
    era: "2010s",
    trivia: "Shreya Ghoshal won the Filmfare Award for Best Female Playback Singer for her ethereal vocals here.",
    photo: "images/singers/shreya.jpg"
  },
  {
    id: 5,
    clip: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/79/58/eb/7958eb6f-6176-d61f-fc74-784a1344a910/mzaf_4397804685168371744.plus.aac.p.m4a",
    options: ["Kishore Kumar", "Mohd. Rafi", "Mukesh", "Manna Dey"],
    answer: 0,
    song: "Roop Tera Mastana",
    movie: "Aradhana",
    singer: "Kishore Kumar",
    music: "S. D. Burman",
    difficulty: "easy",
    era: "golden",
    trivia: "Filmed in a single continuous camera take, this 1969 track won Kishore Kumar his first Filmfare Award.",
    photo: "images/singers/kishore.jpg"
  },

  // --- 5 MEDIUM QUESTIONS ---
  {
    id: 6,
    clip: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/81/6c/e7/816ce721-3a37-0e57-3aa7-c3e180c4b38c/mzaf_10595670915474775723.plus.aac.p.m4a",
    options: ["Lucky Ali", "Sukhwinder Singh", "Daler Mehndi", "Mika Singh"],
    answer: 1,
    song: "Chaiyya Chaiyya",
    movie: "Dil Se..",
    singer: "Sukhwinder Singh",
    music: "A. R. Rahman",
    difficulty: "medium",
    era: "90s",
    trivia: "Sukhwinder Singh recorded this iconic moving-train track with Sapna Awasthi, composed by A. R. Rahman.",
    photo: "images/singers/sukhwinder.jpg"
  },
  {
    id: 7,
    clip: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/26/95/60/269560df-eeb9-f36d-d30d-80fd7a506483/mzaf_12048136816479467907.plus.aac.p.m4a",
    options: ["Asha Bhosle", "Geeta Dutt", "Lata Mangeshkar", "Noor Jehan"],
    answer: 2,
    song: "Lag Jaa Gale",
    movie: "Woh Kaun Thi?",
    singer: "Lata Mangeshkar",
    music: "Madan Mohan",
    difficulty: "medium",
    era: "golden",
    trivia: "Initially rejected by the film director, Madan Mohan and Lata ji insisted on keeping this timeless ghazal.",
    photo: "images/singers/lata.jpg"
  },
  {
    id: 8,
    clip: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/a7/01/44/a7014423-fbed-c623-aa04-41bc84215593/mzaf_11299150908396348912.plus.aac.p.m4a",
    options: ["Mohit Chauhan", "Atif Aslam", "Rahat Fateh Ali Khan", "Javed Ali"],
    answer: 0,
    song: "Pee Loon",
    movie: "Once Upon a Time in Mumbaai",
    singer: "Mohit Chauhan",
    music: "Pritam",
    difficulty: "medium",
    era: "2010s",
    trivia: "Mohit Chauhan's silky mountain-folk inflection gave this retro underworld romance its distinctive heart.",
    photo: "images/singers/mohit.jpg"
  },
  {
    id: 9,
    clip: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/8d/f1/ba/8df1ba2f-6f35-57bf-0e5d-dce7bc911fda/mzaf_697037541651634276.plus.aac.p.m4a",
    options: ["Neha Kakkar", "Sunidhi Chauhan", "Monali Thakur", "Kanika Kapoor"],
    answer: 1,
    song: "Kamli",
    movie: "Dhoom 3",
    singer: "Sunidhi Chauhan",
    music: "Pritam",
    difficulty: "medium",
    era: "2010s",
    trivia: "Sunidhi Chauhan delivered powerhouse high-octane Sufi-dance vocals over complex rhythmic shifts.",
    photo: "images/singers/sunidhi.jpg"
  },
  {
    id: 10,
    clip: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/93/4d/d3/934dd303-b7fe-3ee2-3fdf-f9d4d4cc472e/mzaf_17650642403547824950.plus.aac.p.m4a",
    options: ["Mukesh", "Mohd. Rafi", "Hemant Kumar", "Talat Mahmood"],
    answer: 0,
    song: "Kabhi Kabhie Mere Dil Mein",
    movie: "Kabhi Kabhie",
    singer: "Mukesh",
    music: "Khayyam",
    difficulty: "medium",
    era: "retro",
    trivia: "Mukesh won the National Film Award for Best Male Playback Singer for this poignant Sahir Ludhianvi poetry.",
    photo: "images/singers/mukesh.jpg"
  },

  // --- 5 HARD QUESTIONS ---
  {
    id: 11,
    clip: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/d5/d9/bf/d5d9bfab-8d57-35f4-18f8-3fffcb5d2dd7/mzaf_11646467644254586003.plus.aac.p.m4a",
    options: ["Manna Dey & Lata Mangeshkar", "Mohd. Rafi & Lata Mangeshkar", "Kishore Kumar & Asha Bhosle", "Bhupen Hazarika & Suman Kalyanpur"],
    answer: 1,
    song: "Kuhu Kuhu Bole Koyaliya",
    movie: "Suvarna Sundari",
    singer: "Mohd. Rafi & Lata Mangeshkar",
    music: "Adi Narayana Rao",
    difficulty: "hard",
    era: "golden",
    trivia: "A legendary classical jugalbandi weaving four classical ragas: Sohni, Bahar, Jaunpuri, and Yaman Kalyan.",
    photo: "images/singers/rafi.jpg"
  },
  {
    id: 12,
    clip: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/ef/f3/01/eff30152-36a5-fa84-ffe1-3a4ce530a544/mzaf_15223605205119867617.plus.aac.p.m4a",
    options: ["Hariharan", "S. P. Balasubrahmanyam", "K. J. Yesudas", "Udit Narayan"],
    answer: 0,
    song: "Tu Hi Re",
    movie: "Bombay",
    singer: "Hariharan",
    music: "A. R. Rahman",
    difficulty: "hard",
    era: "90s",
    trivia: "Hariharan blended classical ghazal dynamics with symphonic orchestration, featuring Kavita Krishnamurthy.",
    photo: "images/singers/hariharan.jpg"
  },
  {
    id: 13,
    clip: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/57/74/2c/57742cf6-8d31-fba6-1c36-5a95eec42184/mzaf_11134732646526765350.plus.aac.p.m4a",
    options: ["Bhimsen Joshi", "Manna Dey", "Pandit Jasraj", "K. L. Saigal"],
    answer: 1,
    song: "Laaga Chunari Mein Daag",
    movie: "Dil Hi To Hai",
    singer: "Manna Dey",
    music: "Roshan",
    difficulty: "hard",
    era: "golden",
    trivia: "Composed in Raga Bhairavi, Manna Dey executed blistering taans that became a gold standard for classical film songs.",
    photo: "images/singers/manna.jpg"
  },
  {
    id: 14,
    clip: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/ce/72/5e/ce725e63-6977-b281-3766-fff46d6e0c07/mzaf_7464998292185183397.plus.aac.p.m4a",
    options: ["Rahat Fateh Ali Khan & Javed Ali", "A. R. Rahman, Javed Ali & Mohit Chauhan", "Nizami Brothers & Kailash Kher", "Atif Aslam & Sukhwinder Singh"],
    answer: 1,
    song: "Kun Faya Kun",
    movie: "Rockstar",
    singer: "A. R. Rahman, Javed Ali & Mohit Chauhan",
    music: "A. R. Rahman",
    difficulty: "hard",
    era: "2010s",
    trivia: "Recorded in honor of Hazrat Nizamuddin Auliya, this Sufi qawwali blends Arabic hymns with Urdu poetry.",
    photo: "images/singers/arrahman.jpg"
  },
  {
    id: 15,
    clip: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/04/be/05/04be05e0-0fd2-caff-99fd-c3f805e6f297/mzaf_5902360057766582650.plus.aac.p.m4a",
    options: ["Mukesh", "Talat Mahmood", "Manna Dey", "Kishore Kumar"],
    answer: 2,
    song: "Zindagi Kaisi Hai Paheli",
    movie: "Anand",
    singer: "Manna Dey",
    music: "Salil Chowdhury",
    difficulty: "hard",
    era: "retro",
    trivia: "Salil Chowdhury originally envisioned this as a background instrumental before lyricist Yogesh and Manna Dey turned it into an immortal classic.",
    photo: "images/singers/manna.jpg"
  }
];
