import { ThreatIntelligenceResult, IPReport, URLReport, MalwareReport, CyberThreatReport } from './types';

// List of threat intelligence sources for reference
export const IP_THREAT_SOURCES = [
  { name: 'Virus Total', id: 'virustotal', url: 'https://www.virustotal.com/gui/search/' },
  { name: 'AbuseIPDB', id: 'abuseipdb', url: 'https://www.abuseipdb.com/' },
  { name: 'Alien Vault OTX', id: 'alienvault', url: 'https://otx.alienvault.com/browse/global/indicators' },
  { name: 'GreyNoise', id: 'greynoise', url: 'https://viz.greynoise.io' },
  { name: 'Shodan', id: 'shodan', url: 'https://www.shodan.io/' },
];

export const URL_THREAT_SOURCES = [
  { name: 'Virus Total', id: 'virustotal', url: 'https://www.virustotal.com/gui/search/' },
  { name: 'URLhaus', id: 'urlhaus', url: 'https://urlhaus.abuse.ch/browse/' },
  { name: 'URLScan', id: 'urlscan', url: 'https://urlscan.io/search/' },
];

export const MALWARE_THREAT_SOURCES = [
  { name: 'Virus Total', id: 'virustotal', url: 'https://www.virustotal.com' },
  { name: 'Hybrid Analysis', id: 'hybridanalysis', url: 'https://www.hybrid-analysis.com/' },
  { name: 'ANY.RUN', id: 'anyrun', url: 'https://app.any.run/' },
];

export const CYBER_THREAT_SOURCES = [
  { name: 'Virus Total', id: 'virustotal', url: 'https://www.virustotal.com/gui/home/search' },
  { name: 'Alien Vault OTX', id: 'alienvault', url: 'https://otx.alienvault.com/browse/global/indicators' },
  { name: 'SANS ISC', id: 'sans', url: 'https://isc.sans.edu/' },
];

function isValidIP(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Regex.test(ip)) return false;
  
  const parts = ip.split('.');
  return parts.every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
}

function isValidURL(urlStr: string): boolean {
  try {
    const url = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function normalizeURL(urlStr: string): string {
  if (!urlStr.startsWith('http')) {
    return `https://${urlStr}`;
  }
  return urlStr;
}

// AbuseIPDB API Integration
async function checkIPWithAbuseIPDB(ip: string): Promise<ThreatIntelligenceResult> {
  const apiKey = process.env.NEXT_PUBLIC_ABUSEIPDB_API_KEY;
  
  if (!apiKey) {
    return {
      source: 'AbuseIPDB',
      status: 'error',
      error: 'AbuseIPDB API key not configured',
      timestamp: Date.now(),
    };
  }

  try {
    // Using AbuseIPDB JSON endpoint
    const url = `https://www.abuseipdb.com/check/${ip}/json?key=${apiKey}&days=90`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'ThreatIntelligenceChecker/1.0',
      },
    });

    if (!response.ok) {
      return {
        source: 'AbuseIPDB',
        status: 'error',
        error: `AbuseIPDB API returned status ${response.status}`,
        timestamp: Date.now(),
      };
    }

    const data = await response.json();

    // Parse AbuseIPDB response
    const abuseData = {
      ipAddress: data.ip || ip,
      abuseConfidenceScore: data.abuseConfidenceScore || 0,
      totalReports: data.totalReports || 0,
      usageType: data.usageType || 'Unknown',
      isp: data.isp || 'Unknown',
      domain: data.domain || 'Unknown',
      hostnames: data.hostnames || [],
      lastReportedAt: data.lastReportedAt || null,
      isWhitelisted: data.isWhitelisted || false,
    };

    return {
      source: 'AbuseIPDB',
      status: 'success',
      data: abuseData,
      timestamp: Date.now(),
    };
  } catch (error) {
    return {
      source: 'AbuseIPDB',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now(),
    };
  }
}

// Calculate risk score and level based on AbuseIPDB confidence score
function calculateRiskFromAbuseScore(abuseScore: number): { score: number; level: 'safe' | 'suspicious' | 'malicious' } {
  let level: 'safe' | 'suspicious' | 'malicious' = 'safe';
  
  if (abuseScore >= 75) {
    level = 'malicious';
  } else if (abuseScore >= 25) {
    level = 'suspicious';
  }
  
  return {
    score: abuseScore,
    level,
  };
}

// API Integration functions - Replace these with your real API keys and logic
export async function checkIP(ip: string): Promise<IPReport> {
  if (!isValidIP(ip)) {
    throw new Error('Invalid IP address format');
  }

  const results: ThreatIntelligenceResult[] = [];

  // Check with AbuseIPDB
  const abuseResult = await checkIPWithAbuseIPDB(ip);
  results.push(abuseResult);

  // Extract abuse score for risk calculation
  let riskScore = 0;
  let riskLevel: 'safe' | 'suspicious' | 'malicious' = 'safe';

  if (abuseResult.status === 'success' && abuseResult.data && typeof abuseResult.data === 'object') {
    const data = abuseResult.data as any;
    if ('abuseConfidenceScore' in data) {
      const riskCalc = calculateRiskFromAbuseScore(data.abuseConfidenceScore);
      riskScore = riskCalc.score;
      riskLevel = riskCalc.level;
    }
  }

  const report: IPReport = {
    ip,
    timestamp: Date.now(),
    results,
    riskScore,
    riskLevel,
    type: 'ip',
  };

  return report;
}

export async function checkURL(urlStr: string): Promise<URLReport> {
  const normalizedUrl = normalizeURL(urlStr);
  
  if (!isValidURL(normalizedUrl)) {
    throw new Error('Invalid URL format');
  }

  // TODO: Integrate real API calls here
  // Example API calls to implement:
  // 1. VirusTotal URL API
  // 2. URLhaus API
  // 3. URLScan API

  const results: ThreatIntelligenceResult[] = [];
  
  // Placeholder for API integration
  throw new Error('API integration required. Set your API keys in environment variables.');
}

export async function checkMalware(fileHash: string): Promise<MalwareReport> {
  if (!fileHash || fileHash.length < 8) {
    throw new Error('Invalid file hash format');
  }

  // TODO: Integrate real API calls here
  // Example API calls to implement:
  // 1. VirusTotal Hash API
  // 2. Hybrid Analysis API
  // 3. ANY.RUN API

  const results: ThreatIntelligenceResult[] = [];
  
  // Placeholder for API integration
  throw new Error('API integration required. Set your API keys in environment variables.');
}

export async function checkCyberThreat(indicator: string): Promise<CyberThreatReport> {
  if (!indicator || indicator.length < 3) {
    throw new Error('Invalid indicator format');
  }

  // TODO: Integrate real API calls here
  // Example API calls to implement:
  // 1. VirusTotal API for threat feeds
  // 2. Alien Vault OTX API
  // 3. SANS ISC feeds

  const results: ThreatIntelligenceResult[] = [];
  
  // Placeholder for API integration
  throw new Error('API integration required. Set your API keys in environment variables.');
}

export function getIPThreatSources() {
  return IP_THREAT_SOURCES;
}

export function getURLThreatSources() {
  return URL_THREAT_SOURCES;
}

export function getMalwareThreatSources() {
  return MALWARE_THREAT_SOURCES;
}

export function getCyberThreatSources() {
  return CYBER_THREAT_SOURCES;
}
