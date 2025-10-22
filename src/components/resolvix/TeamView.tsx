// src/components/team/TeamView.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client"; // adjust if needed
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Shield,
  UserCheck,
  UploadCloud
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";


type Role = "admin" | "engineer" | "support";
type Status = "active" | "inactive" | "pending";

interface TeamMember {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
  status: Status;
  avatar?: string | null;
  joinDate?: string | null; // ISO date string
  lastActive?: string | null;
  phone?: string | null;
  location?: string | null;
}

interface Team {
  id: string;
  name: string;
  description: string;
  members: string[]; // member ids
  lead: string; // member id
  created: string;
}

export function TeamView() {
  // Members loaded from Supabase
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const { toast } = useToast();
  // Teams (frontend-managed; still map member ids to loaded members)
  const [teams, setTeams] = useState<Team[]>([
    {
      id: "1",
      name: "Platform Engineering",
      description: "Responsible for platform infrastructure and reliability",
      members: [], // will fill after load
      lead: "",
      created: "2023-01-01",
    },
    {
      id: "2",
      name: "Support Team",
      description: "Customer support and issue resolution",
      members: [],
      lead: "",
      created: "2023-06-15",
    },
  ]);

  // UI state for editing members
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState<Partial<TeamMember>>({});

  // Invite dialog state (lightweight — not creating auth user here)
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<Role>("support");
  const [toastMessage, setToastMessage] = useState("");


  // Fetch members from Supabase profiles table
  useEffect(() => {
    fetchMembers();
    
  }, []);

  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, role, email, full_name, avatar_url, created_at, updated_at, location, phone_number, joining_date, status")
        .order("full_name", { ascending: true });

      if (error) throw error;

      const mapped: TeamMember[] = (data || []).map((r: any) => ({
        id: r.id,
        name: r.full_name ?? r.name ?? null,
        email: r.email ?? null,
        role: (r.role as Role) || "support",
        status: (r.status as Status) || "active",
        avatar: r.avatar_url ?? null,
        joinDate: r.joining_date ? String(r.joining_date) : r.created_at ? String(r.created_at).slice(0, 10) : null,
        lastActive: r.updated_at ?? null,
        phone: r.phone_number ?? null,
        location: r.location ?? null,
      }));

      setMembers(mapped);

      // If teams are empty of members, try to map by email domain or pre-existing mapping.
      // Here: keep existing team membership if ids present, otherwise auto-assign first members to Platform and last to Support as simple fallback
     // Assign members based on role
setTeams((prev) =>
  prev.map((t) => {
    if (t.members.length === 0) {
      // Group members by role
      const engineers = mapped.filter((m) => m.role === "engineer").map((m) => m.id);
      const supports = mapped.filter((m) => m.role === "support").map((m) => m.id);
      const admins = mapped.filter((m) => m.role === "admin").map((m) => m.id);

      if (t.name === "Platform Engineering") {
        return { ...t, members: engineers, lead: engineers[0] ?? "" };
      }
      if (t.name === "Support Team") {
        return { ...t, members: supports, lead: supports[0] ?? "" };
      }

      // fallback for other teams
      return { ...t, members: mapped.map((m) => m.id), lead: mapped[0]?.id ?? "" };
    }
    return t;
  })
);

    } catch (err) {
      console.error("Failed to fetch members:", err);
    } finally {
      setLoadingMembers(false);
    }
  };

  // Utility: update member in local state
  const updateLocalMember = (id: string, patch: Partial<TeamMember>) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  // Update a single field in profiles table (and local state optimistically)
  const handleUpdateMemberField = async (id: string, field: string, value: any) => {
    // Map frontend field names to DB column names
    const dbFieldMap: Record<string, string> = {
      name: "full_name",
      avatar: "avatar_url",
      avatar_url: "avatar_url",
      location: "location",
      phone: "phone_number",
      phone_number: "phone_number",
      joinDate: "joining_date",
      joining_date: "joining_date",
      role: "role",
      status: "status",
    };

    const dbField = dbFieldMap[field] ?? field;

    // optimistic update
    updateLocalMember(id, { [field]: value } as any);

    try {
      const payload: any = { [dbField]: value };
      // Keep updated_at fresh
      payload.updated_at = new Date().toISOString();

      const { error } = await supabase.from("profiles").update(payload).eq("id", id);

      if (error) {
        throw error;
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      // roll back by refetching single member (or entire list)
      await fetchMembers();
    }
  };

  // Upload avatar to supabase storage and update profile.avatar_url
 const handleUploadAvatar = async (id: string, file: File) => {
  if (!file) return;

  try {
    const fileExt = file.name.split(".").pop();
    const filename = `${id}-${Date.now()}.${fileExt}`;

    // Upload to the correct bucket "avatar"
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("avatar") // <-- bucket name here
      .upload(filename, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData} = supabase.storage
      .from("avatar")
      .getPublicUrl(uploadData.path);

    const publicUrl = urlData.publicUrl;

    // Update profile in Supabase
    await handleUpdateMemberField(id, "avatar", publicUrl);

    // Show success toast
    toast({ title: "Update", description: "Profile picture uploaded." });
    setTimeout(() => setToastMessage(""), 3000);
  } catch (err: any) {
    console.error("Profile picture upload failed:", err);
    toast({ title: "Failed", description: "Failed to upload picture." });
    setTimeout(() => setToastMessage(""), 3000);
  }
};



  // Remove member (local only; you might delete profile row in DB if you want)
  const handleRemoveMember = async (id: string) => {
    // For safety we only remove from frontend; if you want to delete from DB, uncomment below
    await supabase.from("profiles").delete().eq("id", id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setTeams((prev) => prev.map(t => ({ ...t, members: t.members.filter(mid => mid !== id), lead: t.lead === id ? (t.members.find(mid=>mid!==id) ?? "") : t.lead })));
  };

  // Make a team member the leader of a given team (frontend state)
  const handleMakeLeader = (teamId: string, memberId: string) => {
    setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, lead: memberId } : t)));
    // If you have teams persisted in DB, add code to update the teams table here.
  };

  // Invite: simple placeholder that creates a profile row if possible (note: profiles.id usually references auth.users.id)
 const handleInviteMember = async () => {
  if (!newMemberEmail) return;

  try {
    // Send a magic link to the user email
    const { data, error } = await supabase.auth.signInWithOtp({
      email: newMemberEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/Login`, // user lands on signup/signin page
      },
    });

    if (error) throw error;
     toast({ title: "Sent", description: `Invitation sent to ${newMemberEmail}` });

    setNewMemberEmail("");
    setIsInviteOpen(false);
  } catch (err) {
    console.error("Failed to send invitation:", err);
     toast({ title: "Failed", description: "Failed to send invitation." });

  }

  setTimeout(() => setToastMessage(""), 3000);
};




  // Helper colors
  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "engineer":
        return "bg-blue-100 text-blue-800";
      case "support":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "??";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  // Begin render
  return (
    <div className="p-6 space-y-6">
      {toastMessage && (
  <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow">
    {toastMessage}
  </div>
)}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">Manage team members, roles, and permissions</p>
        </div>

        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
  <DialogTrigger asChild>
    <Button>
      <UserPlus className="w-4 h-4 mr-2" />
      Invite Member
    </Button>
  </DialogTrigger>

  <DialogContent>
    <DialogHeader>
      <DialogTitle>Invite New Team Member</DialogTitle>
    </DialogHeader>

    <div className="space-y-4">
      <div>
        <Label htmlFor="invite-email">Email Address</Label>
        <Input
          id="invite-email"
          type="email"
          value={newMemberEmail}
          onChange={(e) => setNewMemberEmail(e.target.value)}
          placeholder="colleague@company.com"
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleInviteMember} className="flex-1">
          Send Invitation
        </Button>
        <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>

      </div>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        {/* MEMBERS LIST */}
        <TabsContent value="members" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingMembers ? (
              <div>Loading members...</div>
            ) : (
              members.map((member) => {
                const isEditing = editingMemberId === member.id;
                return (
                  <Card key={member.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            {member.avatar ? (
                              <AvatarImage src={member.avatar} alt={member.name ?? "avatar"} />
                            ) : (
                              <AvatarFallback>{getInitials(member.name ?? member.email ?? "")}</AvatarFallback>
                            )}
                          </Avatar>
                          <label className="absolute -right-0 -bottom-0 cursor-pointer" title="Change profile picture">
  <input
    type="file"
    accept="image/*"
    className="hidden"
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (file) handleUploadAvatar(member.id, file);
      e.currentTarget.value = ""; // reset input
    }}
  />
  <div className="p-1 bg-white rounded-full shadow-sm">
    <UploadCloud className="w-4 h-4 text-gray-600" />
  </div>
</label>

                        </div>

                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <Input
                              value={String(editBuffer.name ?? member.name ?? "")}
                              onChange={(e) => setEditBuffer((s) => ({ ...s, name: e.target.value }))}
                              onBlur={() => {
                                if (editBuffer.name !== undefined) handleUpdateMemberField(member.id, "name", editBuffer.name);
                              }}
                            />
                          ) : (
                            <h3 className="font-medium truncate">{member.name ?? member.email}</h3>
                          )}
                        </div>

                        <div className="flex flex-col gap-1">
                          <Badge className={getRoleColor(member.role)} style={{ fontSize: "10px" }}>
                            {member.role}
                          </Badge>
                          <Badge className={getStatusColor(member.status)} style={{ fontSize: "10px" }}>
                            {member.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="truncate">{member.email}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          {isEditing ? (
                            <Input
                              value={String(editBuffer.phone ?? member.phone ?? "")}
                              onChange={(e) => setEditBuffer((s) => ({ ...s, phone: e.target.value }))}
                              onBlur={() => {
                                if (editBuffer.phone !== undefined) handleUpdateMemberField(member.id, "phone_number", editBuffer.phone);
                              }}
                            />
                          ) : (
                            <span>{member.phone ?? "—"}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          {isEditing ? (
                            <Input
                              value={String(editBuffer.location ?? member.location ?? "")}
                              onChange={(e) => setEditBuffer((s) => ({ ...s, location: e.target.value }))}
                              onBlur={() => {
                                if (editBuffer.location !== undefined) handleUpdateMemberField(member.id, "location", editBuffer.location);
                              }}
                            />
                          ) : (
                            <span>{member.location ?? "—"}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {isEditing ? (
                            <Input
                              type="date"
                              value={editBuffer.joinDate ?? (member.joinDate ?? "")}
                              onChange={(e) => setEditBuffer((s) => ({ ...s, joinDate: e.target.value }))}
                              onBlur={() => {
                                if (editBuffer.joinDate !== undefined) handleUpdateMemberField(member.id, "joining_date", editBuffer.joinDate);
                              }}
                            />
                          ) : (
                            <span>Joined {member.joinDate ?? "—"}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Label>Role</Label>
                          {isEditing ? (
                            <Select value={String(editBuffer.role ?? member.role)} onValueChange={(v: Role) => setEditBuffer((s) => ({ ...s, role: v }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">admin</SelectItem>
                                <SelectItem value="engineer">engineer</SelectItem>
                                <SelectItem value="support">support</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span>{member.role}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {isEditing ? (
                          <>
                           <Button
  size="sm"
  variant="outline"
  className="flex-1"
  onClick={async () => {
    const toSave = { ...(editBuffer as any) };
    try {
      // Save all fields
      for (const [k, v] of Object.entries(toSave)) {
        if (v !== undefined) await handleUpdateMemberField(member.id, k, v);
      }

      // Clear edit state immediately
      setEditingMemberId(null);
      setEditBuffer({});

      // Show prompt

       toast({ title: "Profile Updated", description: "Changes saved successfully." });
      setTimeout(() => setToastMessage(""), 3000); // hide after 3s
    } catch (err) {
      console.error("Failed to save changes:", err);
      // Optional: show error toast
  
       toast({ title: "Failed", description: "Failed to save changes." });

      setTimeout(() => setToastMessage(""), 3000);
    }
  }}
>
  Save
</Button>

                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => {
                                setEditingMemberId(null);
                                setEditBuffer({});
                                fetchMembers(); // rollback
                              }}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => {
                                setEditingMemberId(member.id);
                                setEditBuffer({
                                  name: member.name ?? "",
                                  phone: member.phone ?? "",
                                  location: member.location ?? "",
                                  joinDate: member.joinDate ?? "",
                                  role: member.role,
                                });
                              }}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => handleRemoveMember(member.id)}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Remove
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

     
 {/* TEAMS */}
<TabsContent value="teams" className="space-y-6">
  <div className="grid gap-6">
    {teams.map((team) => {
      // Only include members assigned to this team
      let teamMembers = members.filter((m) => team.members.includes(m.id));

      // Exclude admins from engineering teams (example: Platform Engineering)
      if (team.name === "Platform Engineering") {
        teamMembers = teamMembers.filter((m) => m.role !== "admin");
      }

      const currentLead = members.find((m) => m.id === team.lead) || teamMembers[0];

      return (
        <Card key={team.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {team.name}
                </CardTitle>
                <CardDescription>{team.description}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{teamMembers.length} members</Badge>

                {/* Select Leader Button */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      Select Leader
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Select New Team Lead</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-2 mt-2">
                      {teamMembers.map((m) => (
                        <Button
                          key={m.id}
                          variant="outline"
                          onClick={() => handleMakeLeader(team.id, m.id)}
                        >
                          {m.name ?? m.email}
                        </Button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Team Lead */}
              <div>
                <h4 className="font-medium mb-2">Team Lead</h4>
                <div className="flex items-center gap-2">
                  {currentLead ? (
                    <>
                      <Avatar className="w-6 h-6">
                        {currentLead.avatar ? (
                          <AvatarImage src={currentLead.avatar} />
                        ) : (
                          <AvatarFallback className="text-xs">
                            {getInitials(currentLead.name ?? currentLead.email ?? "")}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span className="text-sm">
                        {currentLead.name ?? currentLead.email}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">No lead</span>
                  )}
                </div>
              </div>

              {/* Members */}
              <div>
                <h4 className="font-medium mb-2">Members</h4>
                <div className="flex flex-wrap gap-2">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-1 text-sm p-1 border rounded"
                    >
                      <Avatar className="w-6 h-6">
                        {member.avatar ? (
                          <AvatarImage src={member.avatar} />
                        ) : (
                          <AvatarFallback className="text-xs">
                            {getInitials(member.name ?? member.email ?? "")}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span>{member.name ?? member.email}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    })}
  </div>
</TabsContent>



        {/* PERMISSIONS */}
        <TabsContent value="permissions" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Role Permissions
                </CardTitle>
                <CardDescription>Manage what each role can access and do</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3 text-red-700">Admin</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center gap-2"><UserCheck className="w-4 h-4 text-green-500" /><span>Manage all tickets</span></div>
                      <div className="flex items-center gap-2"><UserCheck className="w-4 h-4 text-green-500" /><span>View all logs</span></div>
                      <div className="flex items-center gap-2"><UserCheck className="w-4 h-4 text-green-500" /><span>Manage team members</span></div>
                      <div className="flex items-center gap-2"><UserCheck className="w-4 h-4 text-green-500" /><span>Configure system settings</span></div>
                      <div className="flex items-center gap-2"><UserCheck className="w-4 h-4 text-green-500" /><span>Access monitoring</span></div>
                      <div className="flex items-center gap-2"><UserCheck className="w-4 h-4 text-green-500" /><span>Manage integrations</span></div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3 text-blue-700">Engineer</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center gap-2"><UserCheck className="w-4 h-4 text-green-500" /><span>Create and edit tickets</span></div>
                      <div className="flex items-center gap-2"><UserCheck className="w-4 h-4 text-green-500" /><span>View assigned logs</span></div>
                      <div className="flex items-center gap-2"><UserCheck className="w-4 h-4 text-green-500" /><span>Comment on tickets</span></div>
                      <div className="flex items-center gap-2"><UserCheck className="w-4 h-4 text-green-500" /><span>View team activity</span></div>
                      <div className="flex items-center gap-2"><UserCheck className="w-4 h-4 text-green-500" /><span>Access basic monitoring</span></div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3 text-green-700">Support</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center gap-2"><UserCheck className="w-4 h-4 text-green-500" /><span>Respond to tickets</span></div>
                      <div className="flex items-center gap-2"><UserCheck className="w-4 h-4 text-green-500" /><span>Escalate issues to engineers</span></div>
                      <div className="flex items-center gap-2"><UserCheck className="w-4 h-4 text-green-500" /><span>View logs related to support cases</span></div>
                      <div className="flex items-center gap-2"><UserCheck className="w-4 h-4 text-green-500" /><span>Create knowledge base items</span></div>
                      <div className="flex items-center gap-2"><UserCheck className="w-4 h-4 text-green-500" /><span>Communicate with customers</span></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
