
import { SidebarProvider } from "@/components/ui/sidebar";
import { Dashboard } from "@/components/Dashboard";

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Dashboard />
      </div>
    </SidebarProvider>
  );
};

export default Index;
