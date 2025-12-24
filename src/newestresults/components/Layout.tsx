import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  BarChart3, 
  FileText, 
  Settings,
  Users,
  Target,
  Lightbulb,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { name: "Dashboard", path: "/newestresult", icon: LayoutDashboard },
  { name: "Analytics", path: "/newestresult/analytics", icon: BarChart3 },
  { name: "Competitors", path: "/newestresult/competitors", icon: Users },
  { name: "Sources", path: "/newestresult/sources", icon: Globe },
  { name: "Recommendations", path: "/newestresult/recommendations", icon: Lightbulb },
  { name: "Executive Summary", path: "/newestresult/executive", icon: FileText },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border">
        <div className="flex h-16 items-center px-6 border-b border-border">
          <h1 className="text-xl font-bold text-foreground">GEO Rankers</h1>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== "/newestresult" && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="pl-64">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
