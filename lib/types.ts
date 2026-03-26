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

export interface MalwareReport {
  file: string;
  fileHash?: string;
  timestamp: number;
  results: ThreatIntelligenceResult[];
  riskScore: number; // 0-100
  riskLevel: 'safe' | 'suspicious' | 'malicious';
  type: 'malware';
}

export interface CyberThreatReport {
  indicator: string;
  indicatorType: 'hash' | 'ip' | 'domain' | 'cve' | 'other';
  timestamp: number;
  results: ThreatIntelligenceResult[];
  riskScore: number; // 0-100
  riskLevel: 'safe' | 'suspicious' | 'malicious';
  type: 'cyber-threat';
}

export type ThreatReport = IPReport | URLReport | MalwareReport | CyberThreatReport;

export interface CheckHistory {
  id: string;
  query: string; // IP, URL, file hash, or indicator
  type: 'ip' | 'url' | 'malware' | 'cyber-threat';
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
