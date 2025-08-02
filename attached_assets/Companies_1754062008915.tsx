import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AddCompanyModal } from './AddCompanyModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Plus, Search } from 'lucide-react';
import { mockCompanies } from './mockData';

interface CompaniesProps {
  onViewCompany: (companyId: number) => void;
}

export function Companies({ onViewCompany }: CompaniesProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCompanies = mockCompanies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.website.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'responded') return company.hasResponded && matchesSearch;
    if (filter === 'not-responded') return !company.hasResponded && matchesSearch;
    if (filter === 'attempts-left') return company.totalEmails < 3 && matchesSearch;
    
    return matchesSearch;
  });

  const getStatusClasses = (company: any) => {
    if (company.hasResponded) {
      return 'border-green-500/30 bg-green-500/5 dark:border-green-400/30 dark:bg-green-400/10';
    }
    if (company.totalEmails >= 3) {
      return 'border-red-500/30 bg-red-500/5 dark:border-red-400/30 dark:bg-red-400/10';
    }
    return 'border-yellow-500/30 bg-yellow-500/5 dark:border-yellow-400/30 dark:bg-yellow-400/10';
  };

  const getProgressBarClasses = (company: any) => {
    if (company.totalEmails >= 3) {
      return 'bg-red-500 dark:bg-red-400';
    }
    return 'bg-blue-500 dark:bg-blue-400';
  };

  return (
    <div className="space-y-6">
      {/* Header with filters and search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter companies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              <SelectItem value="responded">Responded</SelectItem>
              <SelectItem value="not-responded">Not Responded</SelectItem>
              <SelectItem value="attempts-left">Attempts Left</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Company
        </Button>
      </div>

      {/* Company Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <Card key={company.id} className={`transition-all hover:shadow-lg border ${getStatusClasses(company)}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{company.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{company.website}</p>
                </div>
                <div className="flex flex-col gap-1">
                  {company.hasResponded && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs">
                      Responded
                    </Badge>
                  )}
                  {company.totalEmails >= 3 && !company.hasResponded && (
                    <Badge variant="destructive" className="text-xs">Max Reached</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Progress bar for emails sent */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Emails Sent</span>
                  <span>{company.totalEmails} / 3</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-colors ${getProgressBarClasses(company)}`}
                    style={{ width: `${(company.totalEmails / 3) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Tracking stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-xs text-muted-foreground">Opens</div>
                  <div className={`text-sm font-medium ${
                    company.hasOpened 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-muted-foreground'
                  }`}>
                    {company.hasOpened ? `${company.openCount}x` : '0'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Clicks</div>
                  <div className={`text-sm font-medium ${
                    company.hasClicked 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-muted-foreground'
                  }`}>
                    {company.hasClicked ? `${company.clickCount}x` : '0'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Last</div>
                  <div className="text-sm font-medium text-foreground">{company.lastAttempt}</div>
                </div>
              </div>

              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => onViewCompany(company.id)}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No companies found matching your criteria.</p>
        </div>
      )}

      <AddCompanyModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />
    </div>
  );
}