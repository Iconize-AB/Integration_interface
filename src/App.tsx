import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import Logs from "./pages/Logs";
import SyncManager from "./pages/SyncManager";
import NotFound from "./pages/NotFound";
import CTFoodLogo from "./resources/CTFood_logo.png";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-gray-50">
            <AppSidebar />
            
            <div className="flex-1 flex flex-col">
              <header className="h-16 flex items-center border-b border-gray-200 bg-white px-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <img 
                    src={CTFoodLogo} 
                    alt="CT Food Logo" 
                    className="h-8 w-auto"
                  />
                  <div className="h-6 w-px bg-gray-300"></div>
                  <SidebarTrigger className="text-gray-600 hover:text-gray-900" />
                  <h2 className="text-lg font-mono text-gray-800 tracking-wide">
                    INTEGRATION_MANAGER
                  </h2>
                </div>
              </header>
              
              <main className="flex-1 bg-gray-50">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/logs" element={<Logs />} />
                  <Route path="/sync" element={<SyncManager />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
