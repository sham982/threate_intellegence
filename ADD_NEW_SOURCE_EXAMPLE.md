# Step-by-Step Guide: Adding a New Threat Intelligence Source

This guide walks through adding **IPinfo** as a new IP threat intelligence source.

## Overview
Adding a new source involves:
1. Creating an API integration module
2. Updating the source list
3. Integrating into the threat checker
4. Adding environment variables

## Example: Adding IPinfo

### Step 1: Create API Integration Module

Create `/lib/integrations/ipinfo.ts`:

```typescript
/**
 * IPinfo API Integration
 * Free tier: 50,000 requests per month
 * API Docs: https://ipinfo.io/docs
 */

interface IPinfoResponse {
  ip: string;
  city: string;
  region: string;
  country: string;
  loc: string; // latitude,longitude
  org: string;
  timezone: string;
  postal: string;
  hostname?: string;
  privacy?: {
    vpn: boolean;
    proxy: boolean;
    tor: boolean;
    relay: boolean;
  };
  abuse?: {
    address: string;
    country: string;
    email: string;
    name: string;
    network: string;
    phone: string;
  };
}

export async function checkIPWithIPinfo(ip: string): Promise<{
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  organization: string;
  timezone: string;
  isVPN: boolean;
  isProxy: boolean;
  isTor: boolean;
  abuseEmail?: string;
}> {
  const apiKey = process.env.IPINFO_API_KEY;

  // IPinfo allows limited free access without API key, but with key you get more data
  const url = apiKey
    ? `https://ipinfo.io/${ip}?token=${apiKey}`
    : `https://ipinfo.io/${ip}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`IPinfo API error: ${response.status}`);
    }

    const data: IPinfoResponse = await response.json();
    const [lat, lon] = data.loc.split(',').map(Number);

    return {
      city: data.city || 'Unknown',
      region: data.region || 'Unknown',
      country: data.country || 'Unknown',
      latitude: lat || 0,
      longitude: lon || 0,
      organization: data.org || 'Unknown',
      timezone: data.timezone || 'Unknown',
      isVPN: data.privacy?.vpn || false,
      isProxy: data.privacy?.proxy || false,
      isTor: data.privacy?.tor || false,
      abuseEmail: data.abuse?.email,
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error('Unknown IPinfo API error');
  }
}
```

### Step 2: Update the Integrations Index

Add to `/lib/integrations/index.ts`:

```typescript
export * from './ipinfo';
```

### Step 3: Add to Source List

Update `/lib/threat-checker.ts` to include IPinfo in the IP_THREAT_SOURCES array:

```typescript
const IP_THREAT_SOURCES = [
  { name: 'Virus Total', id: 'virustotal', url: 'https://www.virustotal.com/gui/search/' },
  { name: 'AbuseIPDB', id: 'abuseipdb', url: 'https://www.abuseipdb.com/' },
  // ... existing sources ...
  { 
    name: 'IPinfo', 
    id: 'ipinfo', 
    url: 'https://ipinfo.io/' 
  },
];
```

### Step 4: Integrate into Threat Checker

Update the `checkIP` function in `/lib/threat-checker.ts`:

```typescript
import { checkIPWithIPinfo } from './integrations';

export async function checkIP(ip: string): Promise<IPReport> {
  if (!isValidIP(ip)) {
    throw new Error('Invalid IP address format');
  }

  const results: ThreatIntelligenceResult[] = [];

  // ... existing API calls ...

  // Try IPinfo
  try {
    const ipinfoData = await checkIPWithIPinfo(ip);
    results.push({
      source: 'IPinfo',
      status: 'success',
      data: ipinfoData,
      timestamp: Date.now(),
    });
  } catch (error) {
    results.push({
      source: 'IPinfo',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now(),
    });
  }

  // ... rest of the function ...
}
```

### Step 5: Add Environment Variable

Add to `.env.local`:

```env
IPINFO_API_KEY=your_api_key_here
```

### Step 6: Update Result Display (Optional)

If you want to display the geolocation data from IPinfo in the results modal, update `/components/result-modal.tsx`:

```typescript
{/* In the results rendering section */}
{result.source === 'IPinfo' && result.data && (
  <div className="space-y-2 text-xs">
    <p><span className="font-medium">Location:</span> {result.data.city}, {result.data.region}</p>
    <p><span className="font-medium">Country:</span> {result.data.country}</p>
    <p><span className="font-medium">Coordinates:</span> {result.data.latitude}, {result.data.longitude}</p>
    <p><span className="font-medium">Organization:</span> {result.data.organization}</p>
    <p><span className="font-medium">Timezone:</span> {result.data.timezone}</p>
    {result.data.isVPN && <p className="text-orange-600"><span className="font-medium">⚠️ VPN Detected</span></p>}
    {result.data.isProxy && <p className="text-orange-600"><span className="font-medium">⚠️ Proxy Detected</span></p>}
    {result.data.isTor && <p className="text-red-600"><span className="font-medium">⚠️ Tor Network</span></p>}
  </div>
)}
```

