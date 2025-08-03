import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, ChevronDown, ChevronRight, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CircularProgress } from "@/components/ui/circular-progress";
import { CircularProgressBlue } from "@/components/ui/circular-progress-blue";
import AddCompanyModal from "@/components/AddCompanyModal";
import { Company, EmailStat } from "@shared/schema";

interface CompanyAttempt {
  attemptNumber: number;
  sentDate: string;
  peopleContacted: number;
  emailOpened: string;
  resumeOpened: string;
  response: string;
  decision: string;
}

// Format date to DD/MM/YY format (23/07/24)
function formatDateShort(dateString: string): string {
  // Handle various date formats that might come from mock data
  let date: Date;
  
  // If it's already a short format like "Jul 31", convert to current year
  if (dateString.match(/^[A-Za-z]{3} \d{1,2}$/)) {
    const currentYear = new Date().getFullYear();
    date = new Date(`${dateString} ${currentYear}`);
  } else {
    date = new Date(dateString);
  }
  
  // If invalid date, return original string
  if (isNaN(date.getTime())) {
    return dateString;
  }
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  
  return `${day}/${month}/${year}`;
}

export default function Dashboard() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [companyStatuses, setCompanyStatuses] = useState<{[key: string]: boolean}>({});

  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const { data: emailStats = [], isLoading: isLoadingStats } = useQuery<EmailStat[]>({
    queryKey: ["/api/email-stats"],
  });

  // Function to set company status
  const setCompanyStatus = (companyId: string, isArchived: boolean) => {
    setCompanyStatuses(prev => ({
      ...prev,
      [companyId]: isArchived
    }));
  };

  // Helper function to get current status
  const getCompanyStatus = (company: Company) => {
    // Check local state first, otherwise fall back to original decision logic
    if (companyStatuses.hasOwnProperty(company.id)) {
      return companyStatuses[company.id] ? "Archived" : "Active";
    }
    return company.decision === "Yes" ? "Archived" : "Active";
  };

  const isCompanyArchived = (company: Company) => {
    if (companyStatuses.hasOwnProperty(company.id)) {
      return companyStatuses[company.id];
    }
    return company.decision === "Yes";
  };

  // Filter companies based on search term and status
  const filteredCompanies = companies.filter((company: Company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.website.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "responded") return matchesSearch && company.hasResponded;
    if (filterStatus === "not-responded") return matchesSearch && !company.hasResponded;
    if (filterStatus === "attempts-left") return matchesSearch && company.totalEmails < 3;
    
    return matchesSearch;
  });

  if (isLoadingCompanies || isLoadingStats) {
    return (
      <div className="space-y-6">
        {/* Page Title Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-8 w-80 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        
        {/* Header row skeleton */}
        <div className="flex flex-row gap-2 lg:gap-4 justify-between items-center mb-6 min-w-0">
          <div className="flex flex-row gap-2 lg:gap-3 items-center min-w-0 flex-1">
            <Skeleton className="h-5 w-16 lg:w-20" /> {/* Company count */}
            <Skeleton className="h-10 flex-1 max-w-48 lg:max-w-64" /> {/* Search bar */}
            <Skeleton className="h-10 w-32 lg:w-48" /> {/* Filter */}
          </div>
          <Skeleton className="h-10 w-16 lg:w-28" /> {/* Add button */}
        </div>
        
        {/* Company cards skeleton */}
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const toggleCompanyExpansion = (companyId: string) => {
    const newExpanded = new Set(expandedCompanies);
    if (newExpanded.has(companyId)) {
      newExpanded.delete(companyId);
    } else {
      newExpanded.add(companyId);
    }
    setExpandedCompanies(newExpanded);
  };

  const getCompanyAttempts = (companyId: string): CompanyAttempt[] => {
    const companyStats = emailStats.filter(stat => stat.companyId === companyId);
    const attemptMap = new Map<number, CompanyAttempt>();
    
    companyStats.forEach(stat => {
      const attempt = attemptMap.get(stat.attemptNumber) || {
        attemptNumber: stat.attemptNumber,
        sentDate: stat.sentDate,
        peopleContacted: 0,
        emailOpened: "0/0",
        resumeOpened: "0/0",
        response: "No",
        decision: "Pending"
      };
      
      attempt.peopleContacted += 1;
      const opened = stat.openCount > 0 ? 1 : 0;
      const resumeOpened = stat.resumeOpenCount > 0 ? 1 : 0;
      
      const [currentOpened, totalOpened] = attempt.emailOpened.split('/').map(Number);
      const [currentResumeOpened, totalResumeOpened] = attempt.resumeOpened.split('/').map(Number);
      
      attempt.emailOpened = `${currentOpened + opened}/${totalOpened + 1}`;
      attempt.resumeOpened = `${currentResumeOpened + resumeOpened}/${totalResumeOpened + 1}`;
      
      if (stat.responded) {
        attempt.response = "Yes";
        attempt.decision = "Yes"; // This would come from the company data in real implementation
      }
      
      attemptMap.set(stat.attemptNumber, attempt);
    });
    
    return Array.from(attemptMap.values()).sort((a, b) => a.attemptNumber - b.attemptNumber);
  };

  const getLatestAttemptData = (company: Company) => {
    // Use the company data directly from API - no complex calculations needed
    const maxAttempts = 3;
    const currentAttempt = Math.min(company.totalEmails, maxAttempts);
    
    return {
      currentAttempt: currentAttempt,
      peopleContacted: company.totalPeople || 0,
      emailOpened: `${company.openCount}/${company.totalPeople || 0}`,
      resumeOpened: `${company.resumeOpenCount || 0}/${company.totalPeople || 0}`,
      response: company.hasResponded ? "Yes" : "No",
      decision: company.decision || "Pending",
      lastSent: company.lastAttempt ? formatDateShort(company.lastAttempt) : "Never"
    };
  };

  return (
    <div>
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Company Outreach Dashboard</h1>
        <p className="text-muted-foreground">Track your outreach progress and responses</p>
      </div>

      {/* Header row with company count, search, filters and add button */}
      <div className="flex flex-row gap-2 lg:gap-4 justify-between items-center mb-3 min-w-0">
        <div className="flex flex-row gap-3 lg:gap-4 items-center min-w-0 flex-1">
          {/* Company Count */}
          <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
            <span className="text-xs lg:text-sm font-medium text-muted-foreground">Companies:</span>
            <span className="text-xs lg:text-sm font-semibold">
              {filteredCompanies.length}
            </span>
          </div>
          
          {/* Search Bar */}
          <div className="relative flex-1 min-w-0 max-w-56 lg:max-w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full text-xs lg:text-sm"
              data-testid="input-search"
            />
          </div>
        </div>
        
        <div className="flex flex-row gap-2 lg:gap-3 items-center flex-shrink-0">
          {/* Filters */}
          <div className="min-w-0 max-w-32 lg:max-w-48">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full text-xs lg:text-sm" data-testid="select-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                <SelectItem value="responded">Responded</SelectItem>
                <SelectItem value="not-responded">Not Responded</SelectItem>
                <SelectItem value="attempts-left">Attempts Left</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Add Company Button */}
          <Button onClick={() => setShowAddModal(true)} data-testid="button-add-company" size="sm" className="h-10 flex-shrink-0 text-xs lg:text-sm px-2 lg:px-3">
            <Plus className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
            <span className="hidden sm:inline">Add Company</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Company Cards */}
      {filteredCompanies.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterStatus !== "all" ? "No companies match your search criteria" : "No companies added yet"}
            </p>
            <Button 
              variant="outline" 
              onClick={() => setShowAddModal(true)} 
              data-testid="button-add-first-company"
            >
              Add Your First Company
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCompanies.map((company: Company, index: number) => {
            const isExpanded = expandedCompanies.has(company.id);
            const latestData = getLatestAttemptData(company);
            const attempts = getCompanyAttempts(company.id);
            
            return (
              <Card key={company.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Main Company Row */}
                  <div className="px-3 py-3 lg:px-6 lg:py-4 bg-card">
                    <div className="grid grid-cols-11 gap-2 items-end text-xs lg:text-sm">
                      {/* Company Column */}
                      <div className="col-span-2 px-2 flex items-center justify-start h-full">
                        <div className="flex flex-col">
                          <div className="font-semibold text-foreground truncate" data-testid={`text-company-name-${index}`}>
                            {company.name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{company.website}</div>
                        </div>
                      </div>
                      
                      {/* Reach Attempt Column */}
                      <div className="flex flex-col items-center px-2 min-w-[60px]">
                        <div className="text-xs text-muted-foreground text-center whitespace-nowrap mb-1">
                          <div>Reach</div>
                          <div>Attempt</div>
                        </div>
                        <div className="font-medium text-center h-6 flex items-center justify-center">
                          <CircularProgressBlue 
                            value={latestData.currentAttempt} 
                            total={3} 
                            size="sm"
                            showFraction={true}
                            showPercentage={false}
                          />
                        </div>
                      </div>
                      
                      {/* Last Sent Column */}
                      <div className="flex flex-col items-center px-2 min-w-[85px]">
                        <div className="text-xs text-muted-foreground text-center whitespace-nowrap mb-1">
                          <div>Last</div>
                          <div>Sent</div>
                        </div>
                        <div className="font-medium text-center h-6 flex items-center text-xs whitespace-nowrap">{latestData.lastSent}</div>
                      </div>
                      
                      {/* People Reached Column */}
                      <div className="flex flex-col items-center px-2 min-w-[60px]">
                        <div className="text-xs text-muted-foreground text-center whitespace-nowrap mb-1">
                          <div>People</div>
                          <div>Reached</div>
                        </div>
                        <div className="font-medium text-center h-6 flex items-center">{latestData.peopleContacted}</div>
                      </div>
                      
                      {/* Email Opens Column */}
                      <div className="flex flex-col items-center px-2 min-w-[55px]">
                        <div className="text-xs text-muted-foreground text-center whitespace-nowrap mb-1">
                          <div>Emails</div>
                          <div>Opened</div>
                        </div>
                        <div className="font-medium text-center h-6 flex items-center justify-center">
                          <CircularProgress 
                            value={parseInt(latestData.emailOpened.split('/')[0])} 
                            total={parseInt(latestData.emailOpened.split('/')[1])} 
                            size="sm"
                            showFraction={true}
                            showPercentage={false}
                          />
                        </div>
                      </div>
                      
                      {/* Resume Opens Column */}
                      <div className="flex flex-col items-center px-2 min-w-[55px]">
                        <div className="text-xs text-muted-foreground text-center whitespace-nowrap mb-1">
                          <div>Resume</div>
                          <div>Opened</div>
                        </div>
                        <div className="font-medium text-center h-6 flex items-center justify-center">
                          <CircularProgress 
                            value={parseInt(latestData.resumeOpened.split('/')[0])} 
                            total={parseInt(latestData.resumeOpened.split('/')[1])} 
                            size="sm"
                            showFraction={true}
                            showPercentage={false}
                          />
                        </div>
                      </div>
                      
                      {/* Response Column */}
                      <div className="flex flex-col items-center px-2 min-w-[65px]">
                        <div className="text-xs text-muted-foreground text-center whitespace-nowrap mb-1">
                          <div>Response</div>
                          <div>Received</div>
                        </div>
                        <div className="h-6 flex items-center">
                          <span className={`font-medium text-xs px-2 py-1 rounded-full border ${
                            company.hasResponded 
                              ? "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30 border-green-300 dark:border-green-700" 
                              : "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30 border-red-300 dark:border-red-700"
                          }`}>
                            {company.hasResponded ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>
                      
                      {/* Decision Received Column */}
                      <div className="flex flex-col items-center px-2 min-w-[65px]">
                        <div className="text-xs text-muted-foreground text-center whitespace-nowrap mb-1">
                          <div>Decision</div>
                          <div>Received</div>
                        </div>
                        <div className="h-6 flex items-center">
                          <span className={`font-medium text-xs px-2 py-1 rounded-full border ${
                            company.decision === "Yes" 
                              ? "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30 border-green-300 dark:border-green-700" 
                              : "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30 border-red-300 dark:border-red-700"
                          }`}>
                            {company.decision === "Yes" ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>
                      
                      {/* Status Column */}
                      <div className="flex flex-col items-center px-2 min-w-[80px]">
                        <div className="text-xs text-muted-foreground whitespace-nowrap mb-1">Status</div>
                        <div className="h-6 flex items-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`text-xs px-2 h-6 min-w-[60px] rounded-full transition-all duration-200 hover:scale-105 focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:ring-0 data-[state=open]:ring-offset-0 ${
                                  isCompanyArchived(company) 
                                    ? "text-gray-700 bg-gray-100 dark:text-gray-500 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700" 
                                    : "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30 border border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800"
                                }`}
                              >
                                {getCompanyStatus(company)}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-32 p-1">
                              <DropdownMenuItem 
                                onClick={() => setCompanyStatus(company.id, false)}
                                className="flex items-center justify-between cursor-pointer px-2 py-1 focus:bg-transparent"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700">
                                    Active
                                  </div>
                                </div>
                                {!isCompanyArchived(company) && <Check className="h-3 w-3 text-green-700 dark:text-green-300" />}
                              </DropdownMenuItem>
                              <div className="h-px bg-border my-1"></div>
                              <DropdownMenuItem 
                                onClick={() => setCompanyStatus(company.id, true)}
                                className="flex items-center justify-between cursor-pointer px-2 py-1 focus:bg-transparent"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-500 border border-gray-300 dark:border-gray-600">
                                    Archived
                                  </div>
                                </div>
                                {isCompanyArchived(company) && <Check className="h-3 w-3 text-gray-700 dark:text-gray-500" />}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      {/* Details Column */}
                      <div className="flex flex-col items-center px-2 min-w-[50px]">
                        <div className="text-xs text-muted-foreground whitespace-nowrap mb-1">Details</div>
                        <div className="h-6 flex items-center justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCompanyExpansion(company.id)}
                            className="h-5 w-5 lg:h-8 lg:w-8 p-0"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-3 w-3 lg:h-4 lg:w-4" />
                            ) : (
                              <ChevronRight className="h-3 w-3 lg:h-4 lg:w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Details */}
                  <Collapsible open={isExpanded}>
                    <CollapsibleContent>
                      <div className="border-t bg-muted/20">
                        <div className="p-4">
                          <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                            Previous Attempts
                          </h4>
                          {attempts.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No previous attempts recorded</p>
                          ) : (
                            <div className="space-y-2">
                              {attempts.map((attempt) => (
                                <div
                                  key={attempt.attemptNumber}
                                  className="grid grid-cols-11 gap-2 py-2 px-4 bg-background rounded-md text-sm"
                                >
                                  <div className="col-span-2 font-medium px-2">
                                    Attempt {attempt.attemptNumber}
                                  </div>
                                  <div className="text-center px-2 min-w-[60px] flex justify-center">
                                    <CircularProgressBlue 
                                      value={attempt.attemptNumber} 
                                      total={3} 
                                      size="sm"
                                      showFraction={true}
                                      showPercentage={false}
                                    />
                                  </div>
                                  <div className="text-center px-2 text-xs min-w-[85px] whitespace-nowrap">{formatDateShort(attempt.sentDate)}</div>
                                  <div className="text-center px-2 min-w-[60px]">{attempt.peopleContacted}</div>
                                  <div className="text-center px-2 min-w-[55px] flex justify-center">
                                    <CircularProgress 
                                      value={parseInt(attempt.emailOpened.split('/')[0])} 
                                      total={parseInt(attempt.emailOpened.split('/')[1])} 
                                      size="sm"
                                      showFraction={true}
                                      showPercentage={false}
                                    />
                                  </div>
                                  <div className="text-center px-2 min-w-[55px] flex justify-center">
                                    <CircularProgress 
                                      value={parseInt(attempt.resumeOpened.split('/')[0])} 
                                      total={parseInt(attempt.resumeOpened.split('/')[1])} 
                                      size="sm"
                                      showFraction={true}
                                      showPercentage={false}
                                    />
                                  </div>
                                  <div className="text-center px-2 min-w-[65px]">
                                    <span className={`font-medium text-xs px-2 py-1 rounded-full ${
                                      attempt.response === "Yes" 
                                        ? "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30" 
                                        : "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30"
                                    }`}>
                                      {attempt.response}
                                    </span>
                                  </div>
                                  <div className="text-center px-2 min-w-[65px]">
                                    <span className={`font-medium text-xs px-2 py-1 rounded-full ${
                                      attempt.decision === "Yes" 
                                        ? "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30" 
                                        : "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30"
                                    }`}>
                                      {attempt.decision === "Yes" ? "Yes" : "No"}
                                    </span>
                                  </div>
                                  <div className="text-center px-2 min-w-[60px]">
                                    <Badge 
                                      variant={attempt.decision === "Yes" ? "outline" : "default"} 
                                      className={`text-xs ${
                                        attempt.decision === "Yes" 
                                          ? "text-gray-700 bg-gray-100 dark:text-gray-500 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600" 
                                          : "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30 border-green-300 dark:border-green-700"
                                      }`}
                                    >
                                      {attempt.decision === "Yes" ? "Archive" : "Active"}
                                    </Badge>
                                  </div>
                                  <div className="min-w-[50px]"></div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AddCompanyModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal} 
      />
    </div>
  );
}
