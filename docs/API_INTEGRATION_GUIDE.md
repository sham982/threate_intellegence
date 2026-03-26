# Real API Integration Guide

This guide explains how to integrate real threat intelligence APIs into your application.

## Current Architecture

Your app currently uses **mock data** for demonstration purposes. The threat checking functions in `lib/threat-checker.ts` generate simulated responses. To use real APIs, you'll need to:

1. Get API keys from threat intelligence platforms
2. Integrate actual API calls into the checker functions
3. Handle rate limits and authentication
4. Store sensitive credentials in environment variables

## Recommended APIs by Category

### IP Reputation Checking
1. **VirusTotal** (Most Popular)
   - Free tier: 4 requests/minute
   - API: `https://www.virustotal.com/api/v3/ip_addresses/{ip}`
   - Get API key: https://virustotal.com/gui/home

2. **AbuseIPDB**
   - Free tier: 1500 requests/day
   - API: `https://api.abuseipdb.com/api/v2/check`
   - Get API key: https://www.abuseipdb.com/register

3. **IPQualityScore**
   - API: `https://api.ipqualityscore.com/api/json/ip/`
   - Get API key: https://www.ipqualityscore.com

### URL/Domain Analysis
1. **VirusTotal** (Recommended)
   - Same API key as IP checking
   - API: `https://www.virustotal.com/api/v3/urls`

2. **URLhaus**
   - Free, no authentication required
   - API: `https://urlhaus-api.abuse.ch/v1/url/`

3. **URLScan.io**
   - Free tier: 20,000 requests/month
   - API: `https://urlscan.io/api/v1/scan/`

### Malware/Hash Analysis
1. **VirusTotal**
   - API: `https://www.virustotal.com/api/v3/files/{hash}`

2. **Hybrid Analysis**
   - API: `https://www.hybrid-analysis.com/api/v2/search/hash`
   - Get API key: https://www.hybrid-analysis.com/

## Implementation Steps

### Step 1: Set Up Environment Variables

Create a `.env.local` file in your project root:

```env
# VirusTotal
VIRUSTOTAL_API_KEY=your_api_key_here

# AbuseIPDB
ABUSEIPDB_API_KEY=your_api_key_here

# URLScan
URLSCAN_API_KEY=your_api_key_here

# IPQualityScore
IPQS_API_KEY=your_api_key_here
```

### Step 2: Create API Client Library

Create `lib/api-clients.ts`:

```typescript
// VirusTotal Client
export async function checkVirusTotal(query: string, type: 'ip' | 'url' | 'hash') {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) throw new Error('VirusTotal API key not configured');

  const endpoints: Record<string, string> = {
    ip: `https://www.virustotal.com/api/v3/ip_addresses/${query}`,
    url: `https://www.virustotal.com/api/v3/urls/${Buffer.from(query).toString('base64').replace(/=/g, '')}`,
    hash: `https://www.virustotal.com/api/v3/files/${query}`,
  };

  const response = await fetch(endpoints[type], {
    headers: {
      'x-apikey': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`VirusTotal API error: ${response.statusText}`);
  }

  return response.json();
}

