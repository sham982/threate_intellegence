'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { CyberThreatReport } from '@/lib/types';

interface CyberThreatCheckerProps {
  onReportGenerated: (report: CyberThreatReport) => void;
}

const EXAMPLE_INDICATORS = [
  'APT28',
  'Emotet',
  'TrickBot',
];

export function CyberThreatChecker({ onReportGenerated }: CyberThreatCheckerProps) {
  const [indicator, setIndicator] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = async (indicatorToCheck: string = indicator) => {
    if (!indicatorToCheck.trim()) {
      setError('Please enter an indicator (hash, IP, domain, CVE, or actor name)');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/check-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'cyber-threat': indicatorToCheck }),
      });

      if (!response.ok) {
        throw new Error('Failed to check cyber threat');
      }

      const report = await response.json();
      onReportGenerated(report);
      setIndicator('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Cyber Threat Intelligence</CardTitle>
        <CardDescription>
          Search 40 threat intelligence feeds and databases
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter threat indicator (CVE, actor, hash, domain, etc.)"
            value={indicator}
            onChange={(e) => {
              setIndicator(e.target.value);
              setError('');
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleCheck()}
            disabled={isLoading}
          />
          <Button
            onClick={() => handleCheck()}
            disabled={isLoading || !indicator.trim()}
            className="gap-2"
          >
            {isLoading && <Spinner className="w-4 h-4" />}
            Search
          </Button>
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded border border-destructive/20">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Example indicators:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_INDICATORS.map((ex) => (
              <button
                key={ex}
                onClick={() => {
                  setIndicator(ex);
                  handleCheck(ex);
                }}
                disabled={isLoading}
                className="text-xs px-3 py-1 rounded border border-border hover:bg-accent/10 transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
