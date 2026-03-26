'use client';

import { ThreatReport as ThreatReportType, ThreatIntelligenceResult } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { exportToPDF } from '@/lib/export-pdf';
import { exportToExcel } from '@/lib/export-excel';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface ThreatReportProps {
  report: ThreatReportType;
  onExport?: (format: 'json' | 'csv' | 'html') => void;
}

function getRiskColor(level: string): string {
  switch (level) {
    case 'malicious':
      return 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30';
    case 'suspicious':
      return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30';
    case 'safe':
      return 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30';
    default:
      return '';
  }
}

function ResultStatus({ result }: { result: ThreatIntelligenceResult }) {
  if (result.status === 'error') {
    return (
      <Badge variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-400">
        Error
      </Badge>
    );
  }
  
  if (result.url && typeof result.url === 'string' && result.url.length > 0) {
    try {
      // Validate URL by trying to construct a URL object
      new URL(result.url);
      return (
        <a href={result.url} target="_blank" rel="noopener noreferrer" className="no-underline">
          <Badge variant="outline" className="bg-accent/20 text-accent hover:bg-accent/30 cursor-pointer">
            View on Site →
          </Badge>
        </a>
      );
    } catch (e) {
      // Invalid URL, don't render link
    }
  }

  return (
    <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">
      Data Retrieved
    </Badge>
  );
}

export function ThreatReport({ report, onExport }: ThreatReportProps) {
  const successResults = report.results.filter(r => r.status === 'success');
  const errorResults = report.results.filter(r => r.status === 'error');

  const handleExportPDF = async () => {
    try {
      await exportToPDF(report, `threat-report-${Date.now()}.pdf`);
      toast.success('Report exported as PDF successfully');
    } catch (error) {
      toast.error('Failed to export PDF');
      console.error('PDF export error:', error);
    }
  };

  const handleExportExcel = async () => {
    try {
      exportToExcel(report, `threat-report-${Date.now()}.xlsx`);
      toast.success('Report exported as Excel successfully');
    } catch (error) {
      toast.error('Failed to export Excel');
      console.error('Excel export error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 bg-gradient-to-br from-card to-card/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl font-bold font-mono break-all">
                {report.type === 'ip' ? report.ip : report.url}
              </CardTitle>
              <CardDescription>
                {new Date(report.timestamp).toLocaleString()}
              </CardDescription>
            </div>
            <Badge className={`${getRiskColor(report.riskLevel)} text-lg px-4 py-2 border`}>
              {report.riskLevel.toUpperCase()}: {report.riskScore}/100
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Risk Score</p>
              <p className="text-2xl font-bold">{report.riskScore}/100</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sources Checked</p>
              <p className="text-2xl font-bold">{report.results.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Successful Checks</p>
              <p className="text-2xl font-bold">{successResults.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Threat Intelligence Results</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportPDF}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportExcel}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Excel
            </Button>
            {onExport && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onExport('json')}
                >
                  JSON
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onExport('csv')}
                >
                  CSV
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onExport('html')}
                >
                  HTML
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {report.results.map((result, idx) => (
            <Card key={idx} className="border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold">{result.source}</h4>
                    {result.data && (
                      <div className="mt-2 text-sm text-muted-foreground space-y-1">
                        {Object.entries(result.data).map(([key, value]) => (
                          <p key={key}>
                            <span className="font-medium">{key}:</span>{' '}
                            {String(value)}
                          </p>
                        ))}
                      </div>
                    )}
                    {result.error && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                        {result.error}
                      </p>
                    )}
                  </div>
                  <ResultStatus result={result} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {errorResults.length > 0 && (
          <Card className="border-yellow-500/30 bg-yellow-500/5">
            <CardContent className="pt-6">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                {errorResults.length} source(s) could not be checked
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
