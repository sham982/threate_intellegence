'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/protected-route';
import { ModuleSidebar, ModuleType } from '@/components/module-sidebar';
import { ResultModal } from '@/components/result-modal';
import { IPChecker } from '@/components/ip-checker';
import { URLChecker } from '@/components/url-checker';
import { MalwareChecker } from '@/components/malware-checker';
import { CyberThreatChecker } from '@/components/cyber-threat-checker';
import { ThreatReport as ThreatReportType, CheckHistory } from '@/lib/types';
import { Trash2, History } from 'lucide-react';

export default function DashboardPage() {
  const [activeModule, setActiveModule] = useState<ModuleType>('ip');
  const [currentReport, setCurrentReport] = useState<ThreatReportType | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [history, setHistory] = useState<CheckHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem('checkHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleReportGenerated = (report: ThreatReportType) => {
    setCurrentReport(report);
    setIsResultModalOpen(true);

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

  const handleExport = (format: 'json' | 'csv' | 'html') => {
    if (!currentReport) return;

    const query = currentReport.type === 'ip' 
      ? currentReport.ip 
      : currentReport.type === 'url' 
      ? currentReport.url 
      : currentReport.type === 'malware' 
      ? currentReport.file 
      : currentReport.indicator;

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
      const reportTitle = {
        ip: 'IP Threat Report',
        url: 'URL Threat Report',
        malware: 'Malware Analysis Report',
        'cyber-threat': 'Cyber Threat Report',
      }[currentReport.type];

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
            <p><strong>Query:</strong> <span class="url-break">${query}</span></p>
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <h1 className="text-3xl font-bold">Threat Intelligence Dashboard</h1>
            <p className="text-sm text-muted-foreground">Check IPs, URLs, malware, and cyber threats</p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <ModuleSidebar activeModule={activeModule} onModuleChange={setActiveModule} />

            {/* Main Content */}
            <div className="md:col-span-3 space-y-6">
              {/* Module Content */}
              {activeModule === 'ip' && <IPChecker onReportGenerated={handleReportGenerated} />}
              {activeModule === 'url' && <URLChecker onReportGenerated={handleReportGenerated} />}
              {activeModule === 'malware' && <MalwareChecker onReportGenerated={handleReportGenerated} />}
              {activeModule === 'cyber-threat' && <CyberThreatChecker onReportGenerated={handleReportGenerated} />}

              {/* History Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <History className="w-5 h-5" />
                      <div>
                        <CardTitle>Check History</CardTitle>
                        <CardDescription>Recent threat checks</CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowHistory(!showHistory)}
                    >
                      {showHistory ? 'Hide' : 'Show'} ({history.length})
                    </Button>
                  </div>
                </CardHeader>
                {showHistory && (
                  <CardContent>
                    {history.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No checks yet. Start checking threats to build your history.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {history.slice(0, 10).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-4 p-3 border border-border rounded hover:bg-accent/5 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs px-2 py-1 rounded bg-accent/20 text-accent uppercase font-semibold">
                                  {item.type}
                                </span>
                                <span className={`text-xs font-semibold uppercase ${
                                  item.riskLevel === 'malicious' ? 'text-red-500' :
                                  item.riskLevel === 'suspicious' ? 'text-yellow-500' :
                                  'text-green-500'
                                }`}>
                                  {item.riskLevel}
                                </span>
                              </div>
                              <p className="font-mono text-sm break-all">{item.query}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(item.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <p className="text-lg font-bold">{item.riskScore}</p>
                                <p className="text-xs text-muted-foreground">score</p>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteHistory(item.id)}
                                className="text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            </div>
          </div>
        </main>

        {/* Result Modal */}
        <ResultModal
          isOpen={isResultModalOpen}
          report={currentReport}
          onClose={() => setIsResultModalOpen(false)}
          onExport={handleExport}
        />
      </div>
    </ProtectedRoute>
  );
}
