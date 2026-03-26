import { ThreatIntelligenceResult, IPReport, URLReport, MalwareReport, CyberThreatReport } from './types';

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

const MALWARE_THREAT_SOURCES = [
  { name: 'Virus Total', id: 'virustotal', url: 'https://www.virustotal.com' },
  { name: 'Alien Vault OTX', id: 'alienvault', url: 'https://otx.alienvault.com/browse/global/indicators' },
  { name: 'Threat Fox', id: 'threatfox', url: 'https://threatfox.abuse.ch/browse/' },
  { name: 'Malware Bazaar', id: 'malwarebazaar', url: 'https://bazaar.abuse.ch/browse/' },
  { name: 'Hybrid Analysis', id: 'hybridanalysis', url: 'https://www.hybrid-analysis.com/' },
  { name: 'Any Run', id: 'anyrun', url: 'https://app.any.run/' },
  { name: 'Joe Sandbox', id: 'joesandbox', url: 'https://www.joesandbox.com/#windows' },
  { name: 'Comodo Valkyrie', id: 'valkyrie', url: 'https://valkyrie.comodo.com' },
  { name: 'Browserling', id: 'browserling', url: 'https://www.browserling.com/' },
  { name: 'Cuckoo Sandbox Online', id: 'cuckoo', url: 'https://sandbox.pikker.ee/' },
  { name: 'Triage', id: 'triage', url: 'https://tria.ge/reports/public' },
  { name: 'CAPE', id: 'cape', url: 'https://capesandbox.com/' },
  { name: 'Intezer', id: 'intezer', url: 'https://analyze.intezer.com/scan' },
  { name: 'Malshare', id: 'malshare', url: 'https://malshare.com/' },
  { name: 'YOMI', id: 'yomi', url: 'https://yomi.yoroi.company/upload' },
  { name: 'InQuest Labs', id: 'inquest', url: 'https://labs.inquest.net/dfi' },
  { name: 'Manalyzer', id: 'manalyzer', url: 'https://manalyzer.org/' },
  { name: 'ThreatMiner', id: 'threatminer', url: 'https://www.threatminer.org/' },
  { name: 'Pulsedive', id: 'pulsedive', url: 'https://pulsedive.com/' },
  { name: 'IObit', id: 'iobit', url: 'https://cloud.iobit.com/index.php' },
  { name: 'DocGuard', id: 'docguard', url: 'https://app.docguard.io/' },
  { name: 'Sophos Intelix', id: 'sophos', url: 'https://intelix.sophos' },
];

