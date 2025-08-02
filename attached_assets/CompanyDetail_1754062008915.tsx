import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ArrowLeft, ChevronDown, ChevronRight, ExternalLink, Mail, User } from 'lucide-react';
import { mockCompanies, mockPeople, mockEmailStats } from './mockData';

interface CompanyDetailProps {
  companyId: number | null;
  onBack: () => void;
}

export function CompanyDetail({ companyId, onBack }: CompanyDetailProps) {
  const [expandedPerson, setExpandedPerson] = useState<number | null>(null);
  
  if (!companyId) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Company not found.</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Companies
        </Button>
      </div>
    );
  }

  const company = mockCompanies.find(c => c.id === companyId);
  const companyPeople = mockPeople.filter(p => p.companyId === companyId);

  if (!company) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Company not found.</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Companies
        </Button>
      </div>
    );
  }

  const getPersonEmailStats = (personId: number) => {
    return mockEmailStats.filter(stat => stat.personId === personId);
  };

  const canSendEmail = (person: any) => {
    return person.attempts < 3 && !person.responded;
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="outline" onClick={onBack}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Companies
      </Button>

      {/* Company header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{company.name}</CardTitle>
              <div className="flex items-center gap-4 mt-2">
                <a 
                  href={`https://${company.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  {company.website}
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a 
                  href={company.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  LinkedIn
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total Progress</div>
              <div className="text-2xl font-bold">{company.totalEmails} / 3</div>
              <div className="text-xs text-muted-foreground">emails sent</div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{company.openCount}</div>
              <div className="text-sm text-muted-foreground">Total Opens</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{company.clickCount}</div>
              <div className="text-sm text-muted-foreground">Total Clicks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{companyPeople.length}</div>
              <div className="text-sm text-muted-foreground">Contacts</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${company.hasResponded ? 'text-green-600' : 'text-gray-400'}`}>
                {company.hasResponded ? '✓' : '—'}
              </div>
              <div className="text-sm text-muted-foreground">Response</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* People table */}
      <Card>
        <CardHeader>
          <CardTitle>Contact List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Opened</TableHead>
                <TableHead>Clicked</TableHead>
                <TableHead>Responded</TableHead>
                <TableHead>Actions</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companyPeople.map((person) => (
                <React.Fragment key={person.id}>
                  <TableRow className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{person.name}</div>
                          {person.linkedin && (
                            <a 
                              href={person.linkedin} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              LinkedIn
                            </a>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{person.email}</TableCell>
                    <TableCell>{person.position}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {person.attempts} / 3
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {person.opened ? (
                        <Badge variant="outline" className="text-green-600">
                          ✅ {person.openCount}x
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">❌</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {person.clicked ? (
                        <Badge variant="outline" className="text-blue-600">
                          ✅ {person.clickCount}x
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">❌</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {person.responded ? (
                        <Badge className="bg-green-100 text-green-800">✅ Yes</Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">❌ No</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        disabled={!canSendEmail(person)}
                        title={!canSendEmail(person) ? 'Max attempts reached or already responded' : 'Send next email'}
                      >
                        <Mail className="w-3 h-3 mr-1" />
                        {person.attempts === 0 ? 'Send' : 'Follow Up'}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setExpandedPerson(
                              expandedPerson === person.id ? null : person.id
                            )}
                          >
                            {expandedPerson === person.id ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </Collapsible>
                    </TableCell>
                  </TableRow>
                  
                  {expandedPerson === person.id && (
                    <TableRow>
                      <TableCell colSpan={9} className="bg-muted/20">
                        <div className="py-4">
                          <h4 className="font-medium mb-3">Email History for {person.name}</h4>
                          {getPersonEmailStats(person.id).length > 0 ? (
                            <div className="space-y-2">
                              {getPersonEmailStats(person.id).map((stat) => (
                                <div key={stat.id} className="border rounded-lg p-3 bg-background">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="font-medium">Attempt #{stat.attemptNumber}</div>
                                    <div className="text-sm text-muted-foreground">{stat.sentDate}</div>
                                  </div>
                                  <div className="text-sm mb-2">{stat.subject}</div>
                                  <div className="flex gap-4 text-sm">
                                    <span>Opens: {stat.openCount}</span>
                                    <span>Clicks: {stat.clickCount}</span>
                                    <span>Responded: {stat.responded ? 'Yes' : 'No'}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No emails sent yet.</p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}