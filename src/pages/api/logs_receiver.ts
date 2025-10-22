import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: { method: string; body: { node_id: any; log: any; }; headers: { [x: string]: string; }; socket: { remoteAddress: any; }; }, res: { setHeader: (arg0: string, arg1: string) => void; status: (arg0: number) => { (): any; new(): any; end: { (): any; new(): any; }; json: { (arg0: { error?: string; success?: boolean; }): void; new(): any; }; }; }) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "authorization, x-client-info, apikey, content-type"
    );
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  console.log("Log received:", req.body);

  const { node_id, log } = req.body;

  if (!node_id || !log) {
    return res.status(400).json({ error: "Missing node_id or log" });
  }

  let logLevel = "info";
  const lower = log.toLowerCase();
  if (lower.includes("error")) logLevel = "error";
  else if (lower.includes("warn")) logLevel = "warning";
  else if (lower.includes("debug")) logLevel = "debug";

  // Get source IP (from request)
  const sourceIp =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket?.remoteAddress ||
    "unknown";

  const { error } = await supabase.from("logs").insert({
    timestamp: new Date().toISOString(),
    level: logLevel,
    source: sourceIp,
    metadata: { raw_log: log },
    created_at:new Date().toISOString(),
  });

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ success: true });
}
