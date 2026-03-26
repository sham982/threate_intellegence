'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { IPReport } from '@/lib/types';
import { Spinner } from '@/components/ui/spinner';

interface IPCheckerProps {
  onReportGenerated: (report: IPReport) => void;
}

export function IPChecker({ onReportGenerated }: IPCheckerProps) {
  const [ip, setIp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/check-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: ip.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check IP');
      }

      const report: IPReport = await response.json();
      onReportGenerated(report);
      setIp('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Check IP Address</CardTitle>
        <CardDescription>
          Enter an IP address to scan against multiple threat intelligence sources
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCheck} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter IP address (e.g., 8.8.8.8)"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              disabled={loading}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={loading || !ip.trim()}
              className="bg-accent hover:bg-accent/90 text-accent-foreground min-w-32"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Spinner />
                  <span>Checking...</span>
                </div>
              ) : (
                'Check IP'
              )}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Example IPs:</p>
            <div className="flex flex-wrap gap-2">
              {['8.8.8.8', '1.1.1.1', '208.67.222.222'].map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setIp(example)}
                  className="px-2 py-1 rounded bg-card hover:bg-muted transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
