'use client';

import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const LineChart = dynamic(() => import('recharts').then(m => m.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(m => m.Line), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then(m => m.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(m => m.Area), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(m => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(m => m.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false });
const Legend = dynamic(() => import('recharts').then(m => m.Legend), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false });
const ScatterChart = dynamic(() => import('recharts').then(m => m.ScatterChart), { ssr: false });
const Scatter = dynamic(() => import('recharts').then(m => m.Scatter), { ssr: false });

const MONTHLY_TRENDS = [
  { month: 'Jan', checks: 890, threats: 45, api: 2100 },
  { month: 'Feb', checks: 1200, threats: 78, api: 2800 },
  { month: 'Mar', checks: 1450, threats: 92, api: 3200 },
  { month: 'Apr', checks: 1100, threats: 65, api: 2900 },
  { month: 'May', checks: 1600, threats: 110, api: 3800 },
  { month: 'Jun', checks: 1850, threats: 140, api: 4100 },
];

const RISK_SCORE_DISTRIBUTION = [
  { score: 10, count: 125 },
  { score: 20, count: 98 },
  { score: 30, count: 76 },
  { score: 40, count: 62 },
  { score: 50, count: 81 },
  { score: 60, count: 59 },
  { score: 70, count: 47 },
  { score: 80, count: 34 },
  { score: 90, count: 23 },
  { score: 100, count: 15 },
];

const TOP_THREATS = [
  { name: 'Malware Distribution', count: 42, percentage: 28.5 },
  { name: 'Command & Control', count: 38, percentage: 25.8 },
  { name: 'Phishing', count: 32, percentage: 21.8 },
  { name: 'Data Exfiltration', count: 24, percentage: 16.3 },
  { name: 'DDoS Infrastructure', count: 11, percentage: 7.6 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Threat intelligence metrics and trends</p>
      </div>

      {/* Date Range Selector */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm">Last 7 Days</Button>
        <Button size="sm">Last 30 Days</Button>
        <Button variant="outline" size="sm">Last 90 Days</Button>
        <Button variant="outline" size="sm">Custom Range</Button>
      </div>

      {/* Monthly Trends Chart */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="font-semibold">Monthly Trends</h3>
          <p className="text-sm text-muted-foreground">Security checks and threat detections over time</p>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={MONTHLY_TRENDS}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} />
            <Legend />
            <Area type="monotone" dataKey="checks" fill="var(--chart-1)" stroke="var(--chart-1)" fillOpacity={0.3} name="Checks" />
            <Area type="monotone" dataKey="threats" fill="var(--chart-5)" stroke="var(--chart-5)" fillOpacity={0.3} name="Threats" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Risk Score Distribution */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="font-semibold">Risk Score Distribution</h3>
            <p className="text-sm text-muted-foreground">How risk scores are distributed</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={RISK_SCORE_DISTRIBUTION}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="score" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} />
              <Bar dataKey="count" fill="var(--chart-2)" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Threats */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="font-semibold">Top Threat Categories</h3>
            <p className="text-sm text-muted-foreground">Most detected threat types</p>
          </div>
          <div className="space-y-4">
            {TOP_THREATS.map((threat) => (
              <div key={threat.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{threat.name}</span>
                  <span className="text-muted-foreground">{threat.count}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2"
                    style={{ width: `${threat.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{threat.percentage}% of total</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* API Usage Over Time */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="font-semibold">API Usage Over Time</h3>
          <p className="text-sm text-muted-foreground">Monthly API request consumption</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={MONTHLY_TRENDS}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} />
            <Legend />
            <Line type="monotone" dataKey="api" stroke="var(--chart-4)" strokeWidth={2} name="API Requests" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
