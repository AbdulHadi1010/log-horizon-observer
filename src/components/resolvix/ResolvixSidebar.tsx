
import { 
  Home, 
  FileText, 
  Ticket, 
  Settings, 
  Activity,
  Bell,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    id: "dashboard"
  },
  {
    title: "Logs Explorer",
    icon: FileText,
    id: "logs"
  },
  {
    title: "Tickets",
    icon: Ticket,
    id: "tickets"
  },
  {
    title: "Monitoring",
    icon: Activity,
    id: "monitoring"
  },
  {
    title: "Notifications",
    icon: Bell,
    id: "notifications"
  },
  {
    title: "Team",
    icon: Users,
    id: "team"
  },
  {
    title: "Settings",
    icon: Settings,
    id: "settings"
  }
];

interface ResolvixSidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  expanded?: boolean;
}

export function ResolvixSidebar({ 
  activeSection = "dashboard", 
  onSectionChange,
  expanded = false 
}: ResolvixSidebarProps) {
  return (
    <div className="h-full bg-card border-r shadow-lg">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">R</span>
          </div>
          {expanded && (
            <div className="transition-opacity duration-200">
              <h2 className="font-semibold text-sm">Resolvix</h2>
              <p className="text-xs text-muted-foreground">v1.0.0</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-2">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.title}
              onClick={() => onSectionChange?.(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                activeSection === item.id && "bg-accent text-accent-foreground",
                !expanded && "justify-center"
              )}
              title={!expanded ? item.title : undefined}
              aria-label={item.title}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {expanded && (
                <span className="transition-opacity duration-200 text-sm">
                  {item.title}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
