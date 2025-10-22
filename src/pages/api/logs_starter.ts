import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { node_ip } = req.body;
  if (!node_ip)
    return res.status(400).json({ error: "Missing node_ip" });

  const daemonUrl = `http://${node_ip}:8754/control`; // Daemon port and path

  try {
    const resp = await fetch(daemonUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        command: "start_live_logs",
        server_url: " http://192.168.2.1:3000/api/logs_receiver",
        node_id: node_ip,
        log_file: "/var/log/syslog"
      }),
    });

    const json = await resp.json();
    if (!resp.ok) return res.status(502).json({ error: "Agent error", details: json });

    return res.status(200).json(json);
  } catch (error) {
    console.error("Error contacting node:", error);
    return res.status(500).json({ error: "Failed to contact node agent" });
  }
}
