import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    weeklyGoal: 10,
    unitsCompleted: 10,
    visits: 89,
    conversionRate: 45
  });
}
