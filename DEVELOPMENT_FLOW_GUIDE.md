# Threat Intelligence Platform - Complete Development Flow Guide

## Quick Overview
This is a **Next.js 16 + React 19** enterprise threat intelligence platform that checks IPs, URLs, malware, and cyber threats. It uses TypeScript and Tailwind CSS with a modular architecture.

---

## Phase 1: Application Entry Point & Layout (Start Here!)

### 1. **Root Layout** (`app/layout.tsx`)
**Purpose:** Wraps entire application with global configuration

```
What it does:
- Sets up metadata (title, description, icons)
- Initializes ThemeProvider for dark/light mode
- Renders header, sidebar, breadcrumbs, footer
- Wraps main content with flex layout (sidebar on left, content on right)
- Adds Vercel Analytics
```

**Structure:**
```
RootLayout
├── AppHeader          (top navigation bar)
├── AppSidebar         (left navigation - 64px wide on desktop)
├── Breadcrumbs        (navigation trail)
├── Main Content       (flex-1 to fill space)
├── Footer             (bottom)
└── FloatingActionBar  (fixed action button)
```

### 2. **Root Page** (`app/page.tsx`)
**Purpose:** Landing page that auto-redirects to dashboard

```typescript
- User lands on "/" 
- useEffect hook redirects to "/dashboard"
- Shows loading message while redirecting
```

**Why:** Forces authenticated flow - users always go to dashboard first

---

## Phase 2: Authentication Flow

### 3. **Auth Pages**
Location: `app/auth/login/page.tsx` and `app/auth/register/page.tsx`

**How authentication works:**
```
1. User registers with email/password in lib/auth.ts
2. Password is hashed (simple hash for demo, use bcrypt in production)
3. User data stored in localStorage with auth token
4. Token expires after 7 days
5. On login, token is validated before access to dashboard
```

**Key Functions in `lib/auth.ts`:**
- `registerUser(email, password)` - Creates new account
- `loginUser(email, password)` - Validates credentials
- `getCurrentUser()` - Gets logged-in user
- `isAuthenticated()` - Checks if user is logged in
- `logoutUser()` - Clears session

**ProtectedRoute Component** (`components/protected-route.tsx`)
```typescript
- Wraps dashboard pages
- Checks if user is authenticated
- Redirects to login if not authenticated
- Prevents unauthorized access
```

---

## Phase 3: Dashboard Core Architecture

### 4. **Dashboard Main Page** (`app/dashboard/page.tsx`)

**Entry Point for Most Features**

```
This is the CORE of the application. It contains:

1. Header with title and description
2. Tabbed interface with 5 tabs:
   - IP Check (tab 1)
   - URL Check (tab 2)
   - Malware Analysis (tab 3)
   - Cyber Threat Check (tab 4)
   - History (tab 5)

3. State Management:
   - currentReport: stores latest check result
   - history: array of all previous checks
   - userSettings: preferences (API keys, etc.)

4. Main Flow:
   User Input (IP/URL/Hash) 
   → Checker Component
   → API Call (lib/threat-checker.ts)
   → Generate Report
   → Store in History
   → Display ThreatReport Component
```

**Key State & Functions:**
```typescript
const [currentReport, setCurrentReport] = useState<ThreatReport | null>(null);
const [history, setHistory] = useState<CheckHistory[]>([]);

// Called when user submits a check
const handleReportGenerated = (report: ThreatReport) => {
  setCurrentReport(report);
  // Adds to history
  // Exports to PDF/Excel
}

// Called when user clicks delete in history
const handleDeleteHistory = (id: string) => {
  // Removes from history array
}
```

---

## Phase 4: Threat Checking Components

### 5. **Four Checker Components** (Data Input Layer)

#### A. **IP Checker** (`components/ip-checker.tsx`)
```
User Input:
- Form field for IP address
- Validation: ensures valid IP format
- Submit button

On Submit:
1. Validates IP (regex check)
2. Calls checkThreatIntelligence('ip', ipAddress)
3. Generates IPReport with:
   - IP address
   - Risk score (0-100)
   - Risk level (safe/suspicious/malicious)
   - Results from multiple sources
4. Returns via onReportGenerated callback
```

