export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { system, user } = req.body;
  if (!system || !user) return res.status(400).json({ error: "Missing fields" });

  try {
    const body = JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 1000,
      system,
      messages: [{ role: "user", content: user }],
    });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body,
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || "";
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export const config = {
  api: { bodyParser: { encoding: "utf-8" } },
};
