import React, { useState } from 'react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger, SidebarFooter } from './components/ui/sidebar';
import { Dashboard } from './components/Dashboard';
import { Companies } from './components/Companies';
import { CompanyDetail } from './components/CompanyDetail';
import { Stats } from './components/Stats';
import { Profile } from './components/Profile';
import { ThemeProvider } from './components/ThemeProvider';
import { QuickThemeToggle } from './components/ThemeToggle';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { BarChart3, Building2, Home, Menu, Settings, User } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onViewCompany={(id) => {
          setSelectedCompanyId(id);
          setCurrentPage('company-detail');
        }} />;
      case 'companies':
        return <Companies onViewCompany={(id) => {
          setSelectedCompanyId(id);
          setCurrentPage('company-detail');
        }} />;
      case 'company-detail':
        return <CompanyDetail 
          companyId={selectedCompanyId} 
          onBack={() => setCurrentPage('companies')}
        />;
      case 'stats':
        return <Stats />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard onViewCompany={(id) => {
          setSelectedCompanyId(id);
          setCurrentPage('company-detail');
        }} />;
    }
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard': return 'Dashboard';
      case 'companies': return 'Companies';
      case 'company-detail': return 'Company Details';
      case 'stats': return 'Statistics';
      case 'profile': return 'Profile & Settings';
      default: return 'Dashboard';
    }
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="outreach-pro-theme">
      <SidebarProvider>
        <div className="flex h-screen bg-background transition-colors duration-300">
          <Sidebar>
            <SidebarHeader className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">OP</span>
                </div>
                <h2 className="text-lg font-semibold">OutreachPro</h2>
              </div>
            </SidebarHeader>
            
            <SidebarContent>
              <SidebarMenu>
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setCurrentPage(item.id)}
                        isActive={currentPage === item.id}
                        className="w-full"
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarContent>
            
            <SidebarFooter className="p-4">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setCurrentPage('profile')}
                    isActive={currentPage === 'profile'}
                    className="w-full"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
              
              {/* User Profile Section */}
              <div className="mt-4 pt-4 border-t border-sidebar-border">
                <div 
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent cursor-pointer transition-colors"
                  onClick={() => setCurrentPage('profile')}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="Alex Johnson" />
                    <AvatarFallback className="text-xs">AJ</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground">Alex Johnson</p>
                    <p className="text-xs text-sidebar-foreground/70 truncate">alex@outreachpro.com</p>
                  </div>
                  <User className="w-4 h-4 text-sidebar-foreground/50" />
                </div>
              </div>
            </SidebarFooter>
          </Sidebar>
          
          <div className="flex-1 flex flex-col">
            <header className="border-b border-border px-6 py-4 flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="flex items-center justify-center w-10 h-10 border border-border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                  <Menu className="w-4 h-4" />
                </SidebarTrigger>
                <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
              </div>
              
              <div className="flex items-center gap-4">
                <QuickThemeToggle />
              </div>
            </header>
            
            <main className="flex-1 overflow-auto p-6 bg-background">
              {renderPage()}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}