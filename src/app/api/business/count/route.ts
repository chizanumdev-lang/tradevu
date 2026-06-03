import { NextResponse } from 'next/server';

const API_BASE = process.env.TRADEVU_API_BASE ?? 'https://sandbox.tradevu.co';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const upstreamUrl = new URL(`${API_BASE}/v1/business/count`);
    if (status) upstreamUrl.searchParams.set('status', status);

    const res = await fetch(upstreamUrl.toString(), {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Upstream error', status: res.status }, { status: res.status });
    }

    const json = await res.json();
    return NextResponse.json(json);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
