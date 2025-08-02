import { Mountain, LayoutDashboard, Building, BarChart3, User, PanelLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { SidebarThemeToggle } from "./ThemeToggle";

interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Companies", href: "/companies", icon: Building },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

export default function Sidebar({ expanded, onToggle }: SidebarProps) {
  const [location] = useLocation();

  return (
    <div className={cn(
      "bg-gray-100 dark:bg-gray-900 border-r border-border flex flex-col rounded-r-2xl shadow-lg relative z-10",
      expanded ? "sidebar-expanded" : "sidebar-collapsed"
    )}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className={cn("flex items-center space-x-2", !expanded && "justify-center")}>
          <div 
            className={cn(
              "w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center group relative overflow-hidden transition-all duration-[5000ms]",
              !expanded && "cursor-pointer hover:from-primary hover:to-primary/80"
            )}
            onClick={!expanded ? onToggle : undefined}
          >
            <Mountain className={cn(
              "w-5 h-5 text-white transition-all duration-[5000ms]",
              !expanded && "group-hover:opacity-0 group-hover:scale-75"
            )} />
            {!expanded && (
              <PanelLeft className={cn(
                "absolute inset-0 w-4 h-4 text-white transition-all duration-[5000ms] opacity-0 scale-125 m-auto",
                "group-hover:opacity-100 group-hover:scale-100"
              )} />
            )}
          </div>
          {expanded && (
            <span className="font-semibold text-foreground" data-testid="text-app-name">
              Mountain
            </span>
          )}
        </div>
        {expanded && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggle}
            className="h-8 w-8"
            data-testid="button-toggle-sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className={cn(expanded ? "" : "flex flex-col items-center")}>
          {navigation.map((item, index) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "justify-start",
                    expanded ? "w-full h-10" : "w-10 h-10 flex justify-center items-center p-0 rounded-lg sidebar-collapsed-button",
                    index > 0 && "mt-4",
                    isActive && "bg-gray-800 text-white dark:bg-gray-200 dark:text-black"
                  )}
                  data-testid={`nav-${item.name.toLowerCase()}`}
                >
                  <Icon className="w-4 h-4" />
                  {expanded && <span className="ml-3">{item.name}</span>}
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Theme Toggle */}
      <div className={cn("border-t border-border", expanded ? "px-4 py-2" : "px-3 py-2 flex justify-center")}>
        <SidebarThemeToggle expanded={expanded} />
      </div>

      {/* Sidebar Footer */}
      <div className={cn("py-2 border-t border-border", expanded ? "px-4" : "px-3 flex justify-center")}>
        <Link href="/profile">
          <div className={cn(
            "flex items-center rounded-lg hover:bg-accent cursor-pointer transition-colors",
            expanded ? "p-2 space-x-3 w-full" : "p-2 w-10 h-10 justify-center"
          )}>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-primary-foreground">AJ</span>
            </div>
            {expanded && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate" data-testid="text-user-name">Alex Johnson</div>
                <div className="text-xs text-muted-foreground truncate" data-testid="text-user-role">Senior Recruiter</div>
              </div>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
}
