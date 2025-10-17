// src/pages/api/tickets.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { timestamp, system_ip, log_path, application, log_line, severity } = req.body;

    if (!timestamp || !system_ip || !log_line) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 🔹 1. Fetch users by role
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, role");

    if (profilesError || !profiles) {
      console.error("Error fetching profiles:", profilesError);
      return res.status(500).json({ error: "Failed to fetch profiles" });
    }

    const admins = profiles.filter((p) => p.role === "admin");
    const engineers = profiles.filter((p) => p.role === "engineer");
    const supports = profiles.filter((p) => p.role === "support");

    if (admins.length === 0 || engineers.length === 0 || supports.length === 0) {
      return res.status(400).json({ error: "Not enough users for assignment" });
    }

    // 🔹 2. Get round-robin indexes from tracker
    const { data: trackers, error: trackerError } = await supabase
      .from("assignment_tracker")
      .select("role, last_index");

    if (trackerError || !trackers) {
      console.error("Error fetching tracker:", trackerError);
      return res.status(500).json({ error: "Failed to fetch tracker" });
    }

    const getIndex = (role: string, length: number) => {
      const tracker = trackers.find((t) => t.role === role);
      if (!tracker) return 0;
      return (tracker.last_index + 1) % length; // move to next, wrap around
    };

    const adminIndex = getIndex("admin", admins.length);
    const engineerIndex = getIndex("engineer", engineers.length);
    const supportIndex = getIndex("support", supports.length);

    const assignees = [
      admins[adminIndex].id,
      engineers[engineerIndex].id,
      supports[supportIndex].id,
    ];

    // 🔹 3. Insert the ticket
    const { data: ticketData, error: ticketError } = await supabase
      .from("tickets")
      .insert([
        {
          timestamp,
          system_ip,
          log_path,
          application,
          log_line,
          severity,
          status: "open",
          assignees, // ✅ array of UUIDs
        },
      ])
      .select();

    if (ticketError) {
      console.error("Ticket insert error:", ticketError);
      return res.status(500).json({ error: ticketError.message });
    }

    // 🔹 4. Update tracker indexes
    const updates = [
      { role: "admin", last_index: adminIndex },
      { role: "engineer", last_index: engineerIndex },
      { role: "support", last_index: supportIndex },
    ];

    for (const u of updates) {
      await supabase.from("assignment_tracker").update({ last_index: u.last_index }).eq("role", u.role);
    }

    return res.status(200).json({
      message: "Ticket stored successfully with 3 assignees",
      ticket: ticketData?.[0],
    });
  } catch (err: any) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
