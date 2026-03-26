'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getIPThreatSources, getURLThreatSources } from '@/lib/threat-checker';

export function ThreatSourcesInfo() {
  const ipSources = getIPThreatSources();
  const urlSources = getURLThreatSources();

  return (
    <Card className="border-2 bg-gradient-to-br from-card/50 to-card/30 col-span-full md:col-span-1">
      <CardHeader>
        <CardTitle>Threat Sources</CardTitle>
        <CardDescription>
          IP and URL threat intelligence platforms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ip" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="ip" className="text-xs">IP ({ipSources.length})</TabsTrigger>
            <TabsTrigger value="url" className="text-xs">URL ({urlSources.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ip">
            <div className="grid grid-cols-2 gap-2">
              {ipSources.map((source) => (
                <Badge
                  key={source.id}
                  variant="outline"
                  className="justify-center py-2 text-xs border-border hover:bg-accent/10"
                >
                  {source.name}
                </Badge>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="url">
            <div className="grid grid-cols-2 gap-2">
              {urlSources.map((source) => (
                <Badge
                  key={source.id}
                  variant="outline"
                  className="justify-center py-2 text-xs border-border hover:bg-accent/10"
                >
                  {source.name}
                </Badge>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