#### B. **URL Checker** (`components/url-checker.tsx`)
```
User Input:
- Form field for URL
- Validation: URL format check
- Submit button

On Submit:
1. Validates URL format
2. Calls checkThreatIntelligence('url', url)
3. Generates URLReport
4. Returns via callback
```

#### C. **Malware Checker** (`components/malware-checker.tsx`)
```
User Input:
- Form field for file hash (MD5, SHA1, SHA256)
- Validation: hash format

On Submit:
1. Detects hash type
2. Calls checkThreatIntelligence('malware', hash)
3. Generates MalwareReport
4. Returns via callback
```

#### D. **Cyber Threat Checker** (`components/cyber-threat-checker.tsx`)
```
User Input:
- Form field for threat indicator
- Type selector (hash/ip/domain/cve/other)

On Submit:
1. Validates indicator format
2. Calls checkThreatIntelligence('cyber-threat', indicator)
3. Generates CyberThreatReport
4. Returns via callback
```

---

## Phase 5: Core Threat Analysis Engine

### 6. **Threat Checker Library** (`lib/threat-checker.ts`)

**Main Function:**
```typescript
async function checkThreatIntelligence(
  type: 'ip' | 'url' | 'malware' | 'cyber-threat',
  query: string
): Promise<ThreatReport>
```

**What Happens Inside:**
```
1. Determines which threat sources to use based on type
2. For each threat source:
   a. Calls getThreatData(source, query)
   b. Awaits response
   c. Stores result with status (success/error/pending)
3. Aggregates all results
4. Calculates risk score:
   - Counts malicious sources
   - Calculates percentage: (malicious / total) * 100
5. Determines risk level:
   - 0-33: Safe
   - 34-66: Suspicious  
   - 67-100: Malicious
6. Returns complete report
```

**Threat Sources Configuration:**
```
IP_THREAT_SOURCES = [
  - VirusTotal, AbuseIPDB, GreyNoise, Shodan, Censys, etc.
  - Each has: name, id, url for linking
]

URL_THREAT_SOURCES = [
  - VirusTotal, URLhaus, URLScan, Sucuri, etc.
]

MALWARE_THREAT_SOURCES = [
  - VirusTotal, Alien Vault, ThreatFox, etc.
]

CYBER_THREAT_SOURCES = [
  - Similar sources, supports CVE lookup
]
```

**Mock Data Function:**
```typescript
function getThreatData(sourceId: string, query: string) {
  // Currently returns mock data
  // To integrate real API:
  // 1. Replace with actual API calls
  // 2. Add error handling
  // 3. Implement rate limiting
  // 4. Cache results
}
```

---

## Phase 6: Report Generation & Display

### 7. **Threat Report Component** (`components/threat-report.tsx`)

**Receives:**
```typescript
interface Props {
  report: ThreatReport;  // IP, URL, Malware, or CyberThreat
  onExport: (format: 'pdf' | 'excel') => void;
}
```

**Displays:**
```
- Report header with query and risk badge
- Risk score large display (0-100)
- Detailed findings table:
  - Source name
  - Detection status
  - Severity
  - Additional details
- Action buttons:
  - Export as PDF
  - Export as Excel
  - View source links
```

**Visual Indicators:**
```
Risk Level Colors:
- Safe: Green
- Suspicious: Orange/Yellow
- Malicious: Red

Risk Score Progress Bar:
- Visual representation of 0-100 scale
```

---

## Phase 7: Data Persistence & History

### 8. **History Tab & Management**

**How History Works:**
```
1. Each check generates CheckHistory record:
   {
     id: unique UUID
     query: "192.168.1.1" or "example.com"
     type: "ip" | "url" | "malware" | "cyber-threat"
     timestamp: Date.now()
     riskScore: 45
     riskLevel: "suspicious"
   }

2. Stored in state in dashboard page
3. User can:
   - View organized by type (IP/URL/Malware/Threat)
   - Delete individual entries
   - Export all as PDF
   - Export all as Excel
```

