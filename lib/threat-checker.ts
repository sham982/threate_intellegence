import { ThreatIntelligenceResult, IPReport, URLReport } from './types';

const IP_THREAT_SOURCES = [
  { name: 'Virus Total', id: 'virustotal', url: 'https://www.virustotal.com/gui/search/' },
  { name: 'Alien Vault OTX', id: 'alienvault', url: 'https://otx.alienvault.com/browse/global/indicators' },
  { name: 'GreyNoise', id: 'greynoise', url: 'https://viz.greynoise.io' },
  { name: 'Threat Fox', id: 'threatfox', url: 'https://threatfox.abuse.ch/browse/' },
  { name: 'IP Quality Score', id: 'ipqs', url: 'https://www.ipqualityscore.com/free-ip-lookup-proxy-vpn-test' },
  { name: 'Pulsedive', id: 'pulsedive', url: 'https://pulsedive.com/' },
  { name: 'Shodan', id: 'shodan', url: 'https://www.shodan.io/' },
  { name: 'Censys', id: 'censys', url: 'https://censys.io/ipv4' },
  { name: 'Cisco TALOS', id: 'talos', url: 'https://talosintelligence.com/' },
  { name: 'AbuseIPDB', id: 'abuseipdb', url: 'https://www.abuseipdb.com/' },
  { name: 'Whatismyipaddress', id: 'whatismyip', url: 'https://whatismyipaddress.com/blacklist-check' },
  { name: 'Anti-Abuse Project', id: 'antiabuse', url: 'http://www.anti-abuse.org/multi-rbl-check/' },
  { name: 'InQuest Labs', id: 'inquest', url: 'https://labs.inquest.net/repdb' },
  { name: 'MalwareURL', id: 'malwareurl', url: 'https://www.malwareurl.com/listing-urls.php' },
  { name: 'IPinfo', id: 'ipinfo', url: 'https://ipinfo.io/' },
  { name: 'BrowserLeaks', id: 'browserleaks', url: 'https://browserleaks.com' },
  { name: 'VPN Proxy Detection', id: 'vpnproxy', url: 'https://vpn-proxy-detection.ipify.org/' },
  { name: 'IP Teoh', id: 'ipteoh', url: 'https://ip.teoh.io/' },
  { name: 'VPNAPI.io', id: 'vpnapi', url: 'https://vpnapi.io/' },
  { name: 'IOC.One', id: 'iocone', url: 'https://ioc.one/' },
];

