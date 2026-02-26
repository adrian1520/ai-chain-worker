export default {
  async fetch(request, env) {
    const url = new URL(request.url);

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

      const data = await gh.json();

      return Response.json({
        sha: data.sha,
        content: atob(data.content)
      });
    }

    return new Response("Not found", { status: 404 });
  }
}
