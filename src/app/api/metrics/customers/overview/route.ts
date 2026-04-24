import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    totalCustomers: 8901,
    verifiedUsers: 8901,
    activeTrialUsers: 1240
  });
}
