import { useState } from "react";
import Sidebar from "./Sidebar";
import { useLocation } from "wouter";

interface LayoutProps {
  children: React.ReactNode;
}

const pageInfo = {
  "/": {
    title: "Dashboard",
    description: "Track your outreach campaigns and performance"
  },
  "/companies": {
    title: "Companies",
    description: "Manage your target companies and contacts"
  },
  "/analytics": {
    title: "Analytics",
    description: "View detailed performance analytics and insights"
  },
  "/profile": {
    title: "Profile",
    description: "Manage your account settings and preferences"
  }
};

export default function Layout({ children }: LayoutProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [location] = useLocation();

  const currentPage = pageInfo[location as keyof typeof pageInfo] || pageInfo["/"];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        expanded={sidebarExpanded} 
        onToggle={() => setSidebarExpanded(!sidebarExpanded)} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-card border-b border-border px-6" style={{ height: '65px' }}>
          <div className="flex items-center justify-center h-full">
            <h1 className="text-lg font-semibold text-foreground">
              Mountains
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
