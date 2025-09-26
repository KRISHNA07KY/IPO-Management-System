import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Apply from "@/pages/apply";
import Reports from "@/pages/reports";
import Applicants from "@/pages/applicants";
import Allotments from "@/pages/allotments";
import NewIpo from "@/pages/new-ipo";
import Settings from "@/pages/settings";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/apply" component={Apply} />
      <Route path="/applicants" component={Applicants} />
      <Route path="/allotments" component={Allotments} />
      <Route path="/reports" component={Reports} />
      <Route path="/new-ipo" component={NewIpo} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ipo-ui-theme">
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
    </ThemeProvider>
  );
}

export default App;
