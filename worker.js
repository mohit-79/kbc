// ==========================================================================
// SurKBC — worker.js
// Cloudflare Workers REST API & Real-time Backend
// ==========================================================================

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;

    // Standard CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Device-Token",
      "Content-Type": "application/json"
    };

    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 1. Health Check Endpoint
      if (url.pathname === "/api/health" && method === "GET") {
        let d1Status = "ready";
        if (env.DB) {
          try {
            await env.DB.prepare("SELECT 1").first();
          } catch (e) {
            d1Status = "uninitialized";
          }
        }
        return new Response(JSON.stringify({
          status: "ok",
          service: "SurKBC Cloudflare Worker",
          d1: d1Status,
          timestamp: new Date().toISOString()
        }), { status: 200, headers: corsHeaders });
      }

      // 2. Profile API: GET /api/profile?name=<name>
      if (url.pathname === "/api/profile" && method === "GET") {
        if (!env.DB) {
          return new Response(JSON.stringify({ error: "D1 database not bound" }), { status: 500, headers: corsHeaders });
        }
        const name = (url.searchParams.get("name") || "Contestant").trim();
        let profile = await env.DB.prepare("SELECT * FROM profiles WHERE name = ?").bind(name).first();

        if (!profile) {
          const newId = crypto.randomUUID();
          await env.DB.prepare("INSERT INTO profiles (id, name, high_score, games_played) VALUES (?, ?, '₹ 0', 0)")
            .bind(newId, name).run();
          profile = { id: newId, name, high_score: "₹ 0", games_played: 0 };
        }

        const friendsRes = await env.DB.prepare("SELECT id, name, phone FROM friends WHERE profile_id = ?").bind(profile.id).all();
        const friends = friendsRes.results || [];

        return new Response(JSON.stringify({
          profile: {
            id: profile.id,
            name: profile.name,
            highScore: profile.high_score,
            gamesPlayed: profile.games_played,
            friends: friends.map(f => ({ id: f.id, name: f.name, phone: f.phone }))
          }
        }), { status: 200, headers: corsHeaders });
      }

      // 3. Profile API: POST /api/profile
      if (url.pathname === "/api/profile" && method === "POST") {
        if (!env.DB) {
          return new Response(JSON.stringify({ error: "D1 database not bound" }), { status: 500, headers: corsHeaders });
        }
        const body = await request.json().catch(() => ({}));
        const name = (body.name || "Contestant").trim();
        const highScore = body.highScore || "₹ 0";
        const gamesPlayed = typeof body.gamesPlayed === "number" ? body.gamesPlayed : 0;
        const friendsList = Array.isArray(body.friends) ? body.friends.slice(0, 3) : [];

        let profile = await env.DB.prepare("SELECT * FROM profiles WHERE name = ?").bind(name).first();
        let profileId = profile ? profile.id : crypto.randomUUID();

        if (!profile) {
          await env.DB.prepare("INSERT INTO profiles (id, name, high_score, games_played) VALUES (?, ?, ?, ?)")
            .bind(profileId, name, highScore, gamesPlayed).run();
        } else {
          await env.DB.prepare("UPDATE profiles SET high_score = ?, games_played = ? WHERE id = ?")
            .bind(highScore, gamesPlayed, profileId).run();
        }

        // Sync friends roster
        await env.DB.prepare("DELETE FROM friends WHERE profile_id = ?").bind(profileId).run();
        for (const f of friendsList) {
          const fId = f.id ? String(f.id) : crypto.randomUUID();
          const fName = String(f.name || "").trim();
          const fPhone = String(f.phone || "").trim();
          if (fName) {
            await env.DB.prepare("INSERT INTO friends (id, profile_id, name, phone) VALUES (?, ?, ?, ?)")
              .bind(fId, profileId, fName, fPhone).run();
          }
        }

        return new Response(JSON.stringify({
          success: true,
          profile: {
            id: profileId,
            name,
            highScore,
            gamesPlayed,
            friends: friendsList
          }
        }), { status: 200, headers: corsHeaders });
      }

      // 4. Session API: POST /api/session/start
      if (url.pathname === "/api/session/start" && method === "POST") {
        if (!env.DB) {
          return new Response(JSON.stringify({ error: "D1 database not bound" }), { status: 500, headers: corsHeaders });
        }
        const body = await request.json().catch(() => ({}));
        const playerName = (body.playerName || "Contestant").trim();
        const sessionId = crypto.randomUUID();

        await env.DB.prepare(
          "INSERT INTO game_sessions (session_id, player_name, q_index, current_prize, guaranteed_prize, used_lifelines, status) VALUES (?, ?, 0, '₹ 0', '₹ 0', '{}', 'active')"
        ).bind(sessionId, playerName).run();

        return new Response(JSON.stringify({
          sessionId,
          status: "active",
          timestamp: new Date().toISOString()
        }), { status: 200, headers: corsHeaders });
      }

      // 5. Session API: POST /api/session/sync
      if (url.pathname === "/api/session/sync" && method === "POST") {
        if (!env.DB) {
          return new Response(JSON.stringify({ error: "D1 database not bound" }), { status: 500, headers: corsHeaders });
        }
        const body = await request.json().catch(() => ({}));
        const sessionId = body.sessionId;
        if (!sessionId) {
          return new Response(JSON.stringify({ error: "Missing sessionId" }), { status: 400, headers: corsHeaders });
        }

        const qIndex = typeof body.qIndex === "number" ? body.qIndex : 0;
        const currentPrize = body.currentPrize || "₹ 0";
        const guaranteedPrize = body.guaranteedPrize || "₹ 0";
        const usedLifelines = JSON.stringify(body.usedLifelines || {});

        await env.DB.prepare(
          "UPDATE game_sessions SET q_index = ?, current_prize = ?, guaranteed_prize = ?, used_lifelines = ?, updated_at = CURRENT_TIMESTAMP WHERE session_id = ?"
        ).bind(qIndex, currentPrize, guaranteedPrize, usedLifelines, sessionId).run();

        return new Response(JSON.stringify({
          success: true,
          sessionId
        }), { status: 200, headers: corsHeaders });
      }

      // 6. Session API: POST /api/session/end
      if (url.pathname === "/api/session/end" && method === "POST") {
        if (!env.DB) {
          return new Response(JSON.stringify({ error: "D1 database not bound" }), { status: 500, headers: corsHeaders });
        }
        const body = await request.json().catch(() => ({}));
        const sessionId = body.sessionId;
        const finalPrize = body.finalPrize || "₹ 0";
        const status = body.status || "ended"; // won, lost, quit

        if (sessionId) {
          await env.DB.prepare(
            "UPDATE game_sessions SET current_prize = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE session_id = ?"
          ).bind(finalPrize, status, sessionId).run();
        }

        return new Response(JSON.stringify({
          success: true,
          finalPrize,
          status
        }), { status: 200, headers: corsHeaders });
      }

      // 7. Phone-a-Friend API: POST /api/phone-friend/send
      if (url.pathname === "/api/phone-friend/send" && method === "POST") {
        if (!env.DB) {
          return new Response(JSON.stringify({ error: "D1 database not bound" }), { status: 500, headers: corsHeaders });
        }
        const body = await request.json().catch(() => ({}));
        const sessionId = body.sessionId;
        const friendPhone = (body.friendPhone || "").trim();
        const friendName = (body.friendName || "Dost").trim();
        const question = body.question || "";
        const options = Array.isArray(body.options) ? body.options : [];
        const playerName = (body.playerName || "Khiladi").trim();

        if (!sessionId || !friendPhone) {
          return new Response(JSON.stringify({ error: "Missing sessionId or friendPhone" }), { status: 400, headers: corsHeaders });
        }

        const requestId = crypto.randomUUID();
        const token = crypto.randomUUID().substring(0, 8);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5-minute expiry

        await env.DB.prepare(
          "INSERT INTO friend_requests (id, session_id, friend_name, friend_phone, token, question_text, options_json, status, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)"
        ).bind(requestId, sessionId, friendName, friendPhone, token, question, JSON.stringify(options), expiresAt).run();

        // Target URL links
        const origin = url.origin.includes("localhost") || url.origin.includes("127.0.0.1") ? url.origin : "https://kbc.harjani.me";
        const answerUrl = `${origin}/friend.html?session=${encodeURIComponent(sessionId)}&token=${encodeURIComponent(token)}`;
        const audioUrl = `https://meet.jit.si/surkbc-${encodeURIComponent(sessionId)}#config.startWithVideoMuted=true`;
        const videoUrl = `https://meet.jit.si/surkbc-${encodeURIComponent(sessionId)}`;

        return new Response(JSON.stringify({
          success: true,
          requestId,
          token,
          answerUrl,
          audioUrl,
          videoUrl,
          expiresAt
        }), { status: 200, headers: corsHeaders });
      }

      // Fallback 404 for unknown API routes
      if (url.pathname.startsWith("/api/")) {
        return new Response(JSON.stringify({ error: "Endpoint not found" }), {
          status: 404,
          headers: corsHeaders
        });
      }

      // Static fallback when serving through worker
      return new Response("SurKBC Worker Active", { status: 200 });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }
};
