'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Copy, Settings } from 'lucide-react';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: string[];
  audience: string;
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'executive',
    name: 'Executive Summary',
    description: 'High-level overview of threats and risk assessment',
    sections: ['Summary', 'Key Threats', 'Risk Assessment', 'Recommendations'],
    audience: 'C-Level, Management',
  },
  {
    id: 'technical',
    name: 'Technical Analysis',
    description: 'Detailed technical findings and API results',
    sections: ['Findings', 'Data Analysis', 'Source Details', 'Technical Indicators'],
    audience: 'Security Analysts, Engineers',
  },
  {
    id: 'detailed',
    name: 'Comprehensive Report',
    description: 'Complete analysis with all available data',
    sections: ['Executive Summary', 'Findings', 'Data Analysis', 'Recommendations', 'Appendix'],
    audience: 'All Stakeholders',
  },
  {
    id: 'custom',
    name: 'Custom Report',
    description: 'Build your own report with selected sections',
    sections: ['Custom Sections'],
    audience: 'Customizable',
  },
];

export function ReportTemplates() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Report Templates</h3>
        <p className="text-sm text-muted-foreground">Choose a template to generate a professional report</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORT_TEMPLATES.map((template) => (
          <Card key={template.id} className="hover:border-primary/50 cursor-pointer transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </div>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Includes:</p>
                <div className="flex flex-wrap gap-1">
                  {template.sections.map((section) => (
                    <span
                      key={section}
                      className="text-xs bg-muted px-2 py-1 rounded"
                    >
                      {section}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">For: {template.audience}</p>
              </div>
              <Button className="w-full">Use Template</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ReportBuilder() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="sections" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="customization">Customization</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Select Report Sections</CardTitle>
              <CardDescription>Choose which sections to include in your report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { id: 'executive', label: 'Executive Summary' },
                { id: 'findings', label: 'Findings' },
                { id: 'analysis', label: 'Data Analysis' },
                { id: 'sources', label: 'Source Details' },
                { id: 'recommendations', label: 'Recommendations' },
                { id: 'appendix', label: 'Appendix' },
              ].map((section) => (
                <div key={section.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={section.id}
                    defaultChecked={true}
                    className="w-4 h-4 rounded border-border"
                  />
                  <label htmlFor={section.id} className="text-sm font-medium cursor-pointer">
                    {section.label}
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customization" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customize Report</CardTitle>
              <CardDescription>Adjust report formatting and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Report Title</label>
                <input
                  type="text"
                  placeholder="Enter report title"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background mt-1"
                  defaultValue="Threat Intelligence Report"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Organization Name</label>
                <input
                  type="text"
                  placeholder="Enter organization name"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Report Format</label>
                <select className="w-full px-3 py-2 border border-border rounded-md bg-background mt-1">
                  <option>PDF</option>
                  <option>HTML</option>
                  <option>DOCX</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4 mt-4">
          <Card className="p-6 bg-muted/30">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Threat Intelligence Report</h2>
              <div className="border-b border-border pb-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Generated:</span> {new Date().toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Executive Summary</h3>
                <p className="text-sm text-muted-foreground">
                  Summary content will appear here...
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2">
        <Button className="flex-1">Generate Report</Button>
        <Button variant="outline" className="flex-1">Save as Template</Button>
      </div>
    </div>
  );
}
