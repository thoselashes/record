export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Route API requests
    if (path.startsWith("/api/")) {
      if (path === "/api/appointments" && request.method === "GET") {
        const { onRequestGet } = await import("./api/appointments.js");
        return onRequestGet({ request, env, ctx });
      }
      if (path === "/api/submit" && request.method === "POST") {
        const { onRequestPost } = await import("./api/submit.js");
        return onRequestPost({ request, env, ctx });
      }
      return new Response("Not Found", { status: 404 });
    }

    // Serve static assets from build/
    const assetPath = path === "/" ? "/index.html" : path;
    const asset = await env.ASSETS.fetch(
      new URL(`https://placeholder${assetPath}`)
    );
    if (asset.status < 400) return asset;

    // SPA fallback
    const index = await env.ASSETS.fetch(
      new URL("https://placeholder/index.html")
    );
    return index;
  },
};
