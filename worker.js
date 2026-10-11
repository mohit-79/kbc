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

      // 2. Profile API: GET /api/profile?name=<name>&token=<token>
      if (url.pathname === "/api/profile" && method === "GET") {
        if (!env.DB) {
          return new Response(JSON.stringify({ error: "D1 database not bound" }), { status: 500, headers: corsHeaders });
        }
        const token = (request.headers.get("X-Device-Token") || url.searchParams.get("token") || "").trim();
        const name = (url.searchParams.get("name") || "Contestant").trim();

        let profile = null;
        if (token) {
          profile = await env.DB.prepare("SELECT * FROM profiles WHERE id = ?").bind(token).first();
        }

        if (!profile) {
          const profileId = token || crypto.randomUUID();
          await env.DB.prepare("INSERT INTO profiles (id, name, high_score, games_played) VALUES (?, ?, '₹ 0', 0)")
            .bind(profileId, name).run().catch(() => {});
          profile = { id: profileId, name, high_score: "₹ 0", games_played: 0 };
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
        const token = (request.headers.get("X-Device-Token") || "").trim();
        const body = await request.json().catch(() => ({}));
        const name = (body.name || "Contestant").trim();
        const highScore = body.highScore || "₹ 0";
        const gamesPlayed = typeof body.gamesPlayed === "number" ? body.gamesPlayed : 0;
        const friendsList = Array.isArray(body.friends) ? body.friends.slice(0, 7) : [];

        let profile = null;
        if (token) {
          profile = await env.DB.prepare("SELECT * FROM profiles WHERE id = ?").bind(token).first();
        }

        const profileId = profile ? profile.id : (token || crypto.randomUUID());

        if (!profile) {
          await env.DB.prepare("INSERT INTO profiles (id, name, high_score, games_played) VALUES (?, ?, ?, ?)")
            .bind(profileId, name, highScore, gamesPlayed).run();
        } else {
          await env.DB.prepare("UPDATE profiles SET name = ?, high_score = ?, games_played = ? WHERE id = ?")
            .bind(name, highScore, gamesPlayed, profileId).run();
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
        const audioClip = body.clip || "";
        const callBase = `${origin}/friend-call.html?session=${encodeURIComponent(sessionId)}&clip=${encodeURIComponent(audioClip)}&q=${encodeURIComponent(question)}&opts=${encodeURIComponent(JSON.stringify(options))}&player=${encodeURIComponent(playerName)}`;
        const audioUrl = `${callBase}&mode=audio`;
        const videoUrl = `${callBase}&mode=video`;

        // Fix 2: Message template with audio clip link and no redundant answer link
        const optA = options[0] || "";
        const optB = options[1] || "";
        const optC = options[2] || "";
        const optD = options[3] || "";
        let messageText = `🎵 SurKBC — Aapke dost ${playerName} ko aapki madad chahiye!\n\nSawaal: ${question}\nA) ${optA}\nB) ${optB}\nC) ${optC}\nD) ${optD}`;
        if (audioClip) {
          messageText += `\n\n🎵 Gaana (Audio Clip) Sunein:\n${audioClip}`;
        }
        messageText += `\n\n🎙️ Audio call:\n${audioUrl}\n\n📹 Video call:\n${videoUrl}`;

        // Clean phone for WhatsApp
        const digitsOnly = friendPhone.replace(/\D/g, "");
        const formattedPhone = digitsOnly.length === 10 ? `91${digitsOnly}` : digitsOnly;
        const waLink = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(messageText)}`;

        let delivered = false;
        let gatewayResponse = null;

        // 1. QR Gateway REST Adapter (GreenAPI / Whapi / UltraMsg)
        if (env.WHATSAPP_GATEWAY_URL && env.WHATSAPP_GATEWAY_TOKEN) {
          try {
            let gwUrl = env.WHATSAPP_GATEWAY_URL.trim();
            // If Green-API instance URL format (e.g. https://.../waInstance12345/ or https://...):
            if (gwUrl.includes("greenapi.com") || gwUrl.includes("green-api.com")) {
              if (!gwUrl.includes("sendMessage")) {
                gwUrl = `${gwUrl.replace(/\/+$/, "")}/sendMessage/${env.WHATSAPP_GATEWAY_TOKEN}`;
              }
            }

            const headers = { "Content-Type": "application/json" };
            if (!gwUrl.includes("greenapi.com") && !gwUrl.includes("green-api.com")) {
              headers["Authorization"] = `Bearer ${env.WHATSAPP_GATEWAY_TOKEN}`;
            }

            const gwRes = await fetch(gwUrl, {
              method: "POST",
              headers: headers,
              body: JSON.stringify({
                chatId: `${formattedPhone}@c.us`,
                message: messageText
              })
            });
            if (gwRes.ok) {
              delivered = true;
              gatewayResponse = "gw-sent";
            } else {
              const errBody = await gwRes.text().catch(() => "");
              console.warn("Green-API error status:", gwRes.status, errBody);
            }
          } catch (e) {
            console.warn("WhatsApp gateway error:", e);
          }
        }

        // 2. Twilio WhatsApp Adapter
        if (!delivered && env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_FROM_PHONE) {
          try {
            const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`;
            const creds = btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);
            const bodyParams = new URLSearchParams({
              From: `whatsapp:${env.TWILIO_FROM_PHONE}`,
              To: `whatsapp:${cleanPhone}`,
              Body: messageText
            });
            const twRes = await fetch(twilioUrl, {
              method: "POST",
              headers: {
                "Authorization": `Basic ${creds}`,
                "Content-Type": "application/x-www-form-urlencoded"
              },
              body: bodyParams.toString()
            });
            if (twRes.ok) {
              delivered = true;
              gatewayResponse = "twilio-sent";
            }
          } catch (e) {
            console.warn("Twilio error:", e);
          }
        }

        return new Response(JSON.stringify({
          success: true,
          requestId,
          token,
          answerUrl,
          audioUrl,
          videoUrl,
          messageText,
          waLink,
          delivered,
          gateway: gatewayResponse || "wa-me-fallback",
          expiresAt
        }), { status: 200, headers: corsHeaders });
      }

      // 8. Friend Portal API: GET /api/phone-friend/question?session=&token=
      if (url.pathname === "/api/phone-friend/question" && method === "GET") {
        if (!env.DB) {
          return new Response(JSON.stringify({ error: "D1 database not bound" }), { status: 500, headers: corsHeaders });
        }
        const sessionId = url.searchParams.get("session");
        const token = url.searchParams.get("token");

        if (!sessionId) {
          return new Response(JSON.stringify({ error: "Missing session" }), { status: 400, headers: corsHeaders });
        }

        let reqRow = null;
        if (token && token !== "manual") {
          reqRow = await env.DB.prepare(
            "SELECT * FROM friend_requests WHERE session_id = ? AND token = ?"
          ).bind(sessionId, token).first();
        } else {
          reqRow = await env.DB.prepare(
            "SELECT * FROM friend_requests WHERE session_id = ? ORDER BY created_at DESC LIMIT 1"
          ).bind(sessionId).first();
        }

        if (!reqRow) {
          return new Response(JSON.stringify({ error: "Invalid link or request not found" }), { status: 404, headers: corsHeaders });
        }

        const now = new Date().toISOString();
        if (reqRow.expires_at && reqRow.expires_at < now) {
          return new Response(JSON.stringify({ error: "Token expired", status: "expired" }), { status: 410, headers: corsHeaders });
        }

        return new Response(JSON.stringify({
          question: reqRow.question_text,
          options: JSON.parse(reqRow.options_json || "[]"),
          friendName: reqRow.friend_name,
          status: reqRow.status,
          answer: reqRow.answer,
          note: reqRow.note
        }), { status: 200, headers: corsHeaders });
      }

      // 9. Friend Portal API: POST /api/phone-friend/submit
      if (url.pathname === "/api/phone-friend/submit" && method === "POST") {
        if (!env.DB) {
          return new Response(JSON.stringify({ error: "D1 database not bound" }), { status: 500, headers: corsHeaders });
        }
        const body = await request.json().catch(() => ({}));
        const sessionId = body.sessionId;
        const token = body.token;
        const selectedOption = body.selectedOption; // 0, 1, 2, 3 or letter "A", "B", "C", "D"
        const note = (body.note || "").trim();

        if (!sessionId || !token || selectedOption === undefined || selectedOption === null) {
          return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: corsHeaders });
        }

        const reqRow = await env.DB.prepare(
          "SELECT * FROM friend_requests WHERE session_id = ? AND token = ?"
        ).bind(sessionId, token).first();

        if (!reqRow) {
          return new Response(JSON.stringify({ error: "Invalid token" }), { status: 404, headers: corsHeaders });
        }

        if (reqRow.status === "answered") {
          return new Response(JSON.stringify({ error: "Already submitted", status: "answered" }), { status: 409, headers: corsHeaders });
        }

        const now = new Date().toISOString();
        if (reqRow.expires_at && reqRow.expires_at < now) {
          return new Response(JSON.stringify({ error: "Token expired" }), { status: 410, headers: corsHeaders });
        }

        await env.DB.prepare(
          "UPDATE friend_requests SET answer = ?, note = ?, status = 'answered' WHERE id = ?"
        ).bind(String(selectedOption), note, reqRow.id).run();

        // Broadcast to player via Durable Object if bound
        if (env.SESSION_ROOM) {
          try {
            const roomId = env.SESSION_ROOM.idFromName(sessionId);
            const room = env.SESSION_ROOM.get(roomId);
            await room.fetch(new Request("https://internal/broadcast", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "friend_answered",
                sessionId,
                answer: selectedOption,
                note,
                friendName: reqRow.friend_name
              })
            }));
          } catch (e) {
            console.warn("Durable Object broadcast warning:", e);
          }
        }

        return new Response(JSON.stringify({
          success: true,
          answer: selectedOption,
          note,
          status: "answered"
        }), { status: 200, headers: corsHeaders });
      }

      // 10. Polling Fallback: GET /api/phone-friend/poll?session=<sessionId>
      if (url.pathname === "/api/phone-friend/poll" && method === "GET") {
        if (!env.DB) {
          return new Response(JSON.stringify({ error: "D1 database not bound" }), { status: 500, headers: corsHeaders });
        }
        const sessionId = url.searchParams.get("session");
        if (!sessionId) {
          return new Response(JSON.stringify({ error: "Missing session" }), { status: 400, headers: corsHeaders });
        }

        const reqRow = await env.DB.prepare(
          "SELECT friend_name, answer, note, status FROM friend_requests WHERE session_id = ? ORDER BY created_at DESC LIMIT 1"
        ).bind(sessionId).first();

        if (!reqRow) {
          return new Response(JSON.stringify({ status: "none" }), { status: 200, headers: corsHeaders });
        }

        return new Response(JSON.stringify({
          status: reqRow.status,
          answer: reqRow.answer,
          note: reqRow.note,
          friendName: reqRow.friend_name
        }), { status: 200, headers: corsHeaders });
      }

      // 10B. Chat Messages Polling & Direct Green-API Sync: GET /api/phone-friend/messages?session=<sessionId>
      if (url.pathname === "/api/phone-friend/messages" && method === "GET") {
        if (!env.DB) {
          return new Response(JSON.stringify({ messages: [] }), { status: 200, headers: corsHeaders });
        }
        const sessionId = url.searchParams.get("session");
        if (!sessionId) {
          return new Response(JSON.stringify({ messages: [] }), { status: 200, headers: corsHeaders });
        }

        // Look up friend for this session
        let reqRow = await env.DB.prepare(
          "SELECT session_id, friend_name, friend_phone FROM friend_requests WHERE session_id = ? ORDER BY created_at DESC LIMIT 1"
        ).bind(sessionId).first();

        // Fallback: if session ID mismatch, get most recent pending friend request
        if (!reqRow) {
          reqRow = await env.DB.prepare(
            "SELECT session_id, friend_name, friend_phone FROM friend_requests ORDER BY created_at DESC LIMIT 1"
          ).first();
        }

        // Active pull from Green-API to ensure zero-delay synchronization
        if (reqRow && reqRow.friend_phone && env.WHATSAPP_GATEWAY_URL && env.WHATSAPP_GATEWAY_TOKEN) {
          try {
            const cleanDigits = String(reqRow.friend_phone).replace(/\D/g, "");
            const last10 = cleanDigits.slice(-10);
            if (last10) {
              const baseGw = env.WHATSAPP_GATEWAY_URL.trim().replace(/\/+$/, "");
              const syncUrl = `${baseGw}/lastIncomingMessages/${env.WHATSAPP_GATEWAY_TOKEN}?minutes=5`;
              const gwResp = await fetch(syncUrl, { signal: AbortSignal.timeout(2000) });
              if (gwResp.ok) {
                const incomingArr = await gwResp.json().catch(() => []);
                if (Array.isArray(incomingArr)) {
                  for (const item of incomingArr) {
                    const chatTarget = item.chatId || item.senderId || "";
                    const targetDigits = chatTarget.replace(/@.*$/, "").replace(/\D/g, "");
                    if (targetDigits.includes(last10) || targetDigits.endsWith(last10)) {
                      const msgText = (
                        item.textMessage ||
                        item.messageData?.textMessageData?.textMessage ||
                        item.messageData?.extendedTextMessageData?.text ||
                        item.messageData?.textMessage ||
                        item.caption ||
                        ""
                      ).trim();

                      if (msgText) {
                        const mId = item.idMessage || `wa_${item.timestamp}_${last10}`;
                        const existing = await env.DB.prepare("SELECT id FROM chat_messages WHERE id = ?").bind(mId).first();
                        if (!existing) {
                          let detectedOption = null;
                          const optMatch = msgText.match(/\b(?:option\s*)?([A-Da-d])\b/i);
                          if (optMatch) detectedOption = optMatch[1].toUpperCase();

                          await env.DB.prepare(
                            "INSERT INTO chat_messages (id, session_id, sender, friend_name, friend_phone, text, detected_option) VALUES (?, ?, 'friend', ?, ?, ?, ?)"
                          ).bind(mId, reqRow.session_id, reqRow.friend_name || "Dost", reqRow.friend_phone, msgText, detectedOption).run().catch(() => {});

                          if (env.SESSION_ROOM) {
                            try {
                              const roomId = env.SESSION_ROOM.idFromName(reqRow.session_id);
                              const room = env.SESSION_ROOM.get(roomId);
                              await room.fetch(new Request("https://internal/broadcast", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  type: "whatsapp_chat",
                                  id: mId,
                                  sessionId: reqRow.session_id,
                                  sender: "friend",
                                  friendName: reqRow.friend_name || "Dost",
                                  phone: reqRow.friend_phone,
                                  text: msgText,
                                  detectedOption,
                                  timestamp: (item.timestamp ? item.timestamp * 1000 : Date.now())
                                })
                              }));
                            } catch (e) {}
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          } catch (e) {}
        }

        const effectiveSessionId = reqRow?.session_id || sessionId;
        const msgs = await env.DB.prepare(
          "SELECT id, session_id, sender, friend_name, friend_phone, text, detected_option, created_at FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC LIMIT 40"
        ).bind(effectiveSessionId).all();

        return new Response(JSON.stringify({
          messages: msgs.results || []
        }), { status: 200, headers: corsHeaders });
      }

      // 11. Call Auto-Connect Trigger: GET /call?session=&mode=
      if (url.pathname === "/call" && method === "GET") {
        const sessionId = url.searchParams.get("session");
        const mode = url.searchParams.get("mode") === "video" ? "video" : "audio";
        const roomName = `surkbc-${encodeURIComponent(sessionId || "game")}`;

        if (sessionId && env.SESSION_ROOM) {
          try {
            const roomId = env.SESSION_ROOM.idFromName(sessionId);
            const room = env.SESSION_ROOM.get(roomId);
            await room.fetch(new Request("https://internal/broadcast", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "call_started",
                sessionId,
                mode,
                roomName,
                timestamp: Date.now()
              })
            }));
          } catch (e) {
            console.warn("Call broadcast warning:", e);
          }
        }

        // Direct friend to native PeerJS call client
        const callTarget = `/friend-call.html?session=${encodeURIComponent(sessionId || "game")}&mode=${mode}`;
        return Response.redirect(new URL(callTarget, url.origin).toString(), 302);
      }

      // 12. Green-API Incoming Webhook: POST /api/webhook/greenapi
      if (url.pathname === "/api/webhook/greenapi" && method === "POST") {
        try {
          const payload = await request.json().catch(() => ({}));
          const typeWebhook = payload.typeWebhook;

          // Accept incoming messages AND outgoing messages typed directly on phone (sendByApi: false)
          const isIncoming = (typeWebhook === "incomingMessageReceived");
          const isPhoneReply = (typeWebhook === "outgoingMessageReceived" && payload.messageData && payload.messageData.sendByApi === false);

          if (isIncoming || isPhoneReply) {
            const senderData = payload.senderData || {};
            const messageData = payload.messageData || {};

            let rawPhone = (isPhoneReply ? senderData.chatId : (senderData.sender || senderData.chatId || payload.chatId || payload.senderId)) || "";
            let cleanPhoneDigits = rawPhone.replace(/@.*$/, "").replace(/\D/g, "");
            let last10Digits = cleanPhoneDigits.slice(-10);

            let textMessage = (
              messageData.textMessageData?.textMessage ||
              messageData.extendedTextMessageData?.text ||
              messageData.quotedMessage?.extendedTextMessageData?.text ||
              messageData.quotedMessage?.textMessage ||
              messageData.textMessage ||
              payload.textMessage ||
              messageData.fileMessageData?.caption ||
              ""
            ).trim();

            if (textMessage && last10Digits && env.DB) {
              const searchPattern = `%${last10Digits}%`;
              const reqRow = await env.DB.prepare(
                "SELECT session_id, friend_name, friend_phone FROM friend_requests WHERE REPLACE(REPLACE(friend_phone, '+', ''), ' ', '') LIKE ? ORDER BY created_at DESC LIMIT 1"
              ).bind(searchPattern).first();

              if (reqRow && reqRow.session_id) {
                const msgId = payload.idMessage || crypto.randomUUID();

                const exists = await env.DB.prepare("SELECT id FROM chat_messages WHERE id = ?").bind(msgId).first();
                if (!exists) {
                  let detectedOption = null;
                  const optMatch = textMessage.match(/\b(?:option\s*)?([A-Da-d])\b/i);
                  if (optMatch) {
                    detectedOption = optMatch[1].toUpperCase();
                  }

                  // 1. Save message to D1 chat_messages table
                  await env.DB.prepare(
                    "INSERT INTO chat_messages (id, session_id, sender, friend_name, friend_phone, text, detected_option) VALUES (?, ?, 'friend', ?, ?, ?, ?)"
                  ).bind(msgId, reqRow.session_id, reqRow.friend_name, reqRow.friend_phone, textMessage, detectedOption).run().catch(e => console.warn("Chat insert err:", e));

                  // 2. Broadcast via Durable Object
                  if (env.SESSION_ROOM) {
                    const roomId = env.SESSION_ROOM.idFromName(reqRow.session_id);
                    const room = env.SESSION_ROOM.get(roomId);
                    await room.fetch(new Request("https://internal/broadcast", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        type: "whatsapp_chat",
                        id: msgId,
                        sessionId: reqRow.session_id,
                        sender: "friend",
                        friendName: reqRow.friend_name,
                        phone: reqRow.friend_phone,
                        text: textMessage,
                        detectedOption,
                        timestamp: Date.now()
                      })
                    })).catch(e => console.warn("Broadcast err:", e));
                  }
                }
              }
            }
          }
        } catch (e) {
          console.warn("Green-API Webhook error:", e);
        }

        return new Response(JSON.stringify({ status: "received" }), { status: 200, headers: corsHeaders });
      }

      // 13. Player Reply Endpoint: POST /api/phone-friend/chat
      if (url.pathname === "/api/phone-friend/chat" && method === "POST") {
        const body = await request.json().catch(() => ({}));
        const { sessionId, friendPhone, messageText } = body;

        if (!sessionId || !friendPhone || !messageText) {
          return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: corsHeaders });
        }

        const cleanDigits = String(friendPhone).replace(/\D/g, "");
        const formattedPhone = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
        let delivered = false;

        if (env.WHATSAPP_GATEWAY_URL && env.WHATSAPP_GATEWAY_TOKEN) {
          try {
            let gwUrl = env.WHATSAPP_GATEWAY_URL.trim();
            if (gwUrl.includes("greenapi.com") || gwUrl.includes("green-api.com")) {
              if (!gwUrl.includes("sendMessage")) {
                gwUrl = `${gwUrl.replace(/\/+$/, "")}/sendMessage/${env.WHATSAPP_GATEWAY_TOKEN}`;
              }
            }
            const gwRes = await fetch(gwUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chatId: `${formattedPhone}@c.us`,
                message: messageText
              })
            });
            if (gwRes.ok) delivered = true;
          } catch (e) {
            console.warn("Error sending chat via Green-API:", e);
          }
        }

        // Save player message to D1 chat_messages table
        const playerMsgId = crypto.randomUUID();
        if (env.DB) {
          await env.DB.prepare(
            "INSERT INTO chat_messages (id, session_id, sender, friend_name, friend_phone, text, detected_option) VALUES (?, ?, 'player', 'Aap', ?, ?, NULL)"
          ).bind(playerMsgId, sessionId, friendPhone, messageText).run().catch(e => console.warn("Player chat DB insert error:", e));
        }

        // Broadcast to player UI so outgoing bubble displays immediately
        if (env.SESSION_ROOM) {
          try {
            const roomId = env.SESSION_ROOM.idFromName(sessionId);
            const room = env.SESSION_ROOM.get(roomId);
            await room.fetch(new Request("https://internal/broadcast", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "whatsapp_chat",
                id: playerMsgId,
                sessionId,
                sender: "player",
                friendName: "Khiladi",
                phone: friendPhone,
                text: messageText,
                timestamp: Date.now()
              })
            }));
          } catch (e) {}
        }

        return new Response(JSON.stringify({ success: true, delivered }), { status: 200, headers: corsHeaders });
      }

      // 14. Real-Time WebSocket Endpoint: /ws?session=<sessionId>
      if (url.pathname === "/ws") {
        const sessionId = url.searchParams.get("session");
        if (!sessionId) {
          return new Response("Missing session query param", { status: 400 });
        }
        if (env.SESSION_ROOM) {
          const roomId = env.SESSION_ROOM.idFromName(sessionId);
          const room = env.SESSION_ROOM.get(roomId);
          return room.fetch(request);
        }
        return new Response("Durable Objects not enabled in this environment", { status: 501 });
      }

      // Fallback 404 for unknown API routes
      if (url.pathname.startsWith("/api/")) {
        return new Response(JSON.stringify({ error: "Endpoint not found" }), {
          status: 404,
          headers: corsHeaders
        });
      }

      // Static fallback when serving through worker
      if (env.ASSETS) {
        // Rewrite friendly /call route to /friend-call.html preserving query string
        if (url.pathname === "/call") {
          const callUrl = new URL(request.url);
          callUrl.pathname = "/friend-call.html";
          return env.ASSETS.fetch(new Request(callUrl.toString(), request));
        }
        return env.ASSETS.fetch(request);
      }
      return new Response("SurKBC Worker Active", { status: 200 });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }
};

