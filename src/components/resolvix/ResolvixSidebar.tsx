import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  FileText,
  Ticket,
  Activity,
  Bell,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

// type for menu items
interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  id: string;
}

const menuItems: MenuItem[] = [
  { title: "Dashboard", url: "#dashboard", icon: Home, id: "dashboard" },
  { title: "Logs Explorer", url: "#logs", icon: FileText, id: "logs" },
  { title: "Tickets", url: "#tickets", icon: Ticket, id: "tickets" },
  { title: "Monitoring", url: "#monitoring", icon: Activity, id: "monitoring" },
  { title: "Notifications", url: "#notifications", icon: Bell, id: "notifications" },
  { title: "Team", url: "#team", icon: Users, id: "team" },
  { title: "Settings", url: "#settings", icon: Settings, id: "settings" },
];

// Props for ResolvixSidebar
interface ResolvixSidebarProps {
  activeSection?: string;
  onSectionChange?: (sectionId: string) => void;
}

export function ResolvixSidebar({
  activeSection = "dashboard",
  onSectionChange,
}: ResolvixSidebarProps) {
  const { signOut } = useAuth();
  const { profile } = useProfile();

  // define allowed badge variants
  type BadgeVariant = "destructive" | "default" | "secondary" | "outline";

  const getRoleColor = (role: string): BadgeVariant => {
    switch (role) {
      case "admin":
        return "destructive";
      case "engineer":
        return "default";
      case "support":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getInitials = (name?: string | null, email?: string | null): string => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <Sidebar className="border-r bg-card">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold text-sm">R</span>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-sm truncate">Resolvix</h2>
            <p className="text-xs text-muted-foreground truncate">
              Incident Management
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeSection === item.id}
                    onClick={() => onSectionChange?.(item.id)}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        {profile && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={profile.avatar_url ?? undefined} />
                <AvatarFallback className="text-xs">
                  {getInitials(profile.full_name, profile.email)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {profile.full_name || profile.email}
                </p>
                <div className="flex items-center gap-1">
                  <Badge variant={getRoleColor(profile.role)} className="text-xs">
                    {profile.role}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="w-full justify-start"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
