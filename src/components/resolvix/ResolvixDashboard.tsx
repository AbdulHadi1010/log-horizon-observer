
import { useState } from "react";
import { ResolvixSidebar } from "./ResolvixSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogsExplorer } from "./LogsExplorer";
import { TicketSystem } from "./TicketSystem";
import { TicketDetails } from "./TicketDetails";
import { Dashboard } from "./Dashboard";

export function ResolvixDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

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
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-background relative">
      {/* Collapsible Sidebar */}
      <div 
        className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ${
          sidebarExpanded ? 'w-64' : 'w-16'
        }`}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        <ResolvixSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
          expanded={sidebarExpanded}
        />
      </div>

      {/* Backdrop for mobile */}
      {sidebarExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setSidebarExpanded(false)}
        />
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarExpanded ? 'ml-64' : 'ml-16'
      }`}>
        <header className="h-14 border-b flex items-center px-4 bg-card">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">R</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold">Resolvix</h1>
              <p className="text-xs text-muted-foreground">Logs & Incident Management</p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
