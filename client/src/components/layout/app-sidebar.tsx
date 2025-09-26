import { Link, useLocation } from "wouter";
import { ChartLine, Home, FileText, Users, BarChart, Calculator, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Apply for IPO", href: "/apply", icon: FileText },
    { name: "Applicants", href: "/applicants", icon: Users },
    { name: "Allotments", href: "/allotments", icon: Calculator },
    { name: "Reports", href: "/reports", icon: BarChart },
  ];

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border p-6 fixed left-0 top-0 h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-sidebar-foreground flex items-center gap-3">
          <ChartLine className="text-sidebar-primary h-6 w-6" />
          IPO Management
        </h1>
      </div>
      
      <nav className="space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-8 pt-8 border-t border-sidebar-border">
        <Link href="/settings">
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer",
              location === "/settings"
                ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
            data-testid="button-settings"
          >
            <Settings className="w-5 h-5" />
            Settings
          </div>
        </Link>
      </div>
    </aside>
  );
}
