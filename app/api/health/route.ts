import { NextResponse } from 'next/server';
import { VERSION } from '@/config/version';

export async function GET() {
  return NextResponse.json({ status: 'ok', version: VERSION });
}
