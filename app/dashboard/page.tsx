'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardHeader } from '@/components/dashboard-header';
import { IPChecker } from '@/components/ip-checker';
import { ThreatReport } from '@/components/threat-report';
import { IPReport, CheckHistory } from '@/lib/types';
import { getCurrentUser, logoutUser } from '@/lib/auth';
import { ThreatSourcesInfo } from '@/components/threat-sources-info';

export default function DashboardPage() {
  const router = useRouter();
  const [currentReport, setCurrentReport] = useState<IPReport | null>(null);
  const [history, setHistory] = useState<CheckHistory[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    
    const savedHistory = localStorage.getItem('checkHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleReportGenerated = (report: IPReport) => {
    setCurrentReport(report);

    const historyItem: CheckHistory = {
      id: Math.random().toString(36).substring(7),
      ip: report.ip,
      timestamp: report.timestamp,
      riskScore: report.riskScore,
      riskLevel: report.riskLevel,
    };

    const updatedHistory = [historyItem, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('checkHistory', JSON.stringify(updatedHistory));
  };

  const handleLogout = () => {
    logoutUser();
    router.push('/auth/login');
  };

  const handleExport = (format: 'json' | 'csv' | 'html') => {
    if (!currentReport) return;

    let content = '';
    let filename = `ip-report-${currentReport.ip}-${Date.now()}`;

    if (format === 'json') {
      content = JSON.stringify(currentReport, null, 2);
      filename += '.json';
    } else if (format === 'csv') {
      const headers = ['Source', 'Status', 'Risk Score', 'Risk Level', 'Data'];
      const rows = currentReport.results.map(r => [
        r.source,
        r.status,
        currentReport.riskScore,
        currentReport.riskLevel,
        JSON.stringify(r.data || {}),
      ]);
      content = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      filename += '.csv';
    } else if (format === 'html') {
      content = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>IP Threat Report - ${currentReport.ip}</title>
          <style>
            body { font-family: system-ui; margin: 20px; background: #0f172a; color: #fff; }
            h1 { color: #8b5cf6; }
            .summary { background: #1e293b; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .risk { font-size: 24px; font-weight: bold; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { border: 1px solid #334155; padding: 10px; text-align: left; }
            th { background: #1e293b; }
          </style>
        </head>
        <body>
          <h1>IP Threat Intelligence Report</h1>
          <div class="summary">
            <p><strong>IP Address:</strong> ${currentReport.ip}</p>
            <p><strong>Checked:</strong> ${new Date(currentReport.timestamp).toLocaleString()}</p>
            <p class="risk">Risk Level: ${currentReport.riskLevel.toUpperCase()} (${currentReport.riskScore}/100)</p>
          </div>
          <h2>Results from Threat Sources</h2>
          <table>
            <tr><th>Source</th><th>Status</th><th>Data</th></tr>
            ${currentReport.results.map(r => `
              <tr>
                <td>${r.source}</td>
                <td>${r.status}</td>
                <td>${r.data ? JSON.stringify(r.data) : r.error || 'N/A'}</td>
              </tr>
            `).join('')}
          </table>
          <p style="margin-top: 30px; font-size: 12px; color: #64748b;">
            Generated: ${new Date().toLocaleString()}
          </p>
        </body>
        </html>
      `;
      filename += '.html';
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteHistory = (id: string) => {
    const updatedHistory = history.filter(h => h.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('checkHistory', JSON.stringify(updatedHistory));
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <DashboardHeader user={user} onLogout={handleLogout} />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <Tabs defaultValue="checker" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-card border border-border">
              <TabsTrigger value="checker">Check IP</TabsTrigger>
              <TabsTrigger value="history">History ({history.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="checker" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <IPChecker onReportGenerated={handleReportGenerated} />
                </div>
                <ThreatSourcesInfo />
              </div>

              {currentReport && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <ThreatReport report={currentReport} onExport={handleExport} />
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Check History</CardTitle>
                  <CardDescription>
                    Your previous IP address checks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {history.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No checks yet. Start by checking an IP address.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {history.map((item) => (
                        <Card key={item.id} className="border">
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1">
                                <h4 className="font-mono font-semibold text-lg">{item.ip}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(item.timestamp).toLocaleString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-2xl font-bold">{item.riskScore}</p>
                                  <p className="text-xs text-muted-foreground uppercase font-semibold">
                                    {item.riskLevel}
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteHistory(item.id)}
                                  className="text-destructive hover:bg-destructive/10"
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  );
}
