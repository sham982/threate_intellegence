import { NextRequest, NextResponse } from 'next/server';
import { checkIP, checkURL, checkMalware, checkCyberThreat } from '@/lib/threat-checker';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ip, url, malware, 'cyber-threat': cyberThreat } = body;

    if (ip) {
      const report = await checkIP(ip);
      return NextResponse.json(report);
    } else if (url) {
      const report = await checkURL(url);
      return NextResponse.json(report);
    } else if (malware) {
      const report = await checkMalware(malware);
      return NextResponse.json(report);
    } else if (cyberThreat) {
      const report = await checkCyberThreat(cyberThreat);
      return NextResponse.json(report);
    } else {
      return NextResponse.json(
        { error: 'IP, URL, malware hash, or cyber threat indicator is required' },
        { status: 400 }
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