### Step 7: Test the Integration

Test with a sample IP:

```bash
curl -X POST http://localhost:3000/api/check-ip \
  -H "Content-Type: application/json" \
  -d '{"ip":"8.8.8.8"}'
```

You should see results from IPinfo among the other sources.

## Complete Example: Adding GreyNoise

Here's another example to add **GreyNoise** for IP intelligence:

### `/lib/integrations/greynoise.ts`

```typescript
/**
 * GreyNoise API Integration
 * Free tier: 500 requests per day
 * API Docs: https://docs.greynoise.io/
 */

interface GreyNoiseIPResponse {
  ip: string;
  seen: boolean;
  classification: 'malicious' | 'benign' | 'unknown';
  last_seen: string;
  actor?: string;
  tags: string[];
  metadata?: {
    country: string;
    city: string;
    organization: string;
    os: string;
  };
}

export async function checkIPWithGreyNoise(ip: string): Promise<{
  seen: boolean;
  classification: string;
  lastSeen: string;
  actor?: string;
  tags: string[];
  country?: string;
  organization?: string;
}> {
  const apiKey = process.env.GREYNOISE_API_KEY;

  if (!apiKey) {
    throw new Error('GreyNoise API key not configured');
  }

  try {
    const response = await fetch(`https://api.greynoise.io/v3/community/${ip}`, {
      headers: {
        'key': apiKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`GreyNoise API error: ${response.status}`);
    }

    const data: GreyNoiseIPResponse = await response.json();

    return {
      seen: data.seen,
      classification: data.classification,
      lastSeen: data.last_seen || 'Never',
      actor: data.actor,
      tags: data.tags || [],
      country: data.metadata?.country,
      organization: data.metadata?.organization,
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error('Unknown GreyNoise API error');
  }
}
```

## API Keys to Get

Here are the platforms and where to get free API keys:

| Platform | Sign Up | Key Name | Limit |
|----------|---------|----------|-------|
| VirusTotal | https://www.virustotal.com/gui/home/upload | VIRUSTOTAL_API_KEY | 4 req/min |
| AbuseIPDB | https://www.abuseipdb.com/register | ABUSEIPDB_API_KEY | 1000 req/day |
| IPinfo | https://ipinfo.io/signup | IPINFO_API_KEY | 50k req/month |
| GreyNoise | https://viz.greynoise.io/signup | GREYNOISE_API_KEY | 500 req/day |
| URLScan | https://urlscan.io/user/signup | URLSCAN_API_KEY | 100 req/day |
| Shodan | https://www.shodan.io/register | SHODAN_API_KEY | Limited free |
| Pulsedive | https://pulsedive.com/ | PULSEDIVE_API_KEY | Generous free |

## Testing Framework

Create `/lib/test-integrations.ts` to test your integrations:

```typescript
async function testIntegrations() {
  const testIP = '8.8.8.8';
  
  console.log('Testing integrations...\n');

  try {
    const { checkIPWithVirusTotal } = await import('./integrations/virustotal');
    const vtResult = await checkIPWithVirusTotal(testIP);
    console.log('✓ VirusTotal:', vtResult);
  } catch (error) {
    console.log('✗ VirusTotal:', error instanceof Error ? error.message : error);
  }

  try {
    const { checkIPWithAbuseIPDB } = await import('./integrations/abuseipdb');
    const abuseResult = await checkIPWithAbuseIPDB(testIP);
    console.log('✓ AbuseIPDB:', abuseResult);
  } catch (error) {
    console.log('✗ AbuseIPDB:', error instanceof Error ? error.message : error);
  }

  try {
    const { checkIPWithIPinfo } = await import('./integrations/ipinfo');
    const ipinfoResult = await checkIPWithIPinfo(testIP);
    console.log('✓ IPinfo:', ipinfoResult);
  } catch (error) {
    console.log('✗ IPinfo:', error instanceof Error ? error.message : error);
  }
}

testIntegrations();
```

## Common Issues & Solutions

### API Key Not Recognized
- Ensure environment variables are set: `PLATFORM_API_KEY=value`
- Restart the dev server after adding env vars
- Check for typos in key names

### Rate Limit Exceeded
- Implement caching with Redis/Upstash
- Add request queuing for production
- Use exponential backoff for retries

### CORS Issues (Client-Side Calls)
- Always call APIs from the backend (API routes)
- Never make API calls directly from client components
- Use SWR or fetch to call your API route

### Timeouts
- Add timeout parameters to fetch calls
- Implement a request timeout helper
- Consider using a queue for heavy-duty scanning

## Next Steps

1. Choose 2-3 APIs to start with
2. Get API keys
3. Create integration modules following the examples
4. Test each integration
5. Update the threat checker
6. Deploy to production
