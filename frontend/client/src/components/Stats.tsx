import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Company } from '@shared/schema';

interface StatsProps {
  companies: Company[];
  totalEmails: number;
  totalOpens: number;
  totalClicks: number;
  totalResponses: number;
}

export function Stats({ companies, totalEmails, totalOpens, totalClicks, totalResponses }: StatsProps) {
  // Calculate stats by company
  const companyStats = companies.map(company => ({
    name: company.name.length > 8 ? company.name.substring(0, 8) + '...' : company.name,
    fullName: company.name,
    emails: company.totalEmails,
    opens: company.openCount,
    clicks: company.clickCount,
    openRate: company.totalEmails > 0 ? Math.round((company.openCount / company.totalEmails) * 100) : 0,
    clickRate: company.totalEmails > 0 ? Math.round((company.clickCount / company.totalEmails) * 100) : 0,
  }));

  // Response rate data
  const responseData = [
    { name: 'Responded', value: totalResponses, color: '#22c55e' },
    { name: 'No Response', value: totalEmails - totalResponses, color: '#e5e7eb' },
  ];

  // Email tracking over time (mock data)
  const timelineData = [
    { date: 'Jul 20', sent: 8, opened: 5, clicked: 2 },
    { date: 'Jul 25', sent: 12, opened: 9, clicked: 4 },
    { date: 'Jul 29', sent: 15, opened: 11, clicked: 6 },
    { date: 'Aug 1', sent: 12, opened: 7, clicked: 6 },
  ];

  // Funnel data
  const funnelData = [
    { stage: 'Emails Sent', count: totalEmails, percentage: 100 },
    { stage: 'Opened', count: totalOpens, percentage: totalEmails > 0 ? Math.round((totalOpens / totalEmails) * 100) : 0 },
    { stage: 'Clicked', count: totalClicks, percentage: totalEmails > 0 ? Math.round((totalClicks / totalEmails) * 100) : 0 },
    { stage: 'Responded', count: totalResponses, percentage: totalEmails > 0 ? Math.round((totalResponses / totalEmails) * 100) : 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-total-emails">{totalEmails}</div>
            <div className="text-sm text-muted-foreground">Across all campaigns</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600" data-testid="text-open-rate">
              {totalEmails > 0 ? Math.round((totalOpens / totalEmails) * 100) : 0}%
            </div>
            <div className="text-sm text-muted-foreground">{totalOpens} opens</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600" data-testid="text-click-rate">
              {totalEmails > 0 ? Math.round((totalClicks / totalEmails) * 100) : 0}%
            </div>
            <div className="text-sm text-muted-foreground">{totalClicks} clicks</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600" data-testid="text-response-rate">
              {totalEmails > 0 ? Math.round((totalResponses / totalEmails) * 100) : 0}%
            </div>
            <div className="text-sm text-muted-foreground">{totalResponses} responses</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance by Company</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={companyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name, props) => [
                    value, 
                    name.charAt(0).toUpperCase() + name.slice(1)
                  ]}
                  labelFormatter={(label) => {
                    const company = companyStats.find(c => c.name === label);
                    return company?.fullName || label;
                  }}
                />
                <Bar dataKey="opens" fill="#3b82f6" name="opens" />
                <Bar dataKey="clicks" fill="#10b981" name="clicks" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Rate Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={responseData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {responseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sent" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="opened" stroke="#82ca9d" strokeWidth={2} />
                <Line type="monotone" dataKey="clicked" stroke="#ffc658" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnelData.map((item, index) => (
                <div key={item.stage} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="font-medium">{item.stage}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold">{item.count}</div>
                      <div className="text-sm text-muted-foreground">{item.percentage}%</div>
                    </div>
                    <div className="w-32 bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Company Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Company</th>
                  <th className="text-center py-2">Emails</th>
                  <th className="text-center py-2">Opens</th>
                  <th className="text-center py-2">Open Rate</th>
                  <th className="text-center py-2">Clicks</th>
                  <th className="text-center py-2">Click Rate</th>
                  <th className="text-center py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {companyStats.map((company, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="py-3 font-medium" data-testid={`text-company-${index}`}>{company.fullName}</td>
                    <td className="text-center py-3">{company.emails}</td>
                    <td className="text-center py-3">{company.opens}</td>
                    <td className="text-center py-3">
                      <Badge variant={company.openRate >= 60 ? "default" : "secondary"}>
                        {company.openRate}%
                      </Badge>
                    </td>
                    <td className="text-center py-3">{company.clicks}</td>
                    <td className="text-center py-3">
                      <Badge variant={company.clickRate >= 30 ? "default" : "secondary"}>
                        {company.clickRate}%
                      </Badge>
                    </td>
                    <td className="text-center py-3">
                      <Badge variant={company.opens > 0 ? "default" : "secondary"}>
                        {company.opens > 0 ? "Active" : "No Activity"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
