export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // =========================
    // READ FILE
    // =========================
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
        path,
        sha: data.sha,
        content: atob(data.content)
      });
    }

    // =========================
    // WRITE FILE
    // =========================
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

      // Ograniczenie zapisu tylko do katalogu ai_chain/
      if (!body.path.startsWith("ai_chain/")) {
        return new Response("Forbidden path", { status: 403 });
      }

      const encoded = btoa(body.content);

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

      return new Response(await gh.text(), {
        status: gh.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    // =========================
    // DEFAULT
    // =========================
    return new Response("Not found", { status: 404 });
  }
}