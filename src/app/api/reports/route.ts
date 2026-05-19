import { NextResponse } from 'next/server';
import { generateReport } from '@/lib/reports';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module') as any || 'all';
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    
    const report = await generateReport(module, startDate, endDate);
    
    return NextResponse.json(report);
  } catch (error: any) {
    console.error('Report Generation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
