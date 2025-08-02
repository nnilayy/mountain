import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import AddCompanyModal from "@/components/AddCompanyModal";
import { Company } from "@shared/schema";

export default function Dashboard() {
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery({
    queryKey: ["/api/companies"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getStatusBadge = (company: Company) => {
    if (company.hasResponded) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Responded</Badge>;
    }
    if (company.totalEmails > 0) {
      return <Badge variant="secondary">In Progress</Badge>;
    }
    return <Badge variant="outline">Not Started</Badge>;
  };

  const getEmailProgress = (company: Company) => {
    const progress = Math.min((company.totalEmails / 3) * 100, 100);
    return progress;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Emails Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-emails-sent">{stats?.totalEmails || 0}</div>
            <div className="text-xs text-green-600">+12% from last month</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Opens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-opens">{stats?.totalOpens || 0}</div>
            <div className="text-xs text-muted-foreground">
              {stats?.totalEmails > 0 ? Math.round((stats.totalOpens / stats.totalEmails) * 100) : 0}% open rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-clicks">{stats?.totalClicks || 0}</div>
            <div className="text-xs text-muted-foreground">
              {stats?.totalEmails > 0 ? Math.round((stats.totalClicks / stats.totalEmails) * 100) : 0}% click rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-responses">{stats?.totalResponses || 0}</div>
            <div className="text-xs text-muted-foreground">
              {stats?.totalEmails > 0 ? Math.round((stats.totalResponses / stats.totalEmails) * 100) : 0}% response rate
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company Overview Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Company Overview</CardTitle>
          <Button onClick={() => setShowAddModal(true)} data-testid="button-add-company">
            <Plus className="w-4 h-4 mr-2" />
            Add Company
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingCompanies ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No companies added yet</p>
              <Button 
                variant="outline" 
                onClick={() => setShowAddModal(true)} 
                className="mt-4"
                data-testid="button-add-first-company"
              >
                Add Your First Company
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Company</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Emails</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Last Attempt</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Opened</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Clicked</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company: Company, index: number) => (
                    <tr key={company.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-foreground" data-testid={`text-company-name-${index}`}>
                            {company.name}
                          </div>
                          <div className="text-sm text-muted-foreground">{company.website}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm" data-testid={`text-email-count-${index}`}>
                        {company.totalEmails} / 3
                      </td>
                      <td className="py-4 px-6 text-sm text-muted-foreground">
                        {company.lastAttempt || "Never"}
                      </td>
                      <td className="py-4 px-6">
                        {company.hasOpened ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            ✅ {company.openCount}x
                          </Badge>
                        ) : (
                          <Badge variant="secondary">❌</Badge>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {company.hasClicked ? (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                            ✅ {company.clickCount}x
                          </Badge>
                        ) : (
                          <Badge variant="secondary">❌</Badge>
                        )}
                      </td>
                      <td className="py-4 px-6">{getStatusBadge(company)}</td>
                      <td className="py-4 px-6">
                        <Button variant="outline" size="sm" data-testid={`button-view-company-${index}`}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddCompanyModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal} 
      />
    </div>
  );
}
