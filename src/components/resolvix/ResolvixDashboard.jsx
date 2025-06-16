
import { useState } from "react";
import { ResolvixSidebar } from "./ResolvixSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { LogsExplorer } from "./LogsExplorer";
import { TicketSystem } from "./TicketSystem";
import { TicketDetails } from "./TicketDetails";
import { Dashboard } from "./Dashboard";
import { MonitoringView } from "./MonitoringView";
import { NotificationsView } from "./NotificationsView";
import { TeamView } from "./TeamView";
import { SettingsView } from "./SettingsView";
import { ThemeToggle } from "./ThemeToggle";

export function ResolvixDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const renderContent = () => {
    if (selectedTicketId) {
      return (
        <TicketDetails 
          ticketId={selectedTicketId} 
          onBack={() => setSelectedTicketId(null)} 
        />
      );
    }

    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "logs":
        return <LogsExplorer />;
      case "tickets":
        return <TicketSystem onTicketSelect={setSelectedTicketId} />;
      case "monitoring":
        return <MonitoringView />;
      case "notifications":
        return <NotificationsView />;
      case "team":
        return <TeamView />;
      case "settings":
        return <SettingsView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ResolvixSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
        />
        <SidebarInset className="flex-1 flex flex-col">
          <header className="h-14 border-b flex items-center justify-between px-4 bg-card">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">R</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold">Resolvix</h1>
                <p className="text-xs text-muted-foreground">Logs & Incident Management</p>
              </div>
            </div>
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
