import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Search, Plus, ChevronDown, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CircularProgress } from "@/components/ui/circular-progress";
import { CircularProgressBlue } from "@/components/ui/circular-progress-blue";
import AddCompanyModal from "@/components/AddCompanyModal";
import { Company } from "@shared/schema";

export default function Companies() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [companyDecisions, setCompanyDecisions] = useState<{[key: string]: string}>({});
  const [companyResponses, setCompanyResponses] = useState<{[key: string]: string}>({});
  const itemsPerPage = 10;

  const { data: companies = [], isLoading } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const filteredCompanies = companies.filter((company: Company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.website.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "responded") return matchesSearch && company.hasResponded;
    if (filterStatus === "not-responded") return matchesSearch && !company.hasResponded;
    if (filterStatus === "attempts-left") {
      // Calculate current attempt to determine if attempts are left
      const currentAttempt = company.totalEmails > 0 
        ? Math.min(Math.ceil(company.totalEmails / company.totalPeople), 3)
        : 0;
      return matchesSearch && currentAttempt < 3;
    }
    
    return matchesSearch;
  });

  // Pagination logic from Dashboard
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex);

  // Reset pagination when filters change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [searchTerm, filterStatus, totalPages, currentPage]);

  // Scroll to top when page changes (but not on initial load)
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }
    
    // Scroll to top with a small delay to ensure DOM updates are complete
    setTimeout(() => {
      // Find the scrollable main element and scroll it to top
      const mainElement = document.querySelector('main');
      if (mainElement) {
        mainElement.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Fallback to window scroll
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  }, [currentPage]);

  // Mutation to update company status
  const updateCompanyMutation = useMutation({
    mutationFn: async ({ companyId, decision }: { companyId: string, decision: string }) => {
      const response = await apiRequest("PATCH", `/api/companies/${companyId}`, { decision });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch companies to update the UI across all pages
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
    },
  });

  // Function to set company status using the backend API
  const setCompanyStatus = (companyId: string, isArchived: boolean) => {
    const decision = isArchived ? "Yes" : "No";
    updateCompanyMutation.mutate({ companyId, decision });
  };

  // Function to set company decision
  const setCompanyDecision = (companyId: string, decision: string) => {
    setCompanyDecisions(prev => ({
      ...prev,
      [companyId]: decision
    }));
    console.log(`Setting company ${companyId} decision to ${decision}`);
  };

  // Function to set company response
  const setCompanyResponse = (companyId: string, response: string) => {
    setCompanyResponses(prev => ({
      ...prev,
      [companyId]: response
    }));
    console.log(`Setting company ${companyId} response to ${response}`);
  };

  const getCompanyStatus = (company: Company) => {
    if (company.hasResponded) return "Responded";
    if (company.totalEmails > 0) return "Active";
    return "Not Started";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Responded": return "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800";
      case "Active": return "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800";
      default: return "bg-card border-border";
    }
  };

  const getProgressColor = (company: Company) => {
    if (company.hasResponded) return "bg-green-500";
    if (company.totalEmails > 0) return "bg-blue-500";
    return "bg-gray-300";
  };

  const toggleCompanyExpansion = (companyId: string) => {
    const newExpanded = new Set(expandedCompanies);
    if (newExpanded.has(companyId)) {
      newExpanded.delete(companyId);
    } else {
      newExpanded.add(companyId);
    }
    setExpandedCompanies(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Skeleton className="h-6 w-24" /> {/* Company count */}
            <Skeleton className="h-10 w-64" /> {/* Search bar */}
            <Skeleton className="h-10 w-48" /> {/* Filter */}
          </div>
          <Skeleton className="h-10 w-32" /> {/* Add button */}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with company count, search, filters and add button */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* Company Count */}
          <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
            <span className="text-xs lg:text-sm font-medium text-muted-foreground">Companies:</span>
            <span className="text-xs lg:text-sm font-semibold">
              {filteredCompanies.length}
            </span>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
              data-testid="input-search"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Filters */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48" data-testid="select-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              <SelectItem value="responded">Responded</SelectItem>
              <SelectItem value="not-responded">Not Responded</SelectItem>
              <SelectItem value="attempts-left">Attempts Left</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Add Company Button */}
          <Button onClick={() => setShowAddModal(true)} data-testid="button-add-company" size="sm" className="h-10 flex-shrink-0 text-xs lg:text-sm px-1.5 lg:px-2">
            <Plus className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-1.5" />
            <span className="hidden sm:inline">Add Company</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Company Cards Grid */}
      {filteredCompanies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterStatus !== "all" ? "No companies match your search criteria" : "No companies added yet"}
            </p>
            <Button onClick={() => setShowAddModal(true)} data-testid="button-add-first-company">
              <Plus className="w-4 h-4 mr-2" />
              Add Company
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {paginatedCompanies.map((company: Company, index: number) => {
            // Helper functions for data extraction (similar to Dashboard)
            const getLatestAttemptData = (company: Company) => {
              // Calculate current attempt based on total emails and people
              // If we have more emails than people, we're in a follow-up round
              // Assuming max 3 attempts per person, calculate which attempt round we're in
              const currentAttempt = company.totalEmails > 0 
                ? Math.min(Math.ceil(company.totalEmails / company.totalPeople), 3)
                : 0;
              
              return {
                currentAttempt: currentAttempt,
                lastSent: company.lastAttempt || 'Never',
                peopleContacted: company.totalPeople || 0,
                emailOpened: `${company.openCount || 0}/${company.totalPeople || 0}`,
                resumeOpened: `${company.clickCount || 0}/${company.totalPeople || 0}`,
              };
            };

            // Helper function to get current response
            const getCompanyResponse = (company: Company) => {
              // Check local state first, otherwise fall back to original response
              if (companyResponses.hasOwnProperty(company.id)) {
                return companyResponses[company.id];
              }
              return company.hasResponded ? "Yes" : "Not Yet";
            };

            // Helper function to get current decision
            const getCompanyDecision = (company: Company) => {
              // Check local state first, otherwise fall back to original decision
              if (companyDecisions.hasOwnProperty(company.id)) {
                return companyDecisions[company.id];
              }
              return company.decision || "No";
            };

            // Helper function to get current status
            const getCompanyStatus = (company: Company) => {
              return company.decision === "Yes" ? "Archived" : "Active";
            };

            const isCompanyArchived = (company: Company) => {
              return company.decision === "Yes";
            };

            const latestData = getLatestAttemptData(company);
            
            return (
              <Card key={company.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Main Company Row - Same as Dashboard */}
                  <div className="px-3 py-3 lg:px-6 lg:py-4 bg-card">
                    <div className="grid grid-cols-10 gap-2 items-end text-xs lg:text-sm">
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
                            total={parseInt(latestData.emailOpened.split('/')[1]) || 1} 
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
                            total={parseInt(latestData.resumeOpened.split('/')[1]) || 1} 
                            size="sm"
                            showFraction={true}
                            showPercentage={false}
                          />
                        </div>
                      </div>
                      
                      {/* Response Column */}
                      <div className="flex flex-col items-center px-2 min-w-[75px]">
                        <div className="text-xs text-muted-foreground text-center whitespace-nowrap mb-1">
                          <div>Response</div>
                          <div>Received</div>
                        </div>
                        <div className="h-6 flex items-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <span className={`font-medium text-xs px-2 py-1 rounded-full border cursor-pointer ${
                                getCompanyResponse(company) === "Yes" 
                                  ? "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30 border-green-300 dark:border-green-700" 
                                  : getCompanyResponse(company) === "No"
                                  ? "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30 border-red-300 dark:border-red-700"
                                  : "text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700"
                              }`}>
                                {getCompanyResponse(company)}
                              </span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-32 p-1">
                              <div className="px-2 py-1 text-xs font-medium text-muted-foreground border-b border-border mb-1">
                                Select Response
                              </div>
                              <DropdownMenuItem 
                                onClick={() => setCompanyResponse(company.id, "Yes")}
                                className="flex items-center justify-between cursor-pointer px-2 py-1 focus:bg-transparent"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700">
                                    Yes
                                  </div>
                                </div>
                                {getCompanyResponse(company) === "Yes" && <Check className="h-3 w-3 text-green-700 dark:text-green-300" />}
                              </DropdownMenuItem>
                              <div className="h-px bg-border my-1"></div>
                              <DropdownMenuItem 
                                onClick={() => setCompanyResponse(company.id, "Not Yet")}
                                className="flex items-center justify-between cursor-pointer px-2 py-1 focus:bg-transparent"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700">
                                    Not Yet
                                  </div>
                                </div>
                                {getCompanyResponse(company) === "Not Yet" && <Check className="h-3 w-3 text-yellow-700 dark:text-yellow-300" />}
                              </DropdownMenuItem>
                              <div className="h-px bg-border my-1"></div>
                              <DropdownMenuItem 
                                onClick={() => setCompanyResponse(company.id, "No")}
                                className="flex items-center justify-between cursor-pointer px-2 py-1 focus:bg-transparent"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700">
                                    No
                                  </div>
                                </div>
                                {getCompanyResponse(company) === "No" && <Check className="h-3 w-3 text-red-700 dark:text-red-300" />}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      {/* Decision Received Column */}
                      <div className="flex flex-col items-center px-2 min-w-[65px]">
                        <div className="text-xs text-muted-foreground text-center whitespace-nowrap mb-1">
                          <div>Decision</div>
                          <div>Received</div>
                        </div>
                        <div className="h-6 flex items-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <span className={`font-medium text-xs px-2 py-1 rounded-full border cursor-pointer ${
                                getCompanyDecision(company) === "Yes" 
                                  ? "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30 border-green-300 dark:border-green-700" 
                                  : "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30 border-red-300 dark:border-red-700"
                              }`}>
                                {getCompanyDecision(company)}
                              </span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-32 p-1">
                              <div className="px-2 py-1 text-xs font-medium text-muted-foreground border-b border-border mb-1">
                                Select Decision
                              </div>
                              <DropdownMenuItem 
                                onClick={() => setCompanyDecision(company.id, "Yes")}
                                className="flex items-center justify-between cursor-pointer px-2 py-1 focus:bg-transparent"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700">
                                    Yes
                                  </div>
                                </div>
                                {getCompanyDecision(company) === "Yes" && <Check className="h-3 w-3 text-green-700 dark:text-green-300" />}
                              </DropdownMenuItem>
                              <div className="h-px bg-border my-1"></div>
                              <DropdownMenuItem 
                                onClick={() => setCompanyDecision(company.id, "No")}
                                className="flex items-center justify-between cursor-pointer px-2 py-1 focus:bg-transparent"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700">
                                    No
                                  </div>
                                </div>
                                {getCompanyDecision(company) === "No" && <Check className="h-3 w-3 text-red-700 dark:text-red-300" />}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      {/* Status Column */}
                      <div className="flex flex-col items-center px-2 min-w-[80px]">
                        <div className="text-xs text-muted-foreground whitespace-nowrap mb-1">Status</div>
                        <div className="h-6 flex items-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <span className={`font-medium text-xs px-2 py-1 rounded-full border cursor-pointer ${
                                isCompanyArchived(company) 
                                  ? "text-gray-700 bg-gray-100 dark:text-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600" 
                                  : "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30 border-green-300 dark:border-green-700"
                              }`}>
                                {getCompanyStatus(company)}
                              </span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-32 p-1">
                              <div className="px-2 py-1 text-xs font-medium text-muted-foreground border-b border-border mb-1">
                                Select Status
                              </div>
                              <DropdownMenuItem 
                                onClick={() => setCompanyStatus(company.id, false)}
                                className="flex items-center justify-between cursor-pointer px-2 py-1 focus:bg-transparent"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700">
                                    Active
                                  </div>
                                </div>
                                {getCompanyStatus(company) === "Active" && <Check className="h-3 w-3 text-green-700 dark:text-green-300" />}
                              </DropdownMenuItem>
                              <div className="h-px bg-border my-1"></div>
                              <DropdownMenuItem 
                                onClick={() => setCompanyStatus(company.id, true)}
                                className="flex items-center justify-between cursor-pointer px-2 py-1 focus:bg-transparent"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                                    Archive
                                  </div>
                                </div>
                                {isCompanyArchived(company) && <Check className="h-3 w-3 text-gray-700 dark:text-gray-100" />}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {filteredCompanies.length > 0 && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-10"
              >
                {page}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Page Info */}
      {filteredCompanies.length > 0 && (
        <div className="flex justify-center text-sm text-muted-foreground mt-4">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredCompanies.length)} of {filteredCompanies.length} companies
        </div>
      )}

      <AddCompanyModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal} 
      />
    </div>
  );
}