const URL_THREAT_SOURCES = [
  { name: 'Virus Total', id: 'virustotal', url: 'https://www.virustotal.com/gui/search/' },
  { name: 'Alien Vault OTX', id: 'alienvault', url: 'https://otx.alienvault.com/browse/global/indicators' },
  { name: 'SecurityTrails', id: 'securitytrails', url: 'https://securitytrails.com/domain/' },
  { name: 'URLHaus', id: 'urlhaus', url: 'https://urlhaus.abuse.ch/browse/' },
  { name: 'URLScan', id: 'urlscan', url: 'https://urlscan.io/search/' },
  { name: 'IP Quality Score', id: 'ipqs', url: 'https://www.ipqualityscore.com/threat-feeds/malicious-url-scanner' },
  { name: 'Sucuri', id: 'sucuri', url: 'https://sitecheck.sucuri.net/?res=ok&domain=' },
  { name: 'InQuest Labs', id: 'inquest', url: 'https://labs.inquest.net/iocdb' },
  { name: 'Threat Fox', id: 'threatfox', url: 'https://threatfox.abuse.ch/browse/' },
  { name: 'MalwareURL', id: 'malwareurl', url: 'https://www.malwareurl.com/listing-urls.php' },
  { name: 'ThreatMiner', id: 'threatminer', url: 'https://www.threatminer.org/' },
  { name: 'Pulsedive', id: 'pulsedive', url: 'https://pulsedive.com/search/' },
  { name: 'WhereGoes', id: 'wheregoes', url: 'https://wheregoes.com/' },
  { name: 'RedirectDetective', id: 'redirectdetective', url: 'https://redirectdetective.com/' },
  { name: 'RedirectTracker', id: 'redirecttracker', url: 'https://www.redirecttracker.com/' },
  { name: 'Bulkblacklist', id: 'bulkblacklist', url: 'https://www.bulkblacklist.com/' },
  { name: 'DocGuard', id: 'docguard', url: 'https://app.docguard.io/' },
  { name: 'IOC.One', id: 'iocone', url: 'https://ioc.one/' },
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

function calculateRiskScore(resultsData: ThreatIntelligenceResult[]): { score: number; level: 'safe' | 'suspicious' | 'malicious' } {
  // Simulate risk calculation based on mock data
  const successResults = resultsData.filter(r => r.status === 'success');
  
  if (successResults.length === 0) {
    return { score: 0, level: 'safe' };
  }

  // Random mock scoring for demonstration
  const mockScore = Math.floor(Math.random() * 100);
  
  let level: 'safe' | 'suspicious' | 'malicious' = 'safe';
  if (mockScore > 70) level = 'malicious';
  else if (mockScore > 40) level = 'suspicious';
  
  return { score: mockScore, level };
}

export async function checkIP(ip: string): Promise<IPReport> {
  if (!isValidIP(ip)) {
    throw new Error('Invalid IP address format');
  }

  const results: ThreatIntelligenceResult[] = [];

  // Create results for each source (mix of successful lookups and direct links)
  for (const source of IP_THREAT_SOURCES) {
    try {
      // For demo purposes, we'll create a mix of results
      // Some will be "success" with mock data, others will show as direct links
      const useDirectLink = Math.random() > 0.6;

      if (useDirectLink) {
        results.push({
          source: source.name,
          status: 'success',
          url: `${source.url}${ip}`,
          timestamp: Date.now(),
          data: {
            type: 'direct_link',
            message: 'Click link to check on this platform',
          },
        });
      } else {
        // Mock API response
        const mockData = {
          found: Math.random() > 0.5,
          reports: Math.floor(Math.random() * 50),
          lastSeen: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          reputation: Math.floor(Math.random() * 100),
        };

        results.push({
          source: source.name,
          status: 'success',
          data: mockData,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      results.push({
        source: source.name,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      });
    }
  }

  const { score, level } = calculateRiskScore(results);

  const report: IPReport = {
    ip,
    timestamp: Date.now(),
    results,
    riskScore: score,
    riskLevel: level,
    type: 'ip',
  };

  return report;
}

export async function checkURL(urlStr: string): Promise<URLReport> {
  const normalizedUrl = normalizeURL(urlStr);
  
  if (!isValidURL(normalizedUrl)) {
    throw new Error('Invalid URL format');
  }

  const results: ThreatIntelligenceResult[] = [];

  // Create results for each source (mix of successful lookups and direct links)
  for (const source of URL_THREAT_SOURCES) {
    try {
      const useDirectLink = Math.random() > 0.5;
      let sourceUrl = source.url;

      // Special handling for different platforms
      if (source.id === 'sucuri' && !source.url.endsWith('=')) {
        sourceUrl = `${source.url}${normalizedUrl}`;
      } else if (source.id === 'urlscan') {
        sourceUrl = `${source.url}?q=${encodeURIComponent(normalizedUrl)}`;
      } else if (source.id === 'securitytrails') {
        const domain = new URL(normalizedUrl).hostname;
        sourceUrl = `${source.url}${domain}/dns`;
      } else if (source.id === 'pulsedive') {
        sourceUrl = `${source.url}?query=${encodeURIComponent(normalizedUrl)}`;
      } else if (source.id === 'virustotal') {
        sourceUrl = `${source.url}${encodeURIComponent(normalizedUrl)}`;
      } else {
        sourceUrl = `${source.url}${encodeURIComponent(normalizedUrl)}`;
      }

      if (useDirectLink) {
        results.push({
          source: source.name,
          status: 'success',
          url: sourceUrl,
          timestamp: Date.now(),
          data: {
            type: 'direct_link',
            message: 'Click link to check on this platform',
          },
        });
      } else {
        // Mock API response
        const mockData = {
          malicious: Math.random() > 0.7,
          suspicious: Math.random() > 0.6,
          cleanStatus: Math.random() > 0.4,
          lastAnalysis: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          enginesDetected: Math.floor(Math.random() * 80),
        };

        results.push({
          source: source.name,
          status: 'success',
          data: mockData,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      results.push({
        source: source.name,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      });
    }
  }

  const { score, level } = calculateRiskScore(results);

  const report: URLReport = {
    url: normalizedUrl,
    timestamp: Date.now(),
    results,
    riskScore: score,
    riskLevel: level,
    type: 'url',
  };

  return report;
}

export function getIPThreatSources() {
  return IP_THREAT_SOURCES;
}

export function getURLThreatSources() {
  return URL_THREAT_SOURCES;
}

export function generateIPThreatURL(ip: string, sourceId: string): string {
  const source = IP_THREAT_SOURCES.find(s => s.id === sourceId);
  if (!source) return '';
  return `${source.url}${ip}`;
}

export function generateURLThreatURL(url: string, sourceId: string): string {
  const source = URL_THREAT_SOURCES.find(s => s.id === sourceId);
  if (!source) return '';
  
  // Handle different URL patterns for different sources
  if (sourceId === 'sucuri' && !source.url.endsWith('=')) {
    return `${source.url}${url}`;
  } else if (sourceId === 'urlscan') {
    return `${source.url}?q=${encodeURIComponent(url)}`;
  } else if (sourceId === 'securitytrails') {
    const domain = new URL(url).hostname;
    return `${source.url}${domain}/dns`;
  } else if (sourceId === 'pulsedive') {
    return `${source.url}?query=${encodeURIComponent(url)}`;
  }
  
  return `${source.url}${encodeURIComponent(url)}`;
}
