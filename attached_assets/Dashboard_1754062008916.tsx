import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AddCompanyModal } from './AddCompanyModal';
import { Mail, Eye, MousePointer, MessageSquare, Plus } from 'lucide-react';
import { mockCompanies, mockStats } from './mockData';

interface DashboardProps {
  onViewCompany: (companyId: number) => void;
}

export function Dashboard({ onViewCompany }: DashboardProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  const getStatusBadge = (responded: boolean, emailsSent: number) => {
    if (responded) return <Badge className="bg-green-100 text-green-800">Responded</Badge>;
    if (emailsSent >= 3) return <Badge variant="destructive">Max Reached</Badge>;
    return <Badge variant="secondary">In Progress</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Mail className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalEmails}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opens</CardTitle>
            <Eye className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalOpens}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((mockStats.totalOpens / mockStats.totalEmails) * 100)}% open rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clicks</CardTitle>
            <MousePointer className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalClicks}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((mockStats.totalClicks / mockStats.totalEmails) * 100)}% click rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Responses</CardTitle>
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalResponses}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((mockStats.totalResponses / mockStats.totalEmails) * 100)}% response rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Company Overview Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Company Overview</CardTitle>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Company
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Emails Sent</TableHead>
                <TableHead>Last Attempt</TableHead>
                <TableHead>Opened</TableHead>
                <TableHead>Clicked</TableHead>
                <TableHead>Responded</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{company.name}</div>
                      <div className="text-sm text-muted-foreground">{company.website}</div>
                    </div>
                  </TableCell>
                  <TableCell>{company.totalEmails} / 3</TableCell>
                  <TableCell>{company.lastAttempt}</TableCell>
                  <TableCell>
                    {company.hasOpened ? (
                      <Badge variant="outline" className="text-green-600">
                        ✅ {company.openCount}x
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">❌</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {company.hasClicked ? (
                      <Badge variant="outline" className="text-blue-600">
                        ✅ {company.clickCount}x
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">❌</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {company.hasResponded ? (
                      <Badge variant="outline" className="text-green-600">✅</Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">❌</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(company.hasResponded, company.totalEmails)}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onViewCompany(company.id)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddCompanyModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />
    </div>
  );
}