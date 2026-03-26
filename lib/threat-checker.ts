import { ThreatIntelligenceResult, IPReport } from './types';

const THREAT_SOURCES = [
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

function isValidIP(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Regex.test(ip)) return false;
  
  const parts = ip.split('.');
  return parts.every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
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
  for (const source of THREAT_SOURCES) {
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
  };

  return report;
}

export function getThreatSources() {
  return THREAT_SOURCES;
}

export function generateThreatURL(ip: string, sourceId: string): string {
  const source = THREAT_SOURCES.find(s => s.id === sourceId);
  if (!source) return '';
  return `${source.url}${ip}`;
}