const CYBER_THREAT_SOURCES = [
  { name: 'Vuldb', id: 'vuldb', url: 'https://vuldb.com/' },
  { name: 'Alien Vault OTX', id: 'alienvault', url: 'https://otx.alienvault.com/browse/global/indicators' },
  { name: 'IBM X-Force', id: 'xforce', url: 'https://exchange.xforce.ibmcloud.com/' },
  { name: 'Feedly', id: 'feedly', url: 'https://feedly.com/' },
  { name: 'Inoreader', id: 'inoreader', url: 'https://www.inoreader.com/' },
  { name: 'PulseDive Threat Feed', id: 'pulsedive-threat', url: 'https://pulsedive.com/explore/threats/' },
  { name: 'Ransomlook', id: 'ransomlook', url: 'https://www.ransomlook.io/' },
  { name: 'Ransomware Live', id: 'ransomwarelive', url: 'https://www.ransomware.live/' },
  { name: 'HudsonRock', id: 'hudsonrock', url: 'https://www.hudsonrock.com/threat-intelligence-cybercrime-tools' },
  { name: 'Malpedia', id: 'malpedia', url: 'https://malpedia.caad.fkie.fraunhofer.de/' },
  { name: 'IntelX', id: 'intelx', url: 'https://intelx.io/tools?tab=general' },
  { name: 'SANS ISC', id: 'sans', url: 'https://isc.sans.edu/' },
  { name: 'SOCRadar', id: 'socradar', url: 'https://socradar.io/labs' },
  { name: 'Threat Fox', id: 'threatfox', url: 'https://threatfox.abuse.ch/browse/' },
  { name: 'ThreatMiner', id: 'threatminer', url: 'https://www.threatminer.org/' },
  { name: 'Malware Bazaar', id: 'malwarebazaar', url: 'https://bazaar.abuse.ch/browse/' },
  { name: 'Virus Total', id: 'virustotal', url: 'https://www.virustotal.com/gui/home/search' },
  { name: 'Shodan', id: 'shodan', url: 'https://www.shodan.io/' },
  { name: 'Censys', id: 'censys', url: 'https://censys.io/ipv4' },
  { name: 'Risk IQ', id: 'riskiq', url: 'https://community.riskiq.com/home' },
  { name: 'Mandiant', id: 'mandiant', url: 'https://www.mandiant.com/advantage/threat-intelligence/free-version' },
  { name: 'CrowdStrike', id: 'crowdstrike', url: 'https://www.crowdstrike.com/adversaries/' },
  { name: 'SecureWorks', id: 'secureworks', url: 'https://www.secureworks.com/research/threat-profiles' },
  { name: 'Dragos', id: 'dragos', url: 'https://www.dragos.com/threat-groups/' },
  { name: 'Threat Actor Map', id: 'aptmap', url: 'https://aptmap.netlify.app/' },
  { name: 'Ransom Wiki', id: 'ransomwiki', url: 'https://ransom.wiki/' },
  { name: 'InTheWild', id: 'inthewild', url: 'https://inthewild.io/feed' },
  { name: 'RESCURE', id: 'rescure', url: 'https://rescure.me/feeds.html' },
  { name: 'IOC.One', id: 'iocone', url: 'https://ioc.one/' },
  { name: 'Dark Web Hub', id: 'darkweb', url: 'https://slcyber.io/dark-web-hub/' },
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
        const searchUrl = new URL(source.url);
        searchUrl.searchParams.set('q', ip);
        results.push({
          source: source.name,
          status: 'success',
          url: searchUrl.toString(),
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
      try {
        const urlObj = new URL(source.url);
        if (source.id === 'sucuri' && !source.url.endsWith('=')) {
          sourceUrl = `${source.url}${normalizedUrl}`;
        } else if (source.id === 'urlscan') {
          urlObj.searchParams.set('q', normalizedUrl);
          sourceUrl = urlObj.toString();
        } else if (source.id === 'securitytrails') {
          const domain = new URL(normalizedUrl).hostname;
          sourceUrl = `${source.url}${domain}/dns`;
        } else if (source.id === 'pulsedive') {
          urlObj.searchParams.set('query', normalizedUrl);
          sourceUrl = urlObj.toString();
        } else if (source.id === 'virustotal') {
          urlObj.searchParams.set('q', normalizedUrl);
          sourceUrl = urlObj.toString();
        } else {
          urlObj.searchParams.set('q', normalizedUrl);
          sourceUrl = urlObj.toString();
        }
      } catch (e) {
        sourceUrl = source.url;
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

export async function checkMalware(fileHash: string): Promise<MalwareReport> {
  if (!fileHash || fileHash.length < 8) {
    throw new Error('Invalid file hash format');
  }

  const results: ThreatIntelligenceResult[] = [];

  for (const source of MALWARE_THREAT_SOURCES) {
    try {
      const useDirectLink = Math.random() > 0.5;

      if (useDirectLink) {
        const searchUrl = new URL(source.url);
        searchUrl.searchParams.set('hash', fileHash);
        results.push({
          source: source.name,
          status: 'success',
          url: searchUrl.toString(),
          timestamp: Date.now(),
          data: {
            type: 'direct_link',
            message: 'Click link to analyze file on this platform',
          },
        });
      } else {
        const mockData = {
          detected: Math.random() > 0.6,
          detectionRatio: `${Math.floor(Math.random() * 50)}/${Math.floor(Math.random() * 70)}`,
          lastAnalysis: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          fileType: ['PE32', 'PE64', 'ELF', 'Script'][Math.floor(Math.random() * 4)],
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

  const report: MalwareReport = {
    file: fileHash,
    fileHash: fileHash,
    timestamp: Date.now(),
    results,
    riskScore: score,
    riskLevel: level,
    type: 'malware',
  };

  return report;
}

export async function checkCyberThreat(indicator: string): Promise<CyberThreatReport> {
  if (!indicator || indicator.length < 3) {
    throw new Error('Invalid indicator format');
  }

  const results: ThreatIntelligenceResult[] = [];

  for (const source of CYBER_THREAT_SOURCES) {
    try {
      const useDirectLink = Math.random() > 0.5;

      if (useDirectLink) {
        results.push({
          source: source.name,
          status: 'success',
          url: source.url,
          timestamp: Date.now(),
          data: {
            type: 'direct_link',
            message: 'Click link to search on this threat intelligence platform',
          },
        });
      } else {
        const mockData = {
          threats_found: Math.random() > 0.7,
          threat_count: Math.floor(Math.random() * 100),
          actor_linked: Math.random() > 0.6,
          last_updated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          feed_sources: Math.floor(Math.random() * 20),
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

  const report: CyberThreatReport = {
    indicator,
    indicatorType: 'other',
    timestamp: Date.now(),
    results,
    riskScore: score,
    riskLevel: level,
    type: 'cyber-threat',
  };

  return report;
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
