
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarHeader
} from "@/components/ui/sidebar";
import { 
  Home, 
  FileText, 
  Ticket, 
  Settings, 
  Activity,
  Bell,
  Users
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    url: "#dashboard",
    icon: Home,
    id: "dashboard"
  },
  {
    title: "Logs Explorer",
    url: "#logs", 
    icon: FileText,
    id: "logs"
  },
  {
    title: "Tickets",
    url: "#tickets",
    icon: Ticket,
    id: "tickets"
  },
  {
    title: "Monitoring",
    url: "#monitoring",
    icon: Activity,
    id: "monitoring"
  },
  {
    title: "Notifications",
    url: "#notifications",
    icon: Bell,
    id: "notifications"
  },
  {
    title: "Team",
    url: "#team",
    icon: Users,
    id: "team"
  },
  {
    title: "Settings",
    url: "#settings",
    icon: Settings,
    id: "settings"
  }
];

interface ResolvixSidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export function ResolvixSidebar({ activeSection = "dashboard", onSectionChange }: ResolvixSidebarProps) {
  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">R</span>
          </div>
          <div>
            <h2 className="font-semibold text-sm">Resolvix</h2>
            <p className="text-xs text-muted-foreground">v1.0.0</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className={activeSection === item.id ? "bg-accent" : ""}
                  >
                    <button
                      onClick={() => onSectionChange?.(item.id)}
                      className="w-full flex items-center gap-2"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
