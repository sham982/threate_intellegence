# SecCheck - Professional Threat Intelligence Platform

## Overview

SecCheck is an enterprise-grade threat intelligence platform designed for security teams, analysts, and organizations. This guide covers all professional features and implementation details.

---

## Phase 1: Navigation & Layout Foundation ✅

### Components Implemented

#### 1. **AppHeader** (`components/app-header.tsx`)
- Sticky top navigation with global search
- Real-time notification center with unread counts
- User menu with quick actions
- Bell icon with notification badge
- Search functionality across platform

**Features:**
- Persistent header with backdrop blur effect
- Mobile responsive menu toggle
- Dropdown user menu with profile, settings, logout
- Notification popover with 3 sample notifications
- Mark all as read functionality

#### 2. **AppSidebar** (`components/app-sidebar.tsx`)
- Fixed left sidebar (hidden on mobile, visible on desktop)
- Navigation organized into 4 sections:
  - Main (Overview, Analytics)
  - Threat Analysis (IP, URL, Malware, Cyber Threats)
  - Reports & Data
  - Configuration (Settings, Help)
- Active link highlighting
- API usage indicator at bottom
- Collapsible sections for mobile

**Key Features:**
- Logo section with SecCheck branding
- Active state styling with accent color
- Badge support for notifications (e.g., "2 new")
- API usage progress bar showing quota consumption
- Responsive transitions

#### 3. **AppBreadcrumbs** (`components/app-breadcrumbs.tsx`)
- Dynamic breadcrumb navigation
- Tab-aware breadcrumbs (shows current tab)
- Clickable navigation to parent pages
- Sticky position below header

#### 4. **FloatingActionBar** (`components/floating-action-bar.tsx`)
- Expandable floating action button (FAB)
- Quick access to:
  - New Check
  - Bulk Upload
  - Generate Report
- Expandable secondary actions
- Bottom-right positioning

#### 5. **DashboardOverview** (`components/dashboard-overview.tsx`)
- Key metrics cards (Total Checks, Threats Detected, Detection Rate, API Usage)
- Weekly activity bar chart
- Risk distribution pie chart (donut style)
- Recent checks list with risk badges
- Responsive grid layout

---

## Phase 2: Analytics & Reporting Dashboard ✅

### New Pages

#### 1. **Analytics Page** (`app/dashboard/analytics/page.tsx`)
**Visualizations:**
- Monthly trends (area chart with checks and threats)
- Risk score distribution (bar chart)
- Top threat categories (progress bars)
- API usage over time (line chart)

**Controls:**
- Date range selector (Last 7/30/90 days, Custom)
- Multiple chart types and metrics

#### 2. **Reports Page** (`app/dashboard/reports/page.tsx`)
**Features:**
- Browse report list with filtering
- Report metadata: type, size, threat count, creation date
- Quick actions: View, Download, Share, Delete
- Report status indicators (Ready, Archived)

#### 3. **Settings Page** (`app/dashboard/settings/page.tsx`)
**Sections:**
- API Keys (with regenerate button)
- Notifications (Email, Slack, Webhooks)
- Security (2FA, password change, login history)
- Data Management (retention policy, export, delete)
- Team Management (invite members, role assignment)

#### 4. **Help Page** (`app/dashboard/help/page.tsx`)
**Content:**
- 6 FAQ items covering common questions
- Quick support options (Live chat, Email, Docs)
- Help article search
- Resource library with icons

### Report Templates Component

**File:** `components/report-templates.tsx`

**Report Types:**
1. **Executive Summary**
   - Target: C-Level, Management
   - Sections: Summary, Key Threats, Risk Assessment, Recommendations

2. **Technical Analysis**
   - Target: Security Analysts, Engineers
   - Sections: Findings, Data Analysis, Source Details, Technical Indicators

3. **Comprehensive**
   - Target: All Stakeholders
   - Sections: Full analysis with all details

4. **Custom**
   - Build your own with selected sections

**Features:**
- Template selection cards
- Report builder with 3 tabs (Sections, Customization, Preview)
- Customizable title, organization, and format (PDF/HTML/DOCX)
- Live preview

