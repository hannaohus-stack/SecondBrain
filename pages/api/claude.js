import https from "https";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { system, user } = req.body;
  if (!system || !user) return res.status(400).json({ error: "Missing fields" });

  const bodyBuffer = Buffer.from(
    JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 1000,
      system,
      messages: [{ role: "user", content: user }],
    }),
    "utf8"
  );

  const options = {
    hostname: "api.anthropic.com",
    path: "/v1/messages",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": bodyBuffer.length,
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
  };

  return new Promise((resolve) => {
    const request = https.request(options, (response) => {
      let data = "";
      response.on("data", (chunk) => { data += chunk; });
      response.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          const text = parsed.content?.[0]?.text || "";
          res.status(200).json({ text });
        } catch (e) {
          res.status(500).json({ error: e.message });
        }
        resolve();
      });
    });
    request.on("error", (e) => {
      res.status(500).json({ error: e.message });
      resolve();
    });
    request.write(bodyBuffer);
    request.end();
  });
}
