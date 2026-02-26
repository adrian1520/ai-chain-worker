export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ===== READ =====
    if (url.pathname === "/read" && request.method === "GET") {
      const path = url.searchParams.get("path");

      const gh = await fetch(
        `https://api.github.com/repos/${env.OWNER}/${env.REPO}/contents/${path}?ref=${env.BRANCH}`,
        {
          headers: {
            "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
            "Accept": "application/vnd.github+json"
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

    // ===== WRITE =====
    if (url.pathname === "/write" && request.method === "POST") {
      const body = await request.json();

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
            "Content-Type": "application/json"
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

    return new Response("Not found", { status: 404 });
  }
}