---

## Phase 3: Enterprise Features & Services

### Data Service (`lib/services/data-service.ts`)

**Capabilities:**
- **Caching with TTL**: Get/set data with automatic expiration
- **Data Aggregation**: Generate statistics from check history
- **Persistence**: localStorage integration for offline support
- **Filtering**: Filter checks by type, risk level, date range
- **Batch Processing**: Handle large datasets with rate limiting

**Methods:**
```typescript
dataService.get(key)                          // Get cached data
dataService.set(key, value, ttl)              // Cache with TTL
dataService.aggregateCheckHistory(checks)     // Generate stats
dataService.filterChecks(checks, criteria)    // Filter by criteria
dataService.batchProcess(items, processor)    // Batch operations
```

### API Client Service (`lib/services/api-client.ts`)

**Features:**
- **Automatic Retry Logic**: Exponential backoff up to 3 retries
- **Rate Limiting**: Track and prevent API quota violations
- **Timeout Handling**: Configurable request timeout (default 10s)
- **Error Handling**: Comprehensive error responses
- **Request Methods**: GET, POST, PUT, DELETE with typed responses

**Usage:**
```typescript
const { data, error } = await apiClient.get<T>('/endpoint')
const { data, error } = await apiClient.post<T>('/endpoint', body)
const status = apiClient.getRateLimitStatus('/endpoint')
```

### Notification Service (`lib/services/notification-service.ts`)

**Core Features:**
- **Notification Rules**: Create rules with conditions and channels
- **Alert Generation**: Automatic alerts based on rule evaluation
- **Multi-Channel Support**: Email, Slack, Webhooks, SMS
- **Alert Tracking**: Persistent alert history with status

**Notification Channels:**
1. **Email**: Send alerts to email addresses
2. **Slack**: Post to Slack channels via webhooks
3. **Webhooks**: Custom HTTP POST webhooks
4. **SMS**: Text message alerts (Twilio, AWS SNS)

**Example Rule Creation:**
```typescript
notificationService.setRule({
  id: 'rule_1',
  name: 'High Risk Alerts',
  enabled: true,
  condition: {
    riskLevel: 'high',
    minRiskScore: 75,
    checkTypes: ['ip', 'url']
  },
  channels: [
    {
      type: 'email',
      config: { email: 'team@example.com' },
      enabled: true
    },
    {
      type: 'slack',
      config: { webhookUrl: 'https://hooks.slack.com/...' },
      enabled: true
    }
  ]
})
```

---

## Architecture & Best Practices

### Layout Structure
- **Header**: Fixed top navigation (height: 56px / 3.5rem)
- **Sidebar**: Fixed left (width: 256px / 16rem) on desktop, hidden on mobile
- **Main Content**: Full-width with left margin on desktop
- **Breadcrumbs**: Sticky below header
- **Floating Actions**: Fixed bottom-right with z-index management

### Navigation Flow
```
AppHeader (global search, notifications, user menu)
    ↓
AppSidebar (main navigation)
    ↓
AppBreadcrumbs (contextual navigation)
    ↓
Tab Navigation (within pages)
    ↓
Main Content Area
    ↓
Footer
```

### Data Flow
```
User Action → Dashboard/Component → Data Service → API Client → Backend
                    ↓
              Local Cache (TTL)
                    ↓
              Notification Service (rules evaluation)
```

---

## Styling & Theme

### Color Scheme
- **Primary**: #8cbdb9 (teal accent)
- **Background**: #ffffff (light), #1a1f26 (dark)
- **Sidebar**: #2d3e4e (dark blue-gray)
- **Risk Colors**: 
  - High: #ef4444 (red)
  - Medium: #f59e0b (amber)
  - Low: #f97316 (orange)
  - Safe: #22c55e (green)

### Design Tokens
- **Border Radius**: 10px (0.625rem)
- **Spacing**: 4px increments (Tailwind scale)
- **Typography**: Geist (sans), Geist Mono (monospace)

---

