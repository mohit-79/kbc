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
