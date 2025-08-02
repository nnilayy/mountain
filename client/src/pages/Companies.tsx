import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import AddCompanyModal from "@/components/AddCompanyModal";
import { Company } from "@shared/schema";

export default function Companies() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ["/api/companies"],
  });

  const filteredCompanies = companies.filter((company: Company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.website.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "responded") return matchesSearch && company.hasResponded;
    if (filterStatus === "not-responded") return matchesSearch && !company.hasResponded;
    if (filterStatus === "attempts-left") return matchesSearch && company.totalEmails < 3;
    
    return matchesSearch;
  });

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
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
      {/* Header with filters and search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
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
        </div>
        <Button onClick={() => setShowAddModal(true)} data-testid="button-add-company">
          <Plus className="w-4 h-4 mr-2" />
          Add Company
        </Button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company: Company, index: number) => {
            const status = getCompanyStatus(company);
            const progress = Math.min((company.totalEmails / 3) * 100, 100);
            
            return (
              <Card key={company.id} className={getStatusColor(status)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold" data-testid={`text-company-${index}`}>
                        {company.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{company.website}</p>
                    </div>
                    {status !== "Not Started" && (
                      <Badge 
                        className={
                          status === "Responded" 
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                        }
                      >
                        {status}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {/* Progress bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Emails Sent</span>
                        <span data-testid={`text-email-progress-${index}`}>{company.totalEmails} / 3</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${getProgressColor(company)}`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-xs text-muted-foreground">Opens</div>
                        <div className={`text-sm font-medium ${company.openCount > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {company.openCount > 0 ? `${company.openCount}x` : '0'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Clicks</div>
                        <div className={`text-sm font-medium ${company.clickCount > 0 ? 'text-blue-600' : 'text-muted-foreground'}`}>
                          {company.clickCount > 0 ? `${company.clickCount}x` : '0'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Last</div>
                        <div className="text-sm font-medium">{company.lastAttempt || 'Never'}</div>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full" data-testid={`button-view-details-${index}`}>
                      View Details
                    </Button>
                  </div>
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
