export default {
  async fetch(request, env) {
    try {

      // =============================
      // WALIDACJA ENV
      // =============================
      if (!env.OWNER || !env.REPO || !env.BRANCH || !env.GITHUB_TOKEN) {
        return new Response("Missing required environment variables", { status: 500 });
      }

      const url = new URL(request.url);

      // =============================
      // READ FILE
      // =============================
      if (url.pathname === "/read" && request.method === "GET") {

        const path = url.searchParams.get("path");
        if (!path) {
          return new Response("Missing path parameter", { status: 400 });
        }

        const gh = await fetch(
          `https://api.github.com/repos/${env.OWNER}/${env.REPO}/contents/${path}?ref=${env.BRANCH}`,
          {
            headers: {
              "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
              "Accept": "application/vnd.github+json",
              "User-Agent": "ai-chain-worker"
            }
          }
        );

        if (!gh.ok) {
          return new Response(await gh.text(), { status: gh.status });
        }

        const data = await gh.json();

        return Response.json({
          path: path,
          sha: data.sha,
          content: atob(data.content)
        });
      }

      // =============================
      // WRITE FILE
      // =============================
      if (url.pathname === "/write" && request.method === "POST") {

        let body;
        try {
          body = await request.json();
        } catch {
          return new Response("Invalid JSON body", { status: 400 });
        }

        if (!body.path || !body.content || !body.message) {
          return new Response("Missing required fields", { status: 400 });
        }

        // Ograniczenie do katalogu ai_chain/
        if (!body.path.startsWith("ai_chain/")) {
          return new Response("Forbidden path (allowed: ai_chain/)", { status: 403 });
        }

        // =============================
        // UTF-8 → Base64 (bez 1101)
        // =============================
        const bytes = new TextEncoder().encode(body.content);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const encoded = btoa(binary);

        const gh = await fetch(
          `https://api.github.com/repos/${env.OWNER}/${env.REPO}/contents/${body.path}`,
          {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
              "Accept": "application/vnd.github+json",
              "Content-Type": "application/json",
              "User-Agent": "ai-chain-worker"
            },
            body: JSON.stringify({
              message: body.message,
              content: encoded,
              branch: env.BRANCH
            })
          }
        );

        const result = await gh.text();

        return new Response(result, {
          status: gh.status,
          headers: { "Content-Type": "application/json" }
        });
      }

      // =============================
      // DEFAULT
      // =============================
      return new Response("Not found", { status: 404 });

    } catch (err) {
      return new Response("Worker fatal error: " + err.message, { status: 500 });
    }
  }
}