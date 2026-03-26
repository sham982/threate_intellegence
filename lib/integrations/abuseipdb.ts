/**
 * AbuseIPDB API Integration
 * Free tier: 1,000 requests per 24 hours
 * API Docs: https://docs.abuseipdb.com/
 */

interface AbuseIPDBResponse {
  data: {
    ipAddress: string;
    abuseConfidenceScore: number;
    countryCode: string;
    countryName: string;
    usageType: string;
    isp: string;
    domain: string;
    totalReports: number;
    numDistinctUsers: number;
    lastReportedAt: string | null;
  };
}

/**
 * Check IP address on AbuseIPDB
 */
export async function checkIPWithAbuseIPDB(ip: string): Promise<{
  abuseScore: number;
  totalReports: number;
  distinctUsers: number;
  lastReported: string | null;
  isp: string;
  domain: string;
  country: string;
  usageType: string;
}> {
  const apiKey = process.env.ABUSEIPDB_API_KEY;

  if (!apiKey) {
    throw new Error('AbuseIPDB API key not configured. Add ABUSEIPDB_API_KEY to environment variables.');
  }

  try {
    const params = new URLSearchParams({
      ipAddress: ip,
      maxAgeInDays: '90',
      verbose: '',
    });

    const response = await fetch(`https://api.abuseipdb.com/api/v2/check?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Key': apiKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`AbuseIPDB API error: ${response.status} ${response.statusText}`);
    }

    const result: AbuseIPDBResponse = await response.json();
    const data = result.data;

    return {
      abuseScore: data.abuseConfidenceScore,
      totalReports: data.totalReports,
      distinctUsers: data.numDistinctUsers,
      lastReported: data.lastReportedAt,
      isp: data.isp,
      domain: data.domain,
      country: data.countryName,
      usageType: data.usageType,
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error('Unknown AbuseIPDB API error');
  }
}

/**
 * Report an IP address to AbuseIPDB
 * Note: Requires proper API key with reporting permissions
 */
export async function reportIPToAbuseIPDB(ip: string, category: number, comment: string): Promise<{
  success: boolean;
  message: string;
}> {
  const apiKey = process.env.ABUSEIPDB_API_KEY;

  if (!apiKey) {
    throw new Error('AbuseIPDB API key not configured');
  }

  try {
    const params = new URLSearchParams({
      ip,
      category: category.toString(),
      comment,
    });

    const response = await fetch(`https://api.abuseipdb.com/api/v2/report?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Key': apiKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`AbuseIPDB API error: ${response.status}`);
    }

    return {
      success: true,
      message: 'IP reported successfully',
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error('Unknown AbuseIPDB API error');
  }
}

/**
 * AbuseIPDB categories reference:
 * 3 = Fraud/CP
 * 4 = DDoS Attack
 * 5 = FTP Brute-Force
 * 6 = Ping of Death
 * 7 = Phishing
 * 8 = Proxy/VPN
 * 9 = Scanner
 * 10 = Spit/Spam
 * 11 = SSH
 * 12 = Mass Exploit
 * 13 = BOTNET C&C
 * 14 = MySQL Exploit
 * 15 = Web App Attack
 * 16 = SSH (Distributed)
 * 17 = OpenStack
 * 18 = Wordpress Exploit
 * 19 = Carding
 * 20 = Malware C&C
 * 21 = Open Proxy
 * 22 = Web Shell Injection
 * 23 = Stolen Data Logs
 * 24 = Forged SDN Docs
 * 25 = File Inclusion
 * 26 = Malware
 * 27 = PUP/PUA
 * 28 = IP Spoofing
 * 29 = Legitimate Abuse
 * 30 = Tracker Abuse
 * 31 = Fake SSL
 * 32 = DeTor Exit Nodes
 * 33 = Compromised
 * 34 = Malicious Web Shell
 * 35 = Distribution
 * 36 = Passwordcracking
 */
