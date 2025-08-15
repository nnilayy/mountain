import { Mountain, LayoutDashboard, Building, BarChart3, User, PanelLeft, Archive } from "lucide-react";
import { Button } from "./ui/button";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { SidebarThemeToggle } from "./ThemeToggle";
import { useState, useEffect } from "react";

interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Archive", href: "/archive", icon: Archive },
  { name: "Companies", href: "/companies", icon: Building },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

export default function Sidebar({ expanded, onToggle }: SidebarProps) {
  const [location] = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 600);
    return () => clearTimeout(timer);
  }, [expanded]);

  useEffect(() => {
    // Load profile image from localStorage
    const savedImage = localStorage.getItem('profileImage');
    setProfileImage(savedImage);

    // Listen for storage changes to update across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'profileImage') {
        setProfileImage(e.newValue);
      }
    };

    // Listen for custom event to update within the same session
    const handleProfileImageChange = (e: CustomEvent) => {
      setProfileImage(e.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('profileImageChanged', handleProfileImageChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileImageChanged', handleProfileImageChange as EventListener);
    };
  }, []);

  return (
    <div className={cn(
      "bg-gray-100 dark:bg-gray-900 border-r border-border flex flex-col rounded-r-2xl shadow-lg relative z-10 sidebar-content-transition",
      expanded ? "sidebar-expanded" : "sidebar-collapsed"
    )}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-border sidebar-content-transition">
        <div className={cn("flex items-center sidebar-content-transition", expanded ? "space-x-2" : "justify-center")}>
          <div 
            className={cn(
              "w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center group relative overflow-hidden",
              !expanded && "cursor-pointer hover:from-primary hover:to-primary/80"
            )}
            onClick={!expanded ? onToggle : undefined}
          >
            <Mountain className={cn(
              "w-5 h-5 text-white transition-all duration-500 ease-out",
              !expanded && "group-hover:opacity-0 group-hover:scale-75"
            )} />
            {!expanded && (
              <PanelLeft className={cn(
                "absolute inset-0 w-4 h-4 text-white m-auto transition-all duration-500 ease-out opacity-0 scale-125",
                "group-hover:opacity-100 group-hover:scale-100"
              )} />
            )}
          </div>
          <span className="font-semibold text-foreground sidebar-text-fade" data-testid="text-app-name">
            Mountains
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggle}
          className="h-8 w-8"
          data-testid="button-toggle-sidebar"
        >
          <PanelLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="sidebar-nav-container">
          {navigation.map((item, index) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "sidebar-nav-button relative",
                    isActive && "bg-gray-800 text-white dark:bg-gray-200 dark:text-black shadow-lg"
                  )}
                  data-testid={`nav-${item.name.toLowerCase()}`}
                >
                  <div className="sidebar-nav-icon-container">
                    <Icon className="w-4 h-4 sidebar-nav-icon" />
                  </div>
                  <span className="sidebar-nav-text">
                    {item.name}
                  </span>
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Theme Toggle */}
      <div className={cn("border-t border-border sidebar-content-transition", expanded ? "px-4 py-2" : "px-3 py-2 flex justify-center")}>
        <SidebarThemeToggle expanded={expanded} />
      </div>

      {/* Sidebar Footer */}
      <div className={cn("py-2 border-t border-border sidebar-content-transition", expanded ? "px-4" : "px-3 flex justify-center")}>
        <Link href="/profile">
          <div className={cn(
            "flex items-center cursor-pointer sidebar-content-transition",
            expanded ? "p-2 space-x-3 w-full" : "p-2 w-10 h-10 justify-center"
          )}>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-medium text-primary-foreground">AJ</span>
              )}
            </div>
            <div className="flex-1 min-w-0 sidebar-text-fade overflow-hidden">
              <div className="text-sm font-medium truncate" data-testid="text-user-name">Alex Johnson</div>
              <div className="text-xs text-muted-foreground truncate" data-testid="text-user-role">Senior Recruiter</div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
