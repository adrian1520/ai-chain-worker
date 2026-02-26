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

  if (!body.path.startsWith("ai_chain/")) {
    return new Response("Forbidden path", { status: 403 });
  }

  // Bezpieczne kodowanie UTF-8 → Base64
  const encoded = btoa(
    String.fromCharCode(...new Uint8Array(
      await new Response(body.content).arrayBuffer()
    ))
  );

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