## Integration Points

### API Endpoints (Planned)
```
GET  /api/dashboard/analytics     → Analytics data
GET  /api/reports                 → List reports
POST /api/reports                 → Generate report
GET  /api/notifications/rules     → List rules
POST /api/notifications/rules     → Create rule
POST /api/webhooks/{id}           → Webhook endpoint
GET  /api/settings/api-keys       → API key management
```

### Notification Webhooks
Example payload sent to configured webhooks:
```json
{
  "event": "threat_alert",
  "rule": "High Risk Alerts",
  "alert": {
    "id": "alert_1234567890",
    "type": "ip",
    "query": "203.45.67.89",
    "riskScore": 85,
    "riskLevel": "high",
    "timestamp": "2025-03-26T10:30:00Z"
  }
}
```

---

## Performance Optimizations

### Implemented
- Code splitting with dynamic imports
- Local caching with TTL to reduce API calls
- Batch processing for bulk operations
- Lazy loading of components
- Responsive images and assets

### Planned (Phase 4)
- Virtual scrolling for large lists
- Image optimization and lazy loading
- CSS-in-JS code splitting
- Service Worker for offline support
- Compression and minification

---

## Security Considerations

### Current Implementation
- HTTPS-only API communication
- Input validation on forms
- XSS protection via React's built-in escaping
- CSRF tokens for state-changing operations

### Recommended Additions
- API key rotation mechanism
- Rate limiting on backend
- Two-factor authentication
- Audit logging for all actions
- Data encryption at rest
- IP whitelisting for API keys

---

## Usage Examples

### Checking If High-Risk Threat Detected
```typescript
import { notificationService } from '@/lib/services/notification-service'

const check = { type: 'ip', query: '203.45.67.89', riskScore: 85, riskLevel: 'high' }
const matchingRules = notificationService.evaluateAlert(check)

for (const rule of matchingRules) {
  const alert = notificationService.createAlert(rule.id, check)
  for (const channel of rule.channels) {
    await notificationService.sendNotification(channel, alert, rule)
  }
}
```

### Aggregating Check Statistics
```typescript
import { dataService } from '@/lib/services/data-service'

const history = JSON.parse(localStorage.getItem('checkHistory') || '[]')
const stats = dataService.aggregateCheckHistory(history)

console.log(`Total Checks: ${stats.totalChecks}`)
console.log(`Threats: ${stats.threatsDetected}`)
console.log(`Avg Risk: ${stats.avgRiskScore.toFixed(1)}/100`)
```

### Using the API Client with Retry Logic
```typescript
import { apiClient } from '@/lib/services/api-client'

const { data, error } = await apiClient.get('/api/reports', {
  timeout: 15000,
  retries: 5,
})

if (error) {
  console.error('Failed to fetch reports:', error)
}
```

---

## Next Steps (Phase 4)

### Advanced Features
- [ ] Bulk CSV import/export
- [ ] Scheduled report generation
- [ ] Advanced filtering UI
- [ ] Custom dashboard widgets
- [ ] Real-time threat monitoring
- [ ] Team collaboration features
- [ ] Audit logs and compliance reporting

### Performance
- [ ] Database integration (Supabase, Neon)
- [ ] Redis caching layer
- [ ] Content delivery network (CDN)
- [ ] Background job processing
- [ ] Real-time websocket updates

### Integrations
- [ ] Slack bot for queries
- [ ] Microsoft Teams integration
- [ ] Jira/Linear issue creation
- [ ] Splunk/ELK integration
- [ ] SIEM platform connections

---

## Support & Documentation

- **Help Page**: `/dashboard/help` - FAQ, resources, contact
- **Settings**: `/dashboard/settings` - Configuration and management
- **API Docs**: (Planned) Comprehensive API documentation
- **Status Page**: (Planned) System status and incidents

---

## Version History

- **v1.0** - Initial release with Phase 1 & 2
- **v1.1** - Phase 3 enterprise features (services)
- **v2.0** - (Planned) Phase 4 advanced features

---

Last Updated: March 26, 2025
