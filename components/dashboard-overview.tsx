'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownLeft, TrendingUp, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const THREAT_DISTRIBUTION = [
  { name: 'Safe', value: 68 },
  { name: 'Low', value: 15 },
  { name: 'Medium', value: 12 },
  { name: 'High', value: 5 },
];

const COLORS = ['#22c55e', '#f59e0b', '#f97316', '#ef4444'];

const ACTIVITY_DATA = [
  { date: 'Mon', checks: 24, threats: 4 },
  { date: 'Tue', checks: 13, threats: 3 },
  { date: 'Wed', checks: 32, threats: 8 },
  { date: 'Thu', checks: 28, threats: 5 },
  { date: 'Fri', checks: 45, threats: 12 },
  { date: 'Sat', checks: 18, threats: 2 },
  { date: 'Sun', checks: 22, threats: 3 },
];

const RECENT_CHECKS = [
  {
    id: 1,
    type: 'IP',
    query: '192.168.1.1',
    risk: 'Safe',
    riskLevel: 'safe',
    timestamp: '2 mins ago',
  },
  {
    id: 2,
    type: 'URL',
    query: 'example.com/malware',
    risk: 'High',
    riskLevel: 'high',
    timestamp: '15 mins ago',
  },
  {
    id: 3,
    type: 'IP',
    query: '203.45.67.89',
    risk: 'Medium',
    riskLevel: 'medium',
    timestamp: '1 hour ago',
  },
  {
    id: 4,
    type: 'Malware',
    query: 'a1b2c3d4e5f6...',
    risk: 'Safe',
    riskLevel: 'safe',
    timestamp: '2 hours ago',
  },
];

const getRiskColor = (level: string) => {
  switch (level) {
    case 'high':
      return 'bg-red-500/10 text-red-700 border-red-200';
    case 'medium':
      return 'bg-amber-500/10 text-amber-700 border-amber-200';
    case 'low':
      return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
    case 'safe':
      return 'bg-green-500/10 text-green-700 border-green-200';
    default:
      return 'bg-gray-500/10 text-gray-700 border-gray-200';
  }
};

const getRiskIcon = (level: string) => {
  switch (level) {
    case 'high':
    case 'medium':
    case 'low':
      return <AlertCircle className="h-4 w-4" />;
    case 'safe':
      return <CheckCircle className="h-4 w-4" />;
    default:
      return null;
  }
};

export function DashboardOverview() {
  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Checks</p>
              <p className="text-2xl font-bold mt-1">2,547</p>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                +12.5% from last week
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Threats Detected</p>
              <p className="text-2xl font-bold mt-1">37</p>
              <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                +5 this week
              </p>
            </div>
            <div className="h-12 w-12 bg-red-500/10 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Detection Rate</p>
              <p className="text-2xl font-bold mt-1">98.5%</p>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                Excellent coverage
              </p>
            </div>
            <div className="h-12 w-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">API Usage</p>
              <p className="text-2xl font-bold mt-1">49.6%</p>
              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                <ArrowDownLeft className="h-3 w-3" />
                2,480 / 5,000
              </p>
            </div>
            <div className="h-12 w-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-amber-500">49%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity Chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="mb-4">
            <h3 className="font-semibold">Weekly Activity</h3>
            <p className="text-sm text-muted-foreground">Checks and threats detected</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ACTIVITY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} />
              <Legend />
              <Bar dataKey="checks" fill="var(--chart-1)" name="Checks" />
              <Bar dataKey="threats" fill="var(--chart-5)" name="Threats" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Threat Distribution */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="font-semibold">Risk Distribution</h3>
            <p className="text-sm text-muted-foreground">Last 30 days</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={THREAT_DISTRIBUTION}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {THREAT_DISTRIBUTION.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {THREAT_DISTRIBUTION.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-semibold">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Checks */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Recent Checks</h3>
            <p className="text-sm text-muted-foreground">Your latest security scans</p>
          </div>
          <Button variant="outline" size="sm">View All</Button>
        </div>
        <div className="space-y-3">
          {RECENT_CHECKS.map((check) => (
            <div
              key={check.id}
              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary">{check.type[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{check.query}</p>
                  <p className="text-xs text-muted-foreground">{check.timestamp}</p>
                </div>
              </div>
              <Badge className={getRiskColor(check.riskLevel)}>
                {getRiskIcon(check.riskLevel) && (
                  <span className="mr-1">{getRiskIcon(check.riskLevel)}</span>
                )}
                {check.risk}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
