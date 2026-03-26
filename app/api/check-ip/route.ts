import { NextRequest, NextResponse } from 'next/server';
import { checkIP } from '@/lib/threat-checker';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ip } = body;

    if (!ip) {
      return NextResponse.json(
        { error: 'IP address is required' },
        { status: 400 }
      );
    }

    const report = await checkIP(ip);
    return NextResponse.json(report);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
