-- ==========================================================================
-- SurKBC — schema.sql (Cloudflare D1 Database Schema)
-- ==========================================================================

-- 1. Contestant Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  high_score TEXT DEFAULT '₹ 0',
  games_played INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Friends Roster (Phone numbers in E.164 e.g. +91...)
CREATE TABLE IF NOT EXISTS friends (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(profile_id) REFERENCES profiles(id)
);

-- 3. Game Session State
CREATE TABLE IF NOT EXISTS game_sessions (
  session_id TEXT PRIMARY KEY,
  player_name TEXT NOT NULL,
  q_index INTEGER DEFAULT 0,
  current_prize TEXT DEFAULT '₹ 0',
  guaranteed_prize TEXT DEFAULT '₹ 0',
  used_lifelines TEXT DEFAULT '{}',
  status TEXT DEFAULT 'active',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Phone-a-Friend Requests & Responses
CREATE TABLE IF NOT EXISTS friend_requests (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  friend_name TEXT NOT NULL,
  friend_phone TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  question_text TEXT NOT NULL,
  options_json TEXT NOT NULL,
  answer TEXT,
  note TEXT,
  status TEXT DEFAULT 'pending', -- pending, answered, expired
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
