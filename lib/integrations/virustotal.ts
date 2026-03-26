/**
 * VirusTotal API Integration
 * Free tier: 4 requests per minute
 * API Docs: https://developers.virustotal.com/reference
 */

interface VTIPResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      last_dns_records?: Array<{ type: string; value: string }>;
      last_analysis_stats: {
        malicious: number;
        suspicious: number;
        undetected: number;
        harmless: number;
      };
      country?: string;
      city?: string;
      last_dns_records_date?: number;
    };
  };
}

/**
 * Check IP address on VirusTotal
 */
export async function checkIPWithVirusTotal(ip: string): Promise<{
  malicious: number;
  suspicious: number;
  harmless: number;
  undetected: number;
  lastAnalysis: string;
  country?: string;
}> {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;

  if (!apiKey) {
    throw new Error('VirusTotal API key not configured. Add VIRUSTOTAL_API_KEY to environment variables.');
  }

  try {
    const response = await fetch(`https://www.virustotal.com/api/v3/ip_addresses/${ip}`, {
      method: 'GET',
      headers: {
        'x-apikey': apiKey,
        'Accept': 'application/json',
      },
    });

    if (response.status === 404) {
      // IP not found, but not an error
      return {
        malicious: 0,
        suspicious: 0,
        harmless: 0,
        undetected: 0,
        lastAnalysis: new Date().toISOString(),
        country: 'Unknown',
      };
    }

    if (!response.ok) {
      throw new Error(`VirusTotal API error: ${response.status} ${response.statusText}`);
    }

    const data: VTIPResponse = await response.json();
    const stats = data.data.attributes.last_analysis_stats;

    return {
      malicious: stats.malicious,
      suspicious: stats.suspicious,
      harmless: stats.harmless,
      undetected: stats.undetected,
      lastAnalysis: new Date().toISOString(),
      country: data.data.attributes.country,
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error('Unknown VirusTotal API error');
  }
}

/**
 * Check URL on VirusTotal
 */
export async function checkURLWithVirusTotal(url: string): Promise<{
  malicious: number;
  suspicious: number;
  harmless: number;
  enginesDetected: number;
  lastAnalysis: string;
}> {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;

  if (!apiKey) {
    throw new Error('VirusTotal API key not configured');
  }

  try {
    // VirusTotal URL ID encoding: base64url without padding
    const urlId = Buffer.from(url).toString('base64').replace(/=/g, '');

    const response = await fetch(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
      method: 'GET',
      headers: {
        'x-apikey': apiKey,
        'Accept': 'application/json',
      },
    });

    if (response.status === 404) {
      return {
        malicious: 0,
        suspicious: 0,
        harmless: 0,
        enginesDetected: 0,
        lastAnalysis: new Date().toISOString(),
      };
    }

    if (!response.ok) {
      throw new Error(`VirusTotal API error: ${response.status}`);
    }

    const data: VTIPResponse = await response.json();
    const stats = data.data.attributes.last_analysis_stats;

    return {
      malicious: stats.malicious,
      suspicious: stats.suspicious,
      harmless: stats.harmless,
      enginesDetected: stats.malicious + stats.suspicious,
      lastAnalysis: new Date().toISOString(),
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error('Unknown VirusTotal API error');
  }
}

/**
 * Check file hash on VirusTotal
 */
export async function checkFileWithVirusTotal(fileHash: string): Promise<{
  detected: boolean;
  detectionRatio: string;
  lastAnalysis: string;
  fileType?: string;
}> {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;

  if (!apiKey) {
    throw new Error('VirusTotal API key not configured');
  }

  try {
    const response = await fetch(`https://www.virustotal.com/api/v3/files/${fileHash}`, {
      method: 'GET',
      headers: {
        'x-apikey': apiKey,
        'Accept': 'application/json',
      },
    });

    if (response.status === 404) {
      return {
        detected: false,
        detectionRatio: '0/0',
        lastAnalysis: new Date().toISOString(),
      };
    }

    if (!response.ok) {
      throw new Error(`VirusTotal API error: ${response.status}`);
    }

    const data: VTIPResponse = await response.json();
    const stats = data.data.attributes.last_analysis_stats;
    const detected = stats.malicious > 0 || stats.suspicious > 0;
    const total = stats.malicious + stats.suspicious + stats.undetected + stats.harmless;

    return {
      detected,
      detectionRatio: `${stats.malicious + stats.suspicious}/${total}`,
      lastAnalysis: new Date().toISOString(),
      fileType: data.data.attributes.country, // Placeholder, actual type would be in attributes
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error('Unknown VirusTotal API error');
  }
}
