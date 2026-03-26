'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/protected-route';
import { IPChecker } from '@/components/ip-checker';
import { URLChecker } from '@/components/url-checker';
import { MalwareChecker } from '@/components/malware-checker';
import { CyberThreatChecker } from '@/components/cyber-threat-checker';
import { ThreatReport } from '@/components/threat-report';
import { DashboardOverview } from '@/components/dashboard-overview';
import { ThreatReport as ThreatReportType, CheckHistory } from '@/lib/types';
import { exportToPDF } from '@/lib/export-pdf';
import { exportToExcel } from '@/lib/export-excel';
import { Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const [currentReport, setCurrentReport] = useState<ThreatReportType | null>(null);
  const [history, setHistory] = useState<CheckHistory[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('checkHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleReportGenerated = (report: ThreatReportType) => {
    setCurrentReport(report);

    const historyItem: CheckHistory = {
      id: Math.random().toString(36).substring(7),
      query: report.type === 'ip' ? report.ip : report.type === 'url' ? report.url : report.type === 'malware' ? report.file : report.indicator,
      type: report.type,
      timestamp: report.timestamp,
      riskScore: report.riskScore,
      riskLevel: report.riskLevel,
    };

    const updatedHistory = [historyItem, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('checkHistory', JSON.stringify(updatedHistory));
  };

  const handleDeleteHistory = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('checkHistory', JSON.stringify(updatedHistory));
  };

  const handleExportHistoryPDF = async () => {
    try {
      await exportToPDF(history, `threat-history-${Date.now()}.pdf`);
      toast.success('History exported as PDF successfully');
    } catch (error) {
      toast.error('Failed to export PDF');
      console.error('PDF export error:', error);
    }
  };

  const handleExportHistoryExcel = async () => {
    try {
      exportToExcel(history, `threat-history-${Date.now()}.xlsx`);
      toast.success('History exported as Excel successfully');
    } catch (error) {
      toast.error('Failed to export Excel');
      console.error('Excel export error:', error);
    }
  };

  const groupHistoryByType = (hist: CheckHistory[]) => {
    return hist.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = [];
      }
      acc[item.type].push(item);
      return acc;
    }, {} as Record<string, CheckHistory[]>);
  };

  const handleExport = (format: 'json' | 'csv' | 'html') => {
    if (!currentReport) return;

    const query = 
      currentReport.type === 'ip' ? currentReport.ip : 
      currentReport.type === 'url' ? currentReport.url : 
      currentReport.type === 'malware' ? currentReport.file : 
      currentReport.indicator;

    let content = '';
    let filename = `threat-report-${query}-${Date.now()}`;

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
      const reportTitle = currentReport.type === 'ip' ? 'IP Threat Report' : 
                         currentReport.type === 'url' ? 'URL Threat Report' :
                         currentReport.type === 'malware' ? 'Malware Analysis Report' :
                         'Cyber Threat Intelligence Report';
      const queryLabel = currentReport.type === 'ip' ? 'IP Address' : 
                        currentReport.type === 'url' ? 'URL' :
                        currentReport.type === 'malware' ? 'File Hash' :
                        'Indicator';
      
      content = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${reportTitle} - ${query}</title>
          <style>
            body { font-family: system-ui; margin: 20px; background: #0f172a; color: #fff; }
            h1 { color: #8b5cf6; }
            .summary { background: #1e293b; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .risk { font-size: 24px; font-weight: bold; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { border: 1px solid #334155; padding: 10px; text-align: left; }
            th { background: #1e293b; }
            .url-break { word-break: break-all; }
          </style>
        </head>
        <body>
          <h1>${reportTitle}</h1>
          <div class="summary">
            <p><strong>${queryLabel}:</strong> <span class="url-break">${query}</span></p>
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

  const groupedHistory = groupHistoryByType(history);
  const typeLabels: Record<string, string> = {
    ip: 'IP Checks',
    url: 'URL Checks',
    malware: 'Malware Analysis',
    'cyber-threat': 'Cyber Threats',
  };

  return (
    <ProtectedRoute>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="sticky top-14 z-30 bg-background border-b border-border">
          <TabsList className="w-full justify-start bg-transparent border-0 rounded-none h-auto p-0 px-4 lg:px-6">
            <TabsTrigger value="overview" className="rounded-none border-b-2 data-[state=active]:border-primary">
              Overview
            </TabsTrigger>
            <TabsTrigger value="ip" className="rounded-none border-b-2 data-[state=active]:border-primary">
              IP Check
            </TabsTrigger>
            <TabsTrigger value="url" className="rounded-none border-b-2 data-[state=active]:border-primary">
              URL Check
            </TabsTrigger>
            <TabsTrigger value="malware" className="rounded-none border-b-2 data-[state=active]:border-primary">
              Malware
            </TabsTrigger>
            <TabsTrigger value="cyber-threat" className="rounded-none border-b-2 data-[state=active]:border-primary">
              Cyber Threat
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-none border-b-2 data-[state=active]:border-primary">
              History ({history.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-0">
          <DashboardOverview />
        </TabsContent>

        {/* IP Check Tab */}
        <TabsContent value="ip" className="space-y-6 p-4 lg:p-6">
          <IPChecker onReportGenerated={handleReportGenerated} />
          {currentReport && currentReport.type === 'ip' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ThreatReport report={currentReport} onExport={handleExport} />
            </div>
          )}
        </TabsContent>

        {/* URL Check Tab */}
        <TabsContent value="url" className="space-y-6 p-4 lg:p-6">
          <URLChecker onReportGenerated={handleReportGenerated} />
          {currentReport && currentReport.type === 'url' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ThreatReport report={currentReport} onExport={handleExport} />
            </div>
          )}
        </TabsContent>

        {/* Malware Check Tab */}
        <TabsContent value="malware" className="space-y-6 p-4 lg:p-6">
          <MalwareChecker onReportGenerated={handleReportGenerated} />
          {currentReport && currentReport.type === 'malware' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ThreatReport report={currentReport} onExport={handleExport} />
            </div>
          )}
        </TabsContent>

        {/* Cyber Threat Check Tab */}
        <TabsContent value="cyber-threat" className="space-y-6 p-4 lg:p-6">
          <CyberThreatChecker onReportGenerated={handleReportGenerated} />
          {currentReport && currentReport.type === 'cyber-threat' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ThreatReport report={currentReport} onExport={handleExport} />
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4 p-4 lg:p-6">
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Check History</CardTitle>
                  <CardDescription>
                    Your previous threat intelligence checks organized by type
                  </CardDescription>
                </div>
                {history.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleExportHistoryPDF}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      PDF
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleExportHistoryExcel}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Excel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No checks yet. Start by checking an IP, URL, malware hash, or cyber threat indicator.
                </p>
              ) : (
                <Tabs defaultValue={Object.keys(groupedHistory)[0]} className="w-full">
                  <TabsList className="grid w-full max-w-md grid-cols-4">
                    {Object.entries(groupedHistory).map(([type, items]) => (
                      <TabsTrigger key={type} value={type} className="text-xs">
                        {typeLabels[type] || type} ({items.length})
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {Object.entries(groupedHistory).map(([type, items]) => (
                    <TabsContent key={type} value={type} className="space-y-3 mt-4">
                      {items.map((item) => (
                        <Card key={item.id} className="border">
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-mono font-semibold text-lg break-all text-foreground">{item.query}</h4>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(item.timestamp).toLocaleString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-foreground">{item.riskScore}</p>
                                  <p className={`text-xs uppercase font-semibold ${
                                    item.riskLevel === 'malicious' ? 'text-red-600' :
                                    item.riskLevel === 'suspicious' ? 'text-orange-600' :
                                    'text-green-600'
                                  }`}>
                                    {item.riskLevel}
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteHistory(item.id)}
                                  className="text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ProtectedRoute>
  );
}

  const groupedHistory = groupHistoryByType(history);
  const typeLabels: Record<string, string> = {
    ip: 'IP Checks',
    url: 'URL Checks',
    malware: 'Malware Analysis',
    'cyber-threat': 'Cyber Threats',
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">Threat Intelligence Checker</h1>
            <p className="text-sm text-muted-foreground">Check IPs, URLs, Malware, and Cyber Threats</p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <Tabs defaultValue="ip" className="space-y-6">
            <TabsList className="grid w-full max-w-2xl grid-cols-5 bg-card border border-border">
              <TabsTrigger value="ip">IP Check</TabsTrigger>
              <TabsTrigger value="url">URL Check</TabsTrigger>
              <TabsTrigger value="malware">Malware</TabsTrigger>
              <TabsTrigger value="cyber-threat">Cyber Threat</TabsTrigger>
              <TabsTrigger value="history">History ({history.length})</TabsTrigger>
            </TabsList>

            {/* IP Check Tab */}
            <TabsContent value="ip" className="space-y-6">
              <IPChecker onReportGenerated={handleReportGenerated} />

              {currentReport && currentReport.type === 'ip' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <ThreatReport report={currentReport} onExport={handleExport} />
                </div>
              )}
            </TabsContent>

            {/* URL Check Tab */}
            <TabsContent value="url" className="space-y-6">
              <URLChecker onReportGenerated={handleReportGenerated} />

              {currentReport && currentReport.type === 'url' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <ThreatReport report={currentReport} onExport={handleExport} />
                </div>
              )}
            </TabsContent>

            {/* Malware Check Tab */}
            <TabsContent value="malware" className="space-y-6">
              <MalwareChecker onReportGenerated={handleReportGenerated} />

              {currentReport && currentReport.type === 'malware' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <ThreatReport report={currentReport} onExport={handleExport} />
                </div>
              )}
            </TabsContent>

            {/* Cyber Threat Check Tab */}
            <TabsContent value="cyber-threat" className="space-y-6">
              <CyberThreatChecker onReportGenerated={handleReportGenerated} />

              {currentReport && currentReport.type === 'cyber-threat' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <ThreatReport report={currentReport} onExport={handleExport} />
                </div>
              )}
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-4">
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Check History</CardTitle>
                      <CardDescription>
                        Your previous threat intelligence checks organized by type
                      </CardDescription>
                    </div>
                    {history.length > 0 && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleExportHistoryPDF}
                          className="gap-2"
                        >
                          <Download className="h-4 w-4" />
                          PDF
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleExportHistoryExcel}
                          className="gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Excel
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {history.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No checks yet. Start by checking an IP, URL, malware hash, or cyber threat indicator.
                    </p>
                  ) : (
                    <Tabs defaultValue={Object.keys(groupedHistory)[0]} className="w-full">
                      <TabsList className="grid w-full max-w-md grid-cols-4">
                        {Object.entries(groupedHistory).map(([type, items]) => (
                          <TabsTrigger key={type} value={type} className="text-xs">
                            {typeLabels[type] || type} ({items.length})
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {Object.entries(groupedHistory).map(([type, items]) => (
                        <TabsContent key={type} value={type} className="space-y-3 mt-4">
                          {items.map((item) => (
                            <Card key={item.id} className="border">
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-mono font-semibold text-lg break-all text-foreground">{item.query}</h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {new Date(item.timestamp).toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="text-right">
                                      <p className="text-2xl font-bold text-foreground">{item.riskScore}</p>
                                      <p className={`text-xs uppercase font-semibold ${
                                        item.riskLevel === 'malicious' ? 'text-red-600' :
                                        item.riskLevel === 'suspicious' ? 'text-orange-600' :
                                        'text-green-600'
                                      }`}>
                                        {item.riskLevel}
                                      </p>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDeleteHistory(item.id)}
                                      className="text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </TabsContent>
                      ))}
                    </Tabs>
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
