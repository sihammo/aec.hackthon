import { Link, useLocation } from "wouter";
import { useGetPortfolioSummary } from "@workspace/api-client-react";
import { 
  Home, 
  Map as MapIcon, 
  PieChart, 
  ShieldAlert, 
  Zap, 
  Lightbulb,
  Activity,
  Upload,
} from "lucide-react";
import { formatCapital } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function AppSidebar() {
  const [location] = useLocation();
  const { data: summary, isLoading, isFetching } = useGetPortfolioSummary();

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/map", label: "Risk Map", icon: MapIcon },
    { href: "/portfolio", label: "Portfolio", icon: PieChart },
    { href: "/risk", label: "Risk Scores", icon: ShieldAlert },
    { href: "/simulation", label: "Simulation", icon: Zap },
    { href: "/recommendations", label: "Recommendations", icon: Lightbulb },
    { href: "/import", label: "Import Data", icon: Upload },
  ];

  return (
    <div className="w-64 flex-shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col h-screen sticky top-0 print:hidden">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="h-6 w-6 text-primary" />
          <h1 className="font-bold text-lg text-sidebar-foreground">GAM Risk</h1>
        </div>
        <p className="text-xs text-sidebar-foreground/70 uppercase tracking-wider font-semibold">
          Seismic Portfolio Analysis
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  isActive 
                    ? "bg-sidebar-primary/10 text-sidebar-primary" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-sidebar-border mt-auto">
        <p className="text-xs text-sidebar-foreground/70 mb-2">Total Exposure</p>
        {isLoading || isFetching ? (
          <Skeleton className="h-6 w-32 bg-sidebar-accent" />
        ) : summary ? (
          <p className="text-lg font-bold text-sidebar-foreground">
            {formatCapital(summary.totalCapitalAssure)}
          </p>
        ) : (
          <p className="text-lg font-bold text-sidebar-foreground">--</p>
        )}
      </div>
    </div>
  );
}
