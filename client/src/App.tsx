import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Apply from "@/pages/apply";
import Reports from "@/pages/reports";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/apply" component={Apply} />
      <Route path="/reports" component={Reports} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider>
          <div className="min-h-screen flex bg-background text-foreground">
            <AppSidebar />
            <main className="flex-1">
              <Toaster />
              <Router />
            </main>
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
