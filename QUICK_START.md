# SecCheck - Professional Threat Intelligence Platform

## Quick Start Guide

Welcome to SecCheck! This guide will get you up and running in minutes.

---

## What's New

SecCheck has been transformed into an **enterprise-grade threat intelligence platform** with professional features, modern UI/UX, and comprehensive analytics.

### Key Improvements

✅ **Professional Navigation**
- Modern sidebar with organized menu structure
- Sticky header with global search and notifications
- Breadcrumb navigation for easy movement
- Floating action bar for quick access

✅ **Dashboard Overview**
- Real-time metrics and KPIs
- Weekly activity charts
- Risk distribution analysis
- Recent activity feed

✅ **Analytics & Reporting**
- Monthly trends visualization
- Advanced filtering and date ranges
- Multiple report templates
- Comprehensive reporting system

✅ **Enterprise Services**
- Data caching with TTL management
- API client with retry logic
- Multi-channel notifications (Email, Slack, Webhooks)
- Alert rule management

---

## Getting Started

### 1. **Accessing the Dashboard**

Navigate to `/dashboard` to see the new professional layout:

```
Header (Search, Notifications, User Menu)
  ↓
Sidebar (Main Navigation) | Content Area with Tabs
  ↓
Breadcrumbs | Floating Action Bar
```

### 2. **Dashboard Tabs**

The main dashboard now includes 6 tabs:

| Tab | Purpose |
|-----|---------|
| **Overview** | Key metrics and activity summary |
| **IP Check** | Check IP addresses |
| **URL Check** | Analyze URLs |
| **Malware** | Hash and malware analysis |
| **Cyber Threat** | Threat feed analysis |
| **History** | Previous checks and exports |

### 3. **Main Navigation**

Left sidebar provides quick access to:
- **Main**: Overview, Analytics
- **Threat Analysis**: IP, URL, Malware, Cyber Threats
- **Reports**: Report generation and management
- **Configuration**: Settings, Help & Support

### 4. **Key Features by Page**

#### Dashboard (`/dashboard`)
- Overview with 4 key metrics
- Charts: Weekly activity, risk distribution
- Recent checks list
- Tab-based navigation to checkers
- Check history with export options

#### Analytics (`/dashboard/analytics`)
- Monthly trends (checks and threats)
- Risk score distribution analysis
- Top threat categories
- API usage tracking
- Date range filtering

#### Reports (`/dashboard/reports`)
- Browse generated reports
- View, download, or share reports
- Archive old reports
- Report type filtering

#### Settings (`/dashboard/settings`)
- API key management
- Notification preferences
- Security settings
- Data management and retention
- Team member management

#### Help (`/dashboard/help`)
- 6 FAQ items with answers
- Quick support options
- Help article search
- Resource library

---

## Using Core Services

### Data Service

Cache and aggregate check data:

```typescript
import { dataService } from '@/lib/services/data-service'

// Get aggregated statistics
const checks = JSON.parse(localStorage.getItem('checkHistory') || '[]')
const stats = dataService.aggregateCheckHistory(checks)

console.log(`Threats Detected: ${stats.threatsDetected}`)
console.log(`Avg Risk: ${stats.avgRiskScore.toFixed(1)}/100`)
```

### API Client

Make API requests with automatic retry logic:

```typescript
import { apiClient } from '@/lib/services/api-client'

const { data, error } = await apiClient.get('/api/reports')
const { data: created } = await apiClient.post('/api/reports', { title: 'New Report' })
```

### Notification Service

Set up alerts for high-risk threats:

```typescript
import { notificationService } from '@/lib/services/notification-service'

// Create a rule for high-risk IP threats
notificationService.setRule({
  id: 'high_risk_rule',
  name: 'High Risk IP Alerts',
  enabled: true,
  condition: { 
    riskLevel: 'high',
    minRiskScore: 75,
    checkTypes: ['ip']
  },
  channels: [{
    type: 'email',
    config: { email: 'alerts@company.com' },
    enabled: true
  }]
})

// When a check is performed, evaluate it against rules
const check = { type: 'ip', query: '203.45.67.89', riskScore: 85, riskLevel: 'high' }
const matchingRules = notificationService.evaluateAlert(check)
```

---

## UI Components

### New Components

**Header** - Global navigation with search
```tsx
<AppHeader userName="Security Team" />
```

**Sidebar** - Main navigation menu
```tsx
<AppSidebar isOpen={true} />
```

**Breadcrumbs** - Contextual navigation
```tsx
<AppBreadcrumbs />
```

**Floating Actions** - Quick actions
```tsx
<FloatingActionBar onNewCheck={handleNewCheck} />
```

**Dashboard Overview** - Metrics and charts
```tsx
<DashboardOverview />
```

**Report Templates** - Report generation
```tsx
<ReportTemplates />
<ReportBuilder />
```

---

## Customization

### Changing Colors

