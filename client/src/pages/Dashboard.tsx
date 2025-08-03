import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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

export default function Dashboard() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());

  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const { data: emailStats = [], isLoading: isLoadingStats } = useQuery<EmailStat[]>({
    queryKey: ["/api/email-stats"],
  });

  if (isLoadingCompanies || isLoadingStats) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
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
    const attempts = getCompanyAttempts(company.id);
    if (attempts.length === 0) {
      return {
        currentAttempt: 1,
        peopleContacted: company.totalPeople || 0,
        emailOpened: `${company.openCount}/${company.totalPeople || 0}`,
        resumeOpened: `${company.resumeOpenCount || 0}/${company.totalPeople || 0}`,
        response: company.hasResponded ? "Yes" : "No",
        decision: company.decision || "Pending"
      };
    }
    
    const latest = attempts[attempts.length - 1];
    return {
      currentAttempt: latest.attemptNumber,
      peopleContacted: latest.peopleContacted,
      emailOpened: latest.emailOpened,
      resumeOpened: latest.resumeOpened,
      response: latest.response,
      decision: latest.decision
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Company Outreach Dashboard</h1>
          <p className="text-muted-foreground">Track your outreach progress and responses</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} data-testid="button-add-company">
          <Plus className="w-4 h-4 mr-2" />
          Add Company
        </Button>
      </div>

      {/* Company Cards */}
      {companies.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">No companies added yet</p>
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
          {companies.map((company: Company, index: number) => {
            const isExpanded = expandedCompanies.has(company.id);
            const latestData = getLatestAttemptData(company);
            const attempts = getCompanyAttempts(company.id);
            
            return (
              <Card key={company.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Main Company Row */}
                  <div className="p-6 bg-card">
                    <div className="grid grid-cols-8 gap-4 items-center">
                      <div className="col-span-2">
                        <div className="font-semibold text-foreground" data-testid={`text-company-name-${index}`}>
                          {company.name}
                        </div>
                        <div className="text-sm text-muted-foreground">{company.website}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="font-medium">Attempt {latestData.currentAttempt}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="font-medium">{latestData.peopleContacted}</div>
                        <div className="text-xs text-muted-foreground">people</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="font-medium">{latestData.emailOpened}</div>
                        <div className="text-xs text-muted-foreground">opened</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="font-medium">{latestData.resumeOpened}</div>
                        <div className="text-xs text-muted-foreground">resume</div>
                      </div>
                      
                      <div className="text-center">
                        <Badge variant={latestData.response === "Yes" ? "default" : "secondary"}>
                          {latestData.response}
                        </Badge>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Badge variant={latestData.decision === "Yes" ? "default" : "outline"}>
                            {latestData.decision}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCompanyExpansion(company.id)}
                            className="h-8 w-8 p-0"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
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
                                  className="grid grid-cols-7 gap-4 py-2 px-4 bg-background rounded-md text-sm"
                                >
                                  <div className="font-medium">
                                    Attempt {attempt.attemptNumber}
                                    <div className="text-xs text-muted-foreground">{attempt.sentDate}</div>
                                  </div>
                                  <div className="text-center">{attempt.peopleContacted}</div>
                                  <div className="text-center">{attempt.emailOpened}</div>
                                  <div className="text-center">{attempt.resumeOpened}</div>
                                  <div className="text-center">
                                    <Badge variant={attempt.response === "Yes" ? "default" : "secondary"} className="text-xs">
                                      {attempt.response}
                                    </Badge>
                                  </div>
                                  <div className="text-center">
                                    <Badge variant={attempt.decision === "Yes" ? "default" : "outline"} className="text-xs">
                                      {attempt.decision}
                                    </Badge>
                                  </div>
                                  <div></div>
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

      {/* Column Headers for Reference */}
      <Card className="bg-muted/20">
        <CardContent className="p-4">
          <div className="grid grid-cols-8 gap-4 text-sm font-medium text-muted-foreground">
            <div className="col-span-2">Company</div>
            <div className="text-center">Email Count</div>
            <div className="text-center">People Contacted</div>
            <div className="text-center">Email Opened</div>
            <div className="text-center">Resume Opens</div>
            <div className="text-center">Response</div>
            <div className="text-center">Status/Decision</div>
          </div>
        </CardContent>
      </Card>

      <AddCompanyModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal} 
      />
    </div>
  );
}
