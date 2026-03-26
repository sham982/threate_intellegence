'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThreatReport } from '@/lib/types';
import { Download } from 'lucide-react';

interface ResultModalProps {
  isOpen: boolean;
  report: ThreatReport | null;
  onClose: () => void;
  onExport?: (format: 'json' | 'csv' | 'html') => void;
}

function getRiskColor(level: string): string {
  switch (level) {
    case 'malicious':
      return 'bg-red-500/20 text-red-700 border-red-500/30 dark:text-red-400';
    case 'suspicious':
      return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 dark:text-yellow-400';
    default:
      return 'bg-green-500/20 text-green-700 border-green-500/30 dark:text-green-400';
  }
}

export function ResultModal({ isOpen, report, onClose, onExport }: ResultModalProps) {
  if (!report) return null;

  const query = report.type === 'ip' ? report.ip : report.type === 'url' ? report.url : report.type === 'malware' ? report.file : report.indicator;
  const title = {
    ip: 'IP Address Report',
    url: 'URL Report',
    malware: 'Malware Analysis Report',
    'cyber-threat': 'Cyber Threat Report',
  }[report.type];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Header Info */}
          <div className="space-y-2 border-b border-border pb-4">
            <div className="break-all font-mono text-sm bg-muted p-3 rounded">
              {query}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {new Date(report.timestamp).toLocaleString()}
              </div>
              <Badge className={`${getRiskColor(report.riskLevel)}`}>
                {report.riskLevel.toUpperCase()}: {report.riskScore}/100
              </Badge>
            </div>
          </div>

          {/* What You Will Get Section - IP Report Only */}
          {report.type === 'ip' && (
            <div className="bg-muted/50 border border-border rounded p-4 space-y-3">
              <h3 className="font-semibold text-sm">What You Will Get With This Tool</h3>
              <ul className="text-xs text-muted-foreground space-y-2 ml-4 list-disc">
                <li><span className="font-medium text-foreground">ISP and Organization&apos;s Name</span> - Identifies the internet service provider and organization associated with the IP</li>
                <li><span className="font-medium text-foreground">IP&apos;s Hostname</span> - Reverse DNS lookup to find the hostname assigned to the IP address</li>
                <li><span className="font-medium text-foreground">Country</span> - Geographic location at the country level</li>
                <li><span className="font-medium text-foreground">Region/State</span> - Administrative region or state where the IP is located</li>
                <li><span className="font-medium text-foreground">City</span> - City-level geolocation data</li>
                <li><span className="font-medium text-foreground">Latitude and Longitude</span> - Precise geographic coordinates (best guess estimate)</li>
                <li><span className="font-medium text-foreground">Area Code</span> - Telephone area code for the region</li>
                <li><span className="font-medium text-foreground">Known Services</span> - Any known services and open ports running on the IP address</li>
                <li><span className="font-medium text-foreground">Average Risk Score</span> - Aggregated risk assessment from all threat intelligence sources</li>
              </ul>
            </div>
          )}

          {/* Results */}
          <ScrollArea className="flex-1">
            <div className="space-y-2 pr-4">
              {report.results.map((result, idx) => (
                <div key={idx} className="border border-border rounded p-3 space-y-2 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold">{result.source}</span>
                    <Badge variant="outline" className="text-xs">
                      {result.status}
                    </Badge>
                  </div>

                  {result.error && (
                    <div className="text-destructive text-xs">{result.error}</div>
                  )}

                  {result.data && (
                    <div className="text-xs text-muted-foreground space-y-1">
                      {Object.entries(result.data).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key}:</span> {JSON.stringify(value)}
                        </div>
                      ))}
                    </div>
                  )}

                  {result.url && (
                    <a
                      href={result.url.startsWith('http') ? result.url : `https://${result.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline text-xs"
                    >
                      View on platform →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Export buttons */}
          <div className="border-t border-border pt-4 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onExport?.('json')}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              JSON
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onExport?.('csv')}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              CSV
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onExport?.('html')}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              HTML
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose} className="ml-auto">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
