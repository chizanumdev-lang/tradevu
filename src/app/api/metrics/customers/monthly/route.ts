import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    current: 342,
    previous: 305,
    percentageChange: 12
  });
}
