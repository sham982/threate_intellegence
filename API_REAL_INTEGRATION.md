# Real API Integration Guide

All mock data has been removed. Here's how to integrate real threat intelligence APIs:

## Required Environment Variables

Create a `.env.local` file in your project root:

```env
# VirusTotal API Key
VIRUSTOTAL_API_KEY=your_api_key_here

# AbuseIPDB API Key  
ABUSEIPDB_API_KEY=your_api_key_here

# URLhaus API (free, no key needed)
URLHAUS_ENABLED=true

# GreyNoise API Key
GREYNOISE_API_KEY=your_api_key_here
```

## 1. VirusTotal Integration (IP, URL, File Hash)

### Get API Key
- Visit: https://www.virustotal.com/gui/home/upload
- Sign up or login
- Go to Settings → API Key
- Copy your API key

### Implementation in `lib/threat-checker.ts`

```typescript
import axios from 'axios';

const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;
const VIRUSTOTAL_API_URL = 'https://www.virustotal.com/api/v3';

export async function checkIP(ip: string): Promise<IPReport> {
  if (!isValidIP(ip)) {
    throw new Error('Invalid IP address format');
  }

  try {
    const response = await axios.get(`${VIRUSTOTAL_API_URL}/ip_addresses/${ip}`, {
      headers: {
        'x-apikey': VIRUSTOTAL_API_KEY,
      },
    });

    const data = response.data;
    const stats = data.data.attributes.last_analysis_stats;

    const results: ThreatIntelligenceResult[] = [
      {
        source: 'VirusTotal',
        status: 'success',
        data: {
          malicious: stats.malicious,
          suspicious: stats.suspicious,
          undetected: stats.undetected,
          harmless: stats.harmless,
          last_analysis_date: data.data.attributes.last_analysis_date,
        },
        timestamp: Date.now(),
      },
    ];

    // Calculate risk score
    const totalDetections = stats.malicious + stats.suspicious;
    const riskScore = Math.min((totalDetections * 10), 100);
    let riskLevel: 'safe' | 'suspicious' | 'malicious' = 'safe';
    if (riskScore > 70) riskLevel = 'malicious';
    else if (riskScore > 40) riskLevel = 'suspicious';

    return {
      ip,
      timestamp: Date.now(),
      results,
      riskScore,
      riskLevel,
      type: 'ip',
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to check IP');
  }
}

export async function checkURL(urlStr: string): Promise<URLReport> {
  const normalizedUrl = normalizeURL(urlStr);
  
  if (!isValidURL(normalizedUrl)) {
    throw new Error('Invalid URL format');
  }

  try {
    // VirusTotal requires URL encoding
    const urlId = Buffer.from(normalizedUrl).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    const response = await axios.get(`${VIRUSTOTAL_API_URL}/urls/${urlId}`, {
      headers: {
        'x-apikey': VIRUSTOTAL_API_KEY,
      },
    });

    const data = response.data;
    const stats = data.data.attributes.last_analysis_stats;

    const results: ThreatIntelligenceResult[] = [
      {
        source: 'VirusTotal',
        status: 'success',
        data: {
          malicious: stats.malicious,
          suspicious: stats.suspicious,
          undetected: stats.undetected,
          harmless: stats.harmless,
        },
        timestamp: Date.now(),
      },
    ];

    const totalDetections = stats.malicious + stats.suspicious;
    const riskScore = Math.min((totalDetections * 10), 100);
    let riskLevel: 'safe' | 'suspicious' | 'malicious' = 'safe';
    if (riskScore > 70) riskLevel = 'malicious';
    else if (riskScore > 40) riskLevel = 'suspicious';

    return {
      url: normalizedUrl,
      timestamp: Date.now(),
      results,
      riskScore,
      riskLevel,
      type: 'url',
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to check URL');
  }
}

export async function checkMalware(fileHash: string): Promise<MalwareReport> {
  if (!fileHash || fileHash.length < 8) {
    throw new Error('Invalid file hash format');
  }

  try {
    const response = await axios.get(`${VIRUSTOTAL_API_URL}/files/${fileHash}`, {
      headers: {
        'x-apikey': VIRUSTOTAL_API_KEY,
      },
    });

    const data = response.data;
    const stats = data.data.attributes.last_analysis_stats;

    const results: ThreatIntelligenceResult[] = [
      {
        source: 'VirusTotal',
        status: 'success',
        data: {
          malicious: stats.malicious,
          suspicious: stats.suspicious,
          undetected: stats.undetected,
          type_tag: data.data.attributes.type_tag,
        },
        timestamp: Date.now(),
      },
    ];

    const totalDetections = stats.malicious + stats.suspicious;
    const riskScore = Math.min((totalDetections * 10), 100);
    let riskLevel: 'safe' | 'suspicious' | 'malicious' = 'safe';
    if (riskScore > 70) riskLevel = 'malicious';
    else if (riskScore > 40) riskLevel = 'suspicious';

    return {
      file: fileHash,
      fileHash: fileHash,
      timestamp: Date.now(),
      results,
      riskScore,
      riskLevel,
      type: 'malware',
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to check malware hash');
  }
}
```

