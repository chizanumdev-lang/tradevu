import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    weeklyGoal: 10,
    conversions: 10,
    conversations: 28,
    conversionRate: 32
  });
}
