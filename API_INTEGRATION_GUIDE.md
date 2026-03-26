# Real API Integration Guide for Threat Intelligence Checker

This guide explains how to integrate real API endpoints from threat intelligence platforms and add new sources to the application.

## Current Architecture

The app uses a modular approach:
- **`lib/threat-checker.ts`** - Core logic with source definitions and check functions
- **`lib/types.ts`** - TypeScript interfaces for reports and results
- **`app/api/check-ip/route.ts`** - API endpoint that calls the threat checker functions
- **Components** - Display results from the threat checker

Currently, the app returns mock data and direct platform links. To integrate real APIs, you'll need to:

1. Get API keys from threat intelligence platforms
2. Create integration modules for each API
3. Update the check functions to call real APIs instead of returning mock data
4. Add error handling and rate limiting

## Step 1: Set Up Environment Variables

Add your API keys to `.env.local`:

```env
# IP & Domain Intelligence
VIRUSTOTAL_API_KEY=your_api_key_here
ABUSEIPDB_API_KEY=your_api_key_here
GREYNOISE_API_KEY=your_api_key_here
IPQS_API_KEY=your_api_key_here
SHODAN_API_KEY=your_api_key_here
IPINFO_API_KEY=your_api_key_here
PULSEDIVE_API_KEY=your_api_key_here

# Malware Analysis
HYBRID_ANALYSIS_API_KEY=your_api_key_here
INTEZER_API_KEY=your_api_key_here

# Additional
CENSYS_UID=your_uid
CENSYS_SECRET=your_secret
```

## Step 2: Create Integration Modules

Create individual API integration files for each platform:

### Example: VirusTotal Integration (`lib/integrations/virustotal.ts`)

```typescript
interface VTIPResponse {
  data: {
    id: string;
    attributes: {
      last_dns_records?: Array<{ type: string; value: string }>;
      last_https_certificate?: { issuer?: string };
      last_analysis_stats: {
        malicious: number;
        suspicious: number;
        undetected: number;
        harmless: number;
      };
      last_analysis_results: Record<string, { category: string; engine_name: string }>;
    };
  };
}

export async function checkIPWithVirusTotal(ip: string): Promise<{
  malicious: number;
  suspicious: number;
  harmless: number;
  undetected: number;
  lastAnalysis: string;
}> {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  
  if (!apiKey) {
    throw new Error('VirusTotal API key not configured');
  }

  try {
    const response = await fetch(`https://www.virustotal.com/api/v3/ip_addresses/${ip}`, {
      headers: {
        'x-apikey': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`VirusTotal API error: ${response.status}`);
    }

    const data: VTIPResponse = await response.json();
    const stats = data.data.attributes.last_analysis_stats;

    return {
      malicious: stats.malicious,
      suspicious: stats.suspicious,
      harmless: stats.harmless,
      undetected: stats.undetected,
      lastAnalysis: new Date().toISOString(),
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error('Unknown VirusTotal API error');
  }
}

