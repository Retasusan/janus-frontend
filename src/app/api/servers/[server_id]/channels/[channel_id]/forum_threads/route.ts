import { NextRequest } from 'next/server';
import { withAuthProxy } from '@/lib/utils';

export async function GET(req: NextRequest, context: { params: Promise<{ server_id: string; channel_id: string }> }) {
  const params = await context.params;
  return withAuthProxy(req, `/api/v1/servers/${params.server_id}/channels/${params.channel_id}/forum_threads`);
}

export async function POST(req: NextRequest, context: { params: Promise<{ server_id: string; channel_id: string }> }) {
  const params = await context.params;
  const body = await req.text();
  return withAuthProxy(req, `/api/v1/servers/${params.server_id}/channels/${params.channel_id}/forum_threads`, { method: 'POST', body, headers: { 'Content-Type': 'application/json' } });
}
