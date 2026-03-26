import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Trash2, Share2, Eye } from 'lucide-react';

const SAMPLE_REPORTS = [
  {
    id: 1,
    title: 'Executive Summary - March 2025',
    type: 'Executive',
    createdAt: '2025-03-20',
    threat_count: 12,
    status: 'Ready',
    size: '2.4 MB',
  },
  {
    id: 2,
    title: 'Technical Analysis - IP Threats',
    type: 'Technical',
    createdAt: '2025-03-18',
    threat_count: 8,
    status: 'Ready',
    size: '3.1 MB',
  },
  {
    id: 3,
    title: 'Comprehensive Threat Report',
    type: 'Detailed',
    createdAt: '2025-03-15',
    threat_count: 24,
    status: 'Ready',
    size: '5.8 MB',
  },
  {
    id: 4,
    title: 'Weekly Threat Summary',
    type: 'Executive',
    createdAt: '2025-03-10',
    threat_count: 5,
    status: 'Ready',
    size: '1.9 MB',
  },
  {
    id: 5,
    title: 'Malware Detection Report',
    type: 'Technical',
    createdAt: '2025-03-05',
    threat_count: 15,
    status: 'Archived',
    size: '4.2 MB',
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Manage and download your threat intelligence reports</p>
        </div>
        <Button className="w-full sm:w-auto">
          <FileText className="h-4 w-4 mr-2" />
          Generate New Report
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button variant="outline" size="sm">All Types</Button>
        <Button variant="outline" size="sm">Executive</Button>
        <Button variant="outline" size="sm">Technical</Button>
        <Button variant="outline" size="sm">Detailed</Button>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {SAMPLE_REPORTS.map((report) => (
          <Card key={report.id} className="p-6 hover:bg-muted/50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                  <h3 className="font-semibold truncate">{report.title}</h3>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="outline">{report.type}</Badge>
                  {report.status === 'Archived' && (
                    <Badge variant="secondary">Archived</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {report.threat_count} threats detected • {report.size} • {new Date(report.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="ghost" size="icon" title="View Report">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" title="Download Report">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" title="Share Report">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" title="Delete Report" className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {SAMPLE_REPORTS.length === 0 && (
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-lg mb-1">No reports yet</h3>
          <p className="text-muted-foreground mb-4">Generate your first threat intelligence report</p>
          <Button>Create Report</Button>
        </Card>
      )}
    </div>
  );
}
