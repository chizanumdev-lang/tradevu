import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    goal: 1000000,
    current: 750000,
    percentage: 75
  });
}
