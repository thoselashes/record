import { onRequestGet as handleAppointments } from "./api/appointments.js";
import { onRequestPost as handleSubmit } from "./api/submit.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // API routes
    if (url.pathname.startsWith("/api/")) {
      if (url.pathname === "/api/appointments" && request.method === "GET") {
        return handleAppointments({ request, env, ctx });
      }
      if (url.pathname === "/api/submit" && request.method === "POST") {
        return handleSubmit({ request, env, ctx });
      }
      return new Response("Not Found", { status: 404 });
    }

    // Serve static assets
    const asset = await env.ASSETS.fetch(request);
    if (asset.status !== 404) return asset;

    // SPA fallback — serve index.html for all non-API, non-asset routes
    const indexUrl = new URL("https://placeholder/index.html");
    return env.ASSETS.fetch(new Request(indexUrl, request));
  },
};
