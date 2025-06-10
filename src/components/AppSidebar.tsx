
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
  SidebarTrigger
} from "@/components/ui/sidebar";
import { 
  Home, 
  Server, 
  Activity, 
  Settings, 
  FileText,
  Shield
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  {
    title: "Overview",
    url: "#overview",
    icon: Home,
    id: "overview"
  },
  {
    title: "Nodes",
    url: "#nodes", 
    icon: Server,
    id: "nodes"
  },
  {
    title: "Logs",
    url: "#logs",
    icon: FileText,
    id: "logs"
  },
  {
    title: "Monitoring",
    url: "#monitoring",
    icon: Activity,
    id: "monitoring"
  },
  {
    title: "Security",
    url: "#security",
    icon: Shield,
    id: "security"
  },
  {
    title: "Settings",
    url: "#settings",
    icon: Settings,
    id: "settings"
  }
];

interface AppSidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export function AppSidebar({ activeSection = "overview", onSectionChange }: AppSidebarProps) {
  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <Server className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">OpenShift Console</h2>
            <p className="text-xs text-muted-foreground">v4.14.2</p>
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