**Export Functions:**
```typescript
// lib/export-pdf.ts
- Generates PDF with history
- Uses jsPDF library
- Styled report format

// lib/export-excel.ts
- Generates Excel spreadsheet
- Uses xlsx library
- Columns: Query, Type, Time, Risk Score, Level
```

---

## Phase 8: Sub-pages (Dashboard Routes)

### 9. **Dashboard Sub-pages**

#### A. **Analytics** (`app/dashboard/analytics/page.tsx`)
```
Charts showing:
- Check frequency over time (line chart)
- Risk distribution (bar chart)
- IP vs URL vs Malware checks (pie chart)
- Trend analysis

Uses: Recharts library
- Dynamic import to avoid SSR issues
- Responsive container
```

#### B. **Reports** (`app/dashboard/reports/page.tsx`)
```
Saved reports library:
- View past detailed reports
- Filter by type
- Download previously exported files
- Search by query
```

#### C. **Settings** (`app/dashboard/settings/page.tsx`)
```
User configuration:
- API keys input (VirusTotal, AbuseIPDB, etc.)
- Display preferences (theme, language)
- Notification settings
- Export format preferences
```

#### D. **Help** (`app/dashboard/help/page.tsx`)
```
Documentation:
- How to check IPs
- How to check URLs
- Threat source information
- API integration guides
```

---

## Phase 9: API Integration Layer

### 10. **Real API Integration Structure**

**API Routes** (`app/api/check-ip/route.ts`, etc.)
```
Next.js API routes that:
1. Receive query from frontend
2. Call actual threat intelligence APIs
3. Handle authentication/API keys
4. Implement rate limiting
5. Cache results
6. Return standardized response

Example:
POST /api/check-ip
{
  "ip": "192.168.1.1"
}

Returns:
{
  "riskScore": 45,
  "riskLevel": "suspicious",
  "results": [...]
}
```

**Integration Services** (`lib/integrations/`)
```
virusotal.ts:
- Wraps VirusTotal API
- Handles authentication
- Parses responses
- Error handling

abuseipdb.ts:
- Wraps AbuseIPDB API
- Rate limiting logic
- Response caching
```

**API Client** (`lib/services/api-client.ts`)
```
Unified HTTP client:
- Handles all API requests
- Manages headers
- Retries on failure
- Timeout handling
```

---

## Phase 10: UI Components & Styling

### 11. **Component Hierarchy**

**Layout Components:**
```
app-header.tsx:
- Top navigation bar
- Logo and title
- User menu

app-sidebar.tsx:
- Navigation menu
- Dashboard, Analytics, Reports, Settings, Help
- Authentication status

app-breadcrumbs.tsx:
- Shows navigation path
- Helps users understand location

footer.tsx:
- Copyright info
- Links
```

**Utility Components:**
```
components/ui/:
- 50+ shadcn/ui components (Button, Card, Input, etc.)
- Pre-styled with Tailwind CSS
- Accessible (ARIA labels, keyboard nav)

theme-provider.tsx:
- Handles dark/light mode
- Uses next-themes
```

**Feature Components:**
```
dashboard-header.tsx:
- Title and description for dashboard
- Stats overview

dashboard-overview.tsx:
- Quick stats cards
- Recent activity summary

threat-sources-info.tsx:
- Information about threat sources
- Links and descriptions

result-modal.tsx:
- Modal for displaying detailed results
```

---

## Phase 11: Type System

### 12. **TypeScript Interfaces** (`lib/types.ts`)