Edit `globals.css` to customize colors:

```css
:root {
  --primary: #8cbdb9;           /* Teal accent */
  --sidebar: #2d3e4e;           /* Dark blue-gray */
  --risk-high: #ef4444;         /* Red */
  --risk-medium: #f59e0b;       /* Amber */
  --risk-safe: #22c55e;         /* Green */
}
```

### Adding New Sidebar Items

Edit `components/app-sidebar.tsx`:

```typescript
const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    title: 'Custom Section',
    items: [
      {
        id: 'custom-item',
        label: 'Custom Feature',
        icon: <Icon className="h-4 w-4" />,
        href: '/dashboard/custom',
      },
    ],
  },
];
```

### Creating Custom Report Templates

Add templates in `components/report-templates.tsx`:

```typescript
{
  id: 'compliance',
  name: 'Compliance Report',
  description: 'GDPR and compliance-focused report',
  sections: ['Summary', 'Data Processing', 'Compliance Status'],
  audience: 'Compliance Officers',
}
```

---

## API Integration Examples

### Creating an Alert Rule

```typescript
await apiClient.post('/api/notifications/rules', {
  name: 'Medium+ Risk Alerts',
  condition: { minRiskScore: 50 },
  channels: [
    { type: 'email', config: { email: 'security@company.com' } },
    { type: 'slack', config: { webhookUrl: process.env.SLACK_WEBHOOK } }
  ]
})
```

### Generating a Report

```typescript
const { data: report } = await apiClient.post('/api/reports', {
  template: 'executive',
  checks: history.slice(0, 10),
  title: 'Weekly Security Summary'
})
```

### Exporting Data

```typescript
const { data: exported } = await apiClient.post('/api/export', {
  type: 'csv',
  checkIds: selectedChecks
})
```

---

## Best Practices

### 1. **Cache Frequently Accessed Data**
```typescript
const stats = dataService.get('threat_stats')
if (!stats) {
  const calculated = dataService.aggregateCheckHistory(checks)
  dataService.set('threat_stats', calculated, 3600000) // 1 hour
}
```

### 2. **Use Batch Processing for Large Operations**
```typescript
await dataService.batchProcess(
  checks,
  async (check) => await apiClient.post('/api/process', check),
  10 // Batch size
)
```

### 3. **Monitor Rate Limits**
```typescript
const status = apiClient.getRateLimitStatus('/api/check-ip')
if (status.remaining < 100) {
  showWarning('Approaching API limit')
}
```

### 4. **Set Up Appropriate Notification Rules**
- High risk: Immediate alerts via email + Slack
- Medium risk: Daily digest via email
- Low risk: Weekly reports only

---

## Troubleshooting

### Sidebar Not Showing
- Check if browser width > 768px (responsive breakpoint)
- Verify `<AppSidebar isOpen={true} />` in layout

### Notifications Not Appearing
- Verify notification rules are enabled
- Check email/webhook configuration
- Review notification service logs

### Slow Dashboard Load
- Clear browser cache
- Check Data Service cache TTL settings
- Optimize check history size

### API Rate Limiting
- Review API usage in Settings
- Upgrade plan for higher limits
- Use batch processing for bulk operations

---

## File Structure

```
/vercel/share/v0-project/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx              # Main dashboard
│   │   ├── analytics/
│   │   ├── reports/
│   │   ├── settings/
│   │   └── help/
│   └── layout.tsx                 # App layout with new components
├── components/
│   ├── app-header.tsx             # Top navigation
│   ├── app-sidebar.tsx            # Left navigation
│   ├── app-breadcrumbs.tsx        # Breadcrumb navigation
│   ├── floating-action-bar.tsx    # Quick actions FAB
│   ├── dashboard-overview.tsx     # Overview metrics
│   ├── report-templates.tsx       # Report builder
│   └── ...
├── lib/
│   └── services/
│       ├── data-service.ts        # Data caching & aggregation
│       ├── api-client.ts          # HTTP client with retries
│       └── notification-service.ts # Alert management
├── PROFESSIONAL_PLATFORM_GUIDE.md # Detailed documentation
└── QUICK_START.md                 # This file
```

---

## Next Steps

1. **Customize Branding**: Update colors and logo in sidebar
2. **Set Up Notifications**: Configure email/Slack alerts in Settings
3. **Create Reports**: Use Report templates for your analysis
4. **Monitor Analytics**: Track threat trends in Analytics tab
5. **Integrate APIs**: Connect external threat feeds via API

---

## Support

- **Documentation**: See `PROFESSIONAL_PLATFORM_GUIDE.md`
- **FAQ**: Go to Settings → Help & Support
- **API Integration**: Check `API_INTEGRATION_GUIDE.md`
- **Add New Sources**: Follow `ADD_NEW_SOURCE_EXAMPLE.md`

---

## Version

**SecCheck v1.0** - Professional Threat Intelligence Platform
March 26, 2025