## 2. AbuseIPDB Integration (IP Reputation)

### Get API Key
- Visit: https://www.abuseipdb.com/register
- Sign up (free tier available)
- Go to Account → API Key
- Copy your key

### Implementation

```typescript
const ABUSEIPDB_API_KEY = process.env.ABUSEIPDB_API_KEY;

// Add this to checkIP function to get additional IP reputation:
const abuseResponse = await axios.get('https://api.abuseipdb.com/api/v2/check', {
  params: {
    ipAddress: ip,
    maxAgeInDays: 90,
  },
  headers: {
    'Key': ABUSEIPDB_API_KEY,
    'Accept': 'application/json',
  },
});

const abuseData = abuseResponse.data.data;
results.push({
  source: 'AbuseIPDB',
  status: 'success',
  data: {
    abuseConfidenceScore: abuseData.abuseConfidenceScore,
    totalReports: abuseData.totalReports,
    usageType: abuseData.usageType,
    isp: abuseData.isp,
  },
  timestamp: Date.now(),
});
```

## 3. URLhaus Integration (Free, No Key Required)

```typescript
const urlhausResponse = await axios.get('https://urlhaus-api.abuse.ch/v1/url/', {
  params: {
    url: normalizedUrl,
  },
});

if (urlhausResponse.data.query_status === 'ok') {
  results.push({
    source: 'URLhaus',
    status: 'success',
    data: urlhausResponse.data.results,
    timestamp: Date.now(),
  });
}
```

## 4. GreyNoise Integration (IP Intelligence)

### Get API Key
- Visit: https://www.greynoise.io/
- Sign up (free tier available)
- Get your API key from dashboard

```typescript
const GREYNOISE_API_KEY = process.env.GREYNOISE_API_KEY;

const greynoiseResponse = await axios.get(`https://api.greynoise.io/v3/community/${ip}`, {
  headers: {
    'Authorization': `key ${GREYNOISE_API_KEY}`,
  },
});

results.push({
  source: 'GreyNoise',
  status: 'success',
  data: greynoiseResponse.data,
  timestamp: Date.now(),
});
```

## Environment Setup Steps

1. Install axios:
```bash
npm install axios
```

2. Create `.env.local`:
```bash
VIRUSTOTAL_API_KEY=your_key
ABUSEIPDB_API_KEY=your_key
GREYNOISE_API_KEY=your_key
```

3. Update `app/api/check-ip/route.ts` to use the new async functions

4. Test with a known IP like `8.8.8.8` or `1.1.1.1`

## Rate Limiting Best Practices

Most APIs have rate limits:
- VirusTotal: 4 requests/minute (free), 500,000/month
- AbuseIPDB: 1,500/day (free tier)
- GreyNoise: Limited free tier

Implement caching to avoid hitting limits:

```typescript
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function getCachedIP(ip: string) {
  const cached = cache.get(`ip-${ip}`);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const result = await checkIP(ip);
  cache.set(`ip-${ip}`, { data: result, timestamp: Date.now() });
  return result;
}
```

## Testing Your Integration

1. Start with a test IP: `8.8.8.8` (Google DNS)
2. Monitor API response times
3. Check quota usage in each API dashboard
4. Add error handling for API failures

## Next Steps

1. Choose which APIs to integrate based on your needs
2. Set up environment variables
3. Replace the placeholder functions with real API calls
4. Test each endpoint thoroughly
5. Monitor API usage and costs