```typescript
// Report types
IPReport {
  ip: string
  results: ThreatIntelligenceResult[]
  riskScore: 0-100
  riskLevel: 'safe' | 'suspicious' | 'malicious'
  type: 'ip'
}

URLReport {
  url: string
  results: ThreatIntelligenceResult[]
  riskScore: 0-100
  riskLevel: 'safe' | 'suspicious' | 'malicious'
  type: 'url'
}

// And similar for MalwareReport, CyberThreatReport

// Result from single source
ThreatIntelligenceResult {
  source: string
  status: 'success' | 'error' | 'pending'
  data?: any
  error?: string
  url?: string
  timestamp: number
}

// History entry
CheckHistory {
  id: string
  query: string
  type: 'ip' | 'url' | 'malware' | 'cyber-threat'
  timestamp: number
  riskScore: number
  riskLevel: 'safe' | 'suspicious' | 'malicious'
}
```

---

## Phase 12: Styling & Design System

### 13. **Global Styles** (`app/globals.css`)

```css
/* Tailwind CSS with custom tokens */
:root {
  --background: /* light mode background */
  --foreground: /* light mode text */
  --card: /* card background */
  --card-foreground: /* card text */
  --primary: /* brand color */
  --secondary: /* accent color */
  --muted: /* subtle text */
  --border: /* border color */
  --radius: /* border radius */
}

@media (prefers-color-scheme: dark) {
  :root {
    /* dark mode overrides */
  }
}
```

**Design System:**
```
Colors:
- Primary: Blue/Brand color
- Secondary: Gray shades (for neutrals)
- Status: Green (safe), Orange (suspicious), Red (malicious)

Typography:
- Headings: Geist font
- Body: Geist font
- Code: Geist Mono

Spacing:
- Uses Tailwind scale (4px, 8px, 12px, 16px, etc.)
- Uses gap classes for flexible layouts
```

---

## Complete Data Flow Diagram

```
USER INTERACTION
    ↓
IP/URL/Malware/CyberThreat Input Form
    ↓
Validation (format check)
    ↓
checkThreatIntelligence() [lib/threat-checker.ts]
    ↓
getThreatData() for each source
    ↓
Aggregate Results
    ↓
Calculate Risk Score & Level
    ↓
Return Report (IPReport | URLReport | MalwareReport | CyberThreatReport)
    ↓
Update State (currentReport, history)
    ↓
ThreatReport Component renders
    ↓
User can:
  - View details
  - Export to PDF/Excel
  - View source links
  - Check history
  - Delete history entries
```

---

## How to Add a New Feature

### Example: Adding a New Threat Source

1. **Update threat sources list** in `lib/threat-checker.ts`:
```typescript
const IP_THREAT_SOURCES = [
  // existing sources...
  { name: 'New Source', id: 'newsource', url: 'https://...' }
]
```

2. **Add API integration** in `lib/integrations/newsource.ts`:
```typescript
export async function checkNewSource(query: string) {
  // Call API
  // Return standardized result
}
```

3. **Update threat-checker** to use new source:
```typescript
const results = await Promise.all([
  getThreatData('virustotal', query),
  getThreatData('newsource', query), // Add this
  // ...
])
```

### Example: Adding a New Dashboard Page

1. **Create file** `app/dashboard/newpage/page.tsx`
2. **Wrap with ProtectedRoute** for auth
3. **Add to sidebar** in `components/app-sidebar.tsx`
4. **Import any needed components**

---

## Development Checklist

- [ ] Understand layout structure (app/layout.tsx)
- [ ] Review authentication flow (lib/auth.ts)
- [ ] Study dashboard main page (app/dashboard/page.tsx)
- [ ] Understand checker components (IP/URL/Malware/Cyber)
- [ ] Review threat-checker core logic (lib/threat-checker.ts)
- [ ] Check threat report display (components/threat-report.tsx)
- [ ] Review history & export functions
- [ ] Check sub-pages (Analytics, Reports, Settings, Help)
- [ ] Understand type system (lib/types.ts)
- [ ] Review styling and design tokens

---

## Next Steps

1. **Run locally**: `pnpm dev` → http://localhost:3000
2. **Register account**: Use auth pages to create user
3. **Try features**: Check an IP, URL, or hash
4. **Explore code**: Follow data flow from input to display
5. **Integrate real APIs**: Replace mock data in threat-checker.ts
6. **Add features**: Follow the framework established