export async function checkURLWithVirusTotal(url: string): Promise<{
  malicious: number;
  suspicious: number;
  harmless: number;
  enginesDetected: number;
  lastAnalysis: string;
}> {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  
  if (!apiKey) {
    throw new Error('VirusTotal API key not configured');
  }

  try {
    // URL encoding for VirusTotal
    const urlId = Buffer.from(url).toString('base64').replace(/=/g, '');

    const response = await fetch(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
      headers: {
        'x-apikey': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`VirusTotal API error: ${response.status}`);
    }

    const data: VTIPResponse = await response.json();
    const stats = data.data.attributes.last_analysis_stats;

    return {
      malicious: stats.malicious,
      suspicious: stats.suspicious,
      harmless: stats.harmless,
      enginesDetected: stats.malicious + stats.suspicious,
      lastAnalysis: new Date().toISOString(),
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error('Unknown VirusTotal API error');
  }
}
```

### Example: AbuseIPDB Integration (`lib/integrations/abuseipdb.ts`)

```typescript
interface AbuseIPDBResponse {
  data: {
    ipAddress: string;
    abuseConfidenceScore: number;
    countryCode: string;
    usageType: string;
    isp: string;
    domain: string;
    totalReports: number;
    lastReportedAt: string | null;
  };
}

export async function checkIPWithAbuseIPDB(ip: string): Promise<{
  abuseScore: number;
  totalReports: number;
  lastReported: string | null;
  isp: string;
  domain: string;
}> {
  const apiKey = process.env.ABUSEIPDB_API_KEY;
  
  if (!apiKey) {
    throw new Error('AbuseIPDB API key not configured');
  }

  try {
    const response = await fetch('https://api.abuseipdb.com/api/v2/check', {
      method: 'GET',
      headers: {
        'Key': apiKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`AbuseIPDB API error: ${response.status}`);
    }

    const data: AbuseIPDBResponse = await response.json();
    const { data: abuseData } = data;

    return {
      abuseScore: abuseData.abuseConfidenceScore,
      totalReports: abuseData.totalReports,
      lastReported: abuseData.lastReportedAt,
      isp: abuseData.isp,
      domain: abuseData.domain,
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error('Unknown AbuseIPDB API error');
  }
}
```

## Step 3: Update the Threat Checker

Modify `lib/threat-checker.ts` to use real APIs:

```typescript
import { checkIPWithVirusTotal } from './integrations/virustotal';
import { checkIPWithAbuseIPDB } from './integrations/abuseipdb';

export async function checkIP(ip: string): Promise<IPReport> {
  if (!isValidIP(ip)) {
    throw new Error('Invalid IP address format');
  }

  const results: ThreatIntelligenceResult[] = [];

  // Try VirusTotal
  try {
    const vtData = await checkIPWithVirusTotal(ip);
    results.push({
      source: 'Virus Total',
      status: 'success',
      data: vtData,
      timestamp: Date.now(),
    });
  } catch (error) {
    results.push({
      source: 'Virus Total',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now(),
    });
  }

  // Try AbuseIPDB
  try {
    const abuseData = await checkIPWithAbuseIPDB(ip);
    results.push({
      source: 'AbuseIPDB',
      status: 'success',
      data: abuseData,
      timestamp: Date.now(),
    });
  } catch (error) {
    results.push({
      source: 'AbuseIPDB',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now(),
    });
  }

  // ... Continue for other APIs

  const { score, level } = calculateRiskScore(results);

  return {
    ip,
    timestamp: Date.now(),
    results,
    riskScore: score,
    riskLevel: level,
    type: 'ip',
  };
}

// Update risk calculation to use real data
function calculateRiskScore(resultsData: ThreatIntelligenceResult[]): { score: number; level: 'safe' | 'suspicious' | 'malicious' } {
  const successResults = resultsData.filter(r => r.status === 'success');
  
  if (successResults.length === 0) {
    return { score: 0, level: 'safe' };
  }

  let totalScore = 0;

  successResults.forEach(result => {
    if (result.data) {
      // Normalize different scoring systems to 0-100
      if (result.data.abuseScore !== undefined) {
        totalScore += result.data.abuseScore; // AbuseIPDB: 0-100
      } else if (result.data.malicious !== undefined) {
        // VirusTotal: count of engines
        const detections = result.data.malicious + result.data.suspicious;
        totalScore += Math.min(detections * 5, 100); // Scale to 0-100
      }
    }
  });

  const score = Math.round(totalScore / successResults.length);
  
  let level: 'safe' | 'suspicious' | 'malicious' = 'safe';
  if (score > 70) level = 'malicious';
  else if (score > 40) level = 'suspicious';
  
  return { score, level };
}
```

## Step 4: Add a New Source

To add a new threat intelligence source:

### 1. Update the Source List

In `lib/threat-checker.ts`, add to the appropriate source array:

```typescript
const IP_THREAT_SOURCES = [
  // ... existing sources
  { 
    name: 'MaxMind', 
    id: 'maxmind', 
    url: 'https://www.maxmind.com/en/geoip2-city' 
  },
];
```

### 2. Create Integration Module (`lib/integrations/maxmind.ts`)

```typescript
export async function checkIPWithMaxMind(ip: string): Promise<{
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  isp: string;
}> {
  const apiKey = process.env.MAXMIND_LICENSE_KEY;
  
  if (!apiKey) {
    throw new Error('MaxMind API key not configured');
  }

  try {
    const response = await fetch(
      `https://geoip.maxmind.com/geoip/v2.1/city/${ip}`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`0:${apiKey}`).toString('base64')}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`MaxMind API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      city: data.city?.names?.en || 'Unknown',
      country: data.country?.iso_code || 'Unknown',
      latitude: data.location?.latitude || 0,
      longitude: data.location?.longitude || 0,
      isp: data.traits?.isp || 'Unknown',
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error('Unknown MaxMind API error');
  }
}
```

### 3. Update Threat Checker to Call New Source

```typescript
// In checkIP function
try {
  const maxmindData = await checkIPWithMaxMind(ip);
  results.push({
    source: 'MaxMind',
    status: 'success',
    data: maxmindData,
    timestamp: Date.now(),
  });
} catch (error) {
  results.push({
    source: 'MaxMind',
    status: 'error',
    error: error instanceof Error ? error.message : 'Unknown error',
    timestamp: Date.now(),
  });
}
```

## Step 5: Handle Rate Limiting (Optional but Recommended)

Create a rate limiter utility (`lib/rate-limiter.ts`):

```typescript
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // milliseconds
}

export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(
      time => now - time < this.config.windowMs
    );

    if (validRequests.length >= this.config.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
}

// Usage in API route
const limiter = new RateLimiter({ maxRequests: 10, windowMs: 60000 }); // 10 requests per minute

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  if (!limiter.isAllowed(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  // ... rest of the API logic
}
```

## Recommended Free & Freemium APIs

| Platform | Type | Free Tier | Rate Limit |
|----------|------|-----------|-----------|
| VirusTotal | IP/URL/Hash | 4 requests/min | 500 requests/day |
| AbuseIPDB | IP | 1000 requests/day | Limited free tier |
| Shodan | IP/Domain | Very limited | 1-100 queries/month |
| URLScan | URL | 100 requests/day | Generous free tier |
| GreyNoise | IP | 500 requests/day | Community tier available |
| Pulsedive | IP/URL/Hash | Free | 5 requests/second |
| IPinfo | IP | 50k requests/month | Free account |

## Testing Your Integration

```typescript
// In your API route or test file
const report = await checkIP('8.8.8.8');
console.log(report);
```

## Error Handling Best Practices

Always wrap API calls with try-catch and provide fallback behavior:

```typescript
try {
  // API call
} catch (error) {
  // Return graceful error
  results.push({
    source: 'Platform Name',
    status: 'error',
    error: `API unavailable: ${error.message}`,
    timestamp: Date.now(),
  });
}
```

## Next Steps

1. Choose which platforms to integrate with first
2. Get API keys from their websites
3. Create integration modules following the examples above
4. Update the threat checker to use real APIs
5. Add comprehensive error handling
6. Implement rate limiting for production
7. Test thoroughly with different inputs
