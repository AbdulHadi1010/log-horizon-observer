
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/auth/AuthProvider";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { ResolvixDashboard } from "./components/resolvix/ResolvixDashboard";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DevSetup from "./pages/DevSetup";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/dev-setup" element={<DevSetup />} />
            
            {/* Protected main application */}
            <Route 
              path="/dashboard/*" 
              element={
                <ProtectedRoute>
                  <ResolvixDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Landing page that redirects based on auth */}
            <Route path="/" element={<Index />} />
            
            {/* Catch-all redirect to dashboard for authenticated users */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
