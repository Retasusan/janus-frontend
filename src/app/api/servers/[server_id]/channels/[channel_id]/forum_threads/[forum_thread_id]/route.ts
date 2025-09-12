import { NextRequest } from 'next/server';
import { withAuthProxy } from '@/lib/utils';

export async function GET(req: NextRequest, context: { params: Promise<{ server_id: string; channel_id: string; forum_thread_id: string }> }) {
  const params = await context.params;
  return withAuthProxy(req, `/api/v1/servers/${params.server_id}/channels/${params.channel_id}/forum_threads/${params.forum_thread_id}`);
}
