# AbuseIPDB API Integration Guide

## How It Works

The AbuseIPDB integration checks IP addresses against a crowdsourced database of reported abuse. Here's the complete flow:

### 1. Data Flow Architecture

```
User Input (IP Address)
    ↓
Frontend validates IP format
    ↓
Sends request to checkIP() function
    ↓
checkIPWithAbuseIPDB() makes API call
    ↓
AbuseIPDB returns JSON response
    ↓
Parse response and extract data
    ↓
Calculate risk score (0-100)
    ↓
Determine risk level (safe/suspicious/malicious)
    ↓
Return IPReport with results
    ↓
Frontend displays threat report
```

### 2. API Endpoint Used

```
https://www.abuseipdb.com/check/[IP]/json?key=[API_KEY]&days=[DAYS]
```

**Parameters:**
- `[IP]`: The IP address to check (e.g., 192.168.1.1)
- `[API_KEY]`: Your AbuseIPDB API key (already configured in .env.local)
- `[DAYS]`: How many days of history to check (default: 90)

### 3. Request Example

```
GET https://www.abuseipdb.com/check/192.0.2.1/json?key=YOUR_API_KEY&days=90
```

### 4. Response Structure

AbuseIPDB returns a JSON object like:

```json
{
  "ip": "192.0.2.1",
  "abuseConfidenceScore": 45,
  "totalReports": 3,
  "usageType": "residential",
  "isp": "Example ISP",
  "domain": "example.com",
  "hostnames": ["host1.example.com"],
  "lastReportedAt": "2024-03-20T10:30:00+00:00",
  "isWhitelisted": false
}
```

### 5. How Risk Score Calculation Works

The risk score is directly taken from AbuseIPDB's `abuseConfidenceScore`:

```typescript
// Risk Level Mapping
- Safe: 0-24 (Low abuse confidence)
- Suspicious: 25-74 (Medium abuse confidence)
- Malicious: 75-100 (High abuse confidence)
```

**Example:**
- IP with 80 abuse confidence score → Risk Level: **Malicious**
- IP with 45 abuse confidence score → Risk Level: **Suspicious**
- IP with 10 abuse confidence score → Risk Level: **Safe**

### 6. Code Implementation

**In `lib/threat-checker.ts`:**

```typescript
// Main function called from components
export async function checkIP(ip: string): Promise<IPReport> {
  // 1. Validate IP format
  if (!isValidIP(ip)) {
    throw new Error('Invalid IP address format');
  }

  // 2. Call AbuseIPDB API
  const abuseResult = await checkIPWithAbuseIPDB(ip);
  
  // 3. Parse the response
  const riskCalc = calculateRiskFromAbuseScore(abuseResult.data.abuseConfidenceScore);
  
  // 4. Return formatted report
  return {
    ip,
    timestamp: Date.now(),
    results: [abuseResult],
    riskScore: riskCalc.score,
    riskLevel: riskCalc.level,
    type: 'ip',
  };
}
```

### 7. Response Data Explanation

| Field | Meaning | Example |
|-------|---------|---------|
| `abuseConfidenceScore` | Confidence that IP is abusive (0-100) | 75 (High confidence) |
| `totalReports` | Number of abuse reports | 5 reports |
| `usageType` | Type of IP usage | "residential", "commercial", "datacenter" |
| `isp` | Internet Service Provider name | "Verizon Communications" |
| `domain` | Associated domain | "example.com" |
| `lastReportedAt` | Last time this IP was reported | "2024-03-20T10:30:00Z" |
| `isWhitelisted` | Whether IP is whitelisted | false |

### 8. Error Handling

The integration handles several error scenarios:

```typescript
// 1. Missing API Key
if (!apiKey) {
  return {
    status: 'error',
    error: 'AbuseIPDB API key not configured'
  };
}

// 2. Network/API Errors
if (!response.ok) {
  return {
    status: 'error',
    error: `API returned status ${response.status}`
  };
}

// 3. Parsing Errors
catch (error) {
  return {
    status: 'error',
    error: error.message
  };
}
```

### 9. Testing the Integration

**Test with a known malicious IP:**
```
192.0.2.1 (documentation example - will likely have reports)
```

**Test with a safe IP:**
```
8.8.8.8 (Google DNS - should be safe)
```

### 10. Rate Limiting

AbuseIPDB API has rate limits:
- **Free tier:** 1,000 requests per day
- **Premium tier:** Higher limits

Monitor your usage in the AbuseIPDB dashboard.

### 11. How to Use in Components

**From IP Checker Component:**

```typescript
import { checkIP } from '@/lib/threat-checker';

// In your component
const handleCheck = async (ip: string) => {
  try {
    const report = await checkIP(ip);
    
    // report.riskScore = 0-100
    // report.riskLevel = 'safe' | 'suspicious' | 'malicious'
    // report.results[0].data contains AbuseIPDB response
    
    setReport(report);
  } catch (error) {
    setError(error.message);
  }
};
```

### 12. Environment Variable Setup

The API key is stored in `.env.local`:

```
NEXT_PUBLIC_ABUSEIPDB_API_KEY=80809c9d84830619d85cc364b86621cb54b40ed6deba4dafe4a38b226fbc1cee696d639d590dcef6
```

**Note:** Keys starting with `NEXT_PUBLIC_` are exposed to the browser (safe for public APIs).

### 13. Next Steps: Adding More Sources

To add VirusTotal or other APIs:

1. Add API key to `.env.local`
2. Create a new function like `checkIPWithVirusTotal()`
3. Add it to the `results` array in `checkIP()`
4. Merge the risk scores from multiple sources

### 14. Troubleshooting

**Q: Getting 401 or 403 errors?**
A: Check if your API key is correct in `.env.local`

**Q: API not responding?**
A: Check your internet connection and ensure AbuseIPDB service is up

**Q: Risk score showing 0 for all IPs?**
A: The IP might be new or have no reports (which is good!)

**Q: Need to add caching?**
A: Implement Redis or simple in-memory cache to avoid repeated API calls
