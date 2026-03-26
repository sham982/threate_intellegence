'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getThreatSources } from '@/lib/threat-checker';

export function ThreatSourcesInfo() {
  const sources = getThreatSources();

  return (
    <Card className="border-2 bg-gradient-to-br from-card/50 to-card/30 col-span-full md:col-span-1">
      <CardHeader>
        <CardTitle>Threat Sources</CardTitle>
        <CardDescription>
          We check against {sources.length} threat intelligence platforms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {sources.map((source) => (
            <Badge
              key={source.id}
              variant="outline"
              className="justify-center py-2 text-xs border-border hover:bg-accent/10"
            >
              {source.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
