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
