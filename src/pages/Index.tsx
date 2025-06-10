
import { SidebarProvider } from "@/components/ui/sidebar";
import { ResolvixDashboard } from "@/components/resolvix/ResolvixDashboard";

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ResolvixDashboard />
      </div>
    </SidebarProvider>
  );
};

export default Index;