// ==========================================================================
// Cloudflare Durable Object: SessionRoom
// Handles Real-Time Friend Answer Pushes (< 3s) & WebRTC Signaling
// ==========================================================================
export class SessionRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sockets = new Set();
  }

  async fetch(request) {
    const url = new URL(request.url);

    // Internal broadcast trigger from Worker
    if (url.pathname === "/broadcast") {
      const data = await request.text();
      for (const ws of this.sockets) {
        try {
          ws.send(data);
        } catch (e) {
          this.sockets.delete(ws);
        }
      }
      return new Response(JSON.stringify({ broadcasted: this.sockets.size }), { status: 200 });
    }

    // WebSocket Upgrade
    if (request.headers.get("Upgrade") === "websocket") {
      const pair = new WebSocketPair();
      const client = pair[0];
      const server = pair[1];

      server.accept();
      this.sockets.add(server);

      server.addEventListener("close", () => {
        this.sockets.delete(server);
      });

      server.addEventListener("error", () => {
        this.sockets.delete(server);
      });

      server.addEventListener("message", (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "ping") {
            server.send(JSON.stringify({ type: "pong" }));
          }
        } catch (e) {}
      });

      return new Response(null, { status: 101, webSocket: client });
    }

    return new Response("Not found", { status: 404 });
  }
}

