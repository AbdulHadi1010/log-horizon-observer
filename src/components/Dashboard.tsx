
import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Overview } from "./Overview";
import { NodesView } from "./NodesView";
import { LogsView } from "./LogsView";
import { MonitoringView } from "./MonitoringView";

export function Dashboard() {
  const [activeSection, setActiveSection] = useState("overview");

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <Overview />;
      case "nodes":
        return <NodesView />;
      case "logs":
        return <LogsView />;
      case "monitoring":
        return <MonitoringView />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="flex h-screen w-full">
      <AppSidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b flex items-center px-4 bg-card">
          <SidebarTrigger className="mr-4" />
          <h1 className="text-lg font-semibold capitalize">{activeSection}</h1>
        </header>
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