// AbuseIPDB Client
export async function checkAbuseIPDB(ip: string) {
  const apiKey = process.env.ABUSEIPDB_API_KEY;
  if (!apiKey) throw new Error('AbuseIPDB API key not configured');

  const response = await fetch('https://api.abuseipdb.com/api/v2/check', {
    method: 'POST',
    headers: {
      'Key': apiKey,
      'Accept': 'application/json',
    },
    body: new URLSearchParams({
      ipAddress: ip,
      maxAgeInDays: '90',
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`AbuseIPDB API error: ${response.statusText}`);
  }

  return response.json();
}

// URLhaus Client (No API key needed)
export async function checkURLhaus(url: string) {
  const response = await fetch('https://urlhaus-api.abuse.ch/v1/url/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      url: url,
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`URLhaus API error: ${response.statusText}`);
  }

  return response.json();
}
```

### Step 3: Update Threat Checker

Modify `lib/threat-checker.ts` to use real APIs:

```typescript
import { checkVirusTotal, checkAbuseIPDB, checkURLhaus } from './api-clients';

export async function checkIP(ip: string): Promise<IPReport> {
  if (!isValidIP(ip)) {
    throw new Error('Invalid IP address format');
  }

  const results: ThreatIntelligenceResult[] = [];

  try {
    // Check VirusTotal
    const vtResult = await checkVirusTotal(ip, 'ip');
    results.push({
      source: 'Virus Total',
      status: 'success',
      data: vtResult.data?.attributes || vtResult,
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

  try {
    // Check AbuseIPDB
    const abuseResult = await checkAbuseIPDB(ip);
    results.push({
      source: 'Abuse IPDB',
      status: 'success',
      data: abuseResult.data || abuseResult,
      timestamp: Date.now(),
    });
  } catch (error) {
    results.push({
      source: 'Abuse IPDB',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now(),
    });
  }

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
```

### Step 4: Handle Rate Limiting

Create `lib/rate-limiter.ts`:

```typescript
const requestCounts = new Map<string, { count: number; reset: number }>();

export function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const record = requestCounts.get(key);

  if (!record || now > record.reset) {
    requestCounts.set(key, { count: 1, reset: now + windowMs });
    return true;
  }

  if (record.count < maxRequests) {
    record.count++;
    return true;
  }

  return false;
}

export function getRateLimitStatus(key: string): { remaining: number; reset: number } | null {
  const record = requestCounts.get(key);
  if (!record) return null;

  return {
    remaining: Math.max(0, maxRequests - record.count),
    reset: record.reset,
  };
}
```

### Step 5: Update API Route

Modify `app/api/check-ip/route.ts` to handle real API calls:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { checkIP, checkURL, checkMalware, checkCyberThreat } from '@/lib/threat-checker';
import { checkRateLimit } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting per IP
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientIP, 10, 60000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Max 10 requests per minute.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { ip, url, malware, 'cyber-threat': cyberThreat } = body;

    if (ip) {
      const report = await checkIP(ip);
      return NextResponse.json(report);
    } else if (url) {
      const report = await checkURL(url);
      return NextResponse.json(report);
    } else if (malware) {
      const report = await checkMalware(malware);
      return NextResponse.json(report);
    } else if (cyberThreat) {
      const report = await checkCyberThreat(cyberThreat);
      return NextResponse.json(report);
    }

    return NextResponse.json(
      { error: 'Missing required parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Best Practices

1. **Cache Results**: Store API responses in a database to avoid duplicate requests
   ```typescript
   // Check database first
   const cached = await db.threats.findOne({ query, type, createdAt: { $gt: Date.now() - 86400000 } });
   if (cached) return cached;
   
   // Call API
   const result = await checkVirusTotal(query, type);
   
   // Store in database
   await db.threats.insertOne({ query, type, result, createdAt: Date.now() });
   return result;
   ```

2. **Implement Retry Logic**: Handle temporary failures
   ```typescript
   async function retryFetch(url: string, options: any, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await fetch(url, options);
       } catch (error) {
         if (i === maxRetries - 1) throw error;
         await new Promise(r => setTimeout(r, 1000 * (i + 1)));
       }
     }
   }
   ```

3. **Monitor API Usage**: Track quota consumption
   ```typescript
   export function logAPICall(source: string, success: boolean, responseTime: number) {
     console.log({
       source,
       success,
       responseTime,
       timestamp: new Date().toISOString(),
     });
   }
   ```

4. **Error Handling**: Gracefully handle API failures
   ```typescript
   try {
     const result = await checkAPI(...);
     return { status: 'success', data: result };
   } catch (error) {
     // Return mock data as fallback
     return { status: 'error', fallback: true, data: generateMockData() };
   }
   ```

## Summary

To use real APIs:
1. Get API keys from threat intelligence platforms
2. Add them to `.env.local`
3. Create API client functions
4. Update threat checker to call real APIs
5. Implement rate limiting and caching
6. Add error handling and retry logic

Your app is currently using mock data. Replace the random data generation in `calculateRiskScore()` and check functions with actual API responses for production use.
