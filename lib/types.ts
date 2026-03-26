export interface ThreatIntelligenceResult {
  source: string;
  status: 'success' | 'error' | 'pending';
  data?: Record<string, any>;
  error?: string;
  url?: string;
  timestamp: number;
}

export interface IPReport {
  ip: string;
  timestamp: number;
  results: ThreatIntelligenceResult[];
  riskScore: number; // 0-100
  riskLevel: 'safe' | 'suspicious' | 'malicious';
  type: 'ip';
}

export interface URLReport {
  url: string;
  timestamp: number;
  results: ThreatIntelligenceResult[];
  riskScore: number; // 0-100
  riskLevel: 'safe' | 'suspicious' | 'malicious';
  type: 'url';
}

export type ThreatReport = IPReport | URLReport;

export interface CheckHistory {
  id: string;
  query: string; // IP or URL
  type: 'ip' | 'url';
  timestamp: number;
  riskScore: number;
  riskLevel: 'safe' | 'suspicious' | 'malicious';
}

export interface APIConfig {
  virusTotal?: string;
  abuseIPDB?: string;
  shodan?: string;
  ipinfo?: string;
  pulsedive?: string;
  greynoise?: string;
}
