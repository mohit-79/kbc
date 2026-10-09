# SurKBC — Cloudflare Serverless Deployment Guide (`kbc.harjani.me`)

> **Goal**: 100% serverless hosting on Cloudflare Free Tier. **No PC, no VPS, no tunnel.** Only your phone needs to be on.

---

## ⚡ 3-Minute Deployment Steps

### Step 1: Login to Cloudflare via CLI
Run the following command in terminal:
```bash
npx wrangler login
```
*(A browser window will open — click **Allow** to authenticate Wrangler with your Cloudflare account).*

---

### Step 2: Create Cloudflare D1 Database & Apply Migration
1. Create the serverless SQLite database:
   ```bash
   npx wrangler d1 create surkbc-db
   ```
   *(Copy the generated `database_id` and paste it into `wrangler.toml` under `database_id = "..."` if different).*

2. Apply the schema migration:
   ```bash
   npm run d1:migrate
   ```
   *(This creates the `profiles`, `friends`, `game_sessions`, and `friend_requests` tables).*

---

### Step 3: Deploy Worker Backend
Deploy the API and Durable Objects:
```bash
npm run deploy:worker
```
*(Your API endpoints `/api/*` and real-time WebSocket `/ws` are now live on Cloudflare).*

---

### Step 4: Deploy Static Frontend to Cloudflare Pages
Deploy the mobile frontend directory:
```bash
npm run deploy:pages
```
1. In Cloudflare Dashboard -> **Workers & Pages** -> select `surkbc` -> **Custom Domains**.
2. Click **Set up a domain** -> enter `kbc.harjani.me`.
3. Cloudflare will automatically provision the free SSL/HTTPS certificate and route traffic.

---

## 📱 How to Use on iPhone (PC Powered Off)
1. Open **Safari** on your iPhone and visit `https://kbc.harjani.me`.
2. Tap the **Share** button in Safari -> tap **Add to Home Screen**.
3. Launch **SurKBC** from your home screen — it runs in full standalone native app mode without Safari browser chrome!
4. Take the Hot Seat, play questions, and use Phone-a-Friend. All game progress and stats are stored in Cloudflare D1 and sync seamlessly.
