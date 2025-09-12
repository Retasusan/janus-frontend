import { type NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/app/lib/auth0";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ server_id: string; channel_id: string }> },
) {
  const { server_id, channel_id } = await context.params;
  const session = await auth0.getSession();
  if (!session?.tokenSet?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/servers/${server_id}/channels/${channel_id}/files`,
    { headers: { Authorization: `Bearer ${session.tokenSet.accessToken}` } },
  );
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ server_id: string; channel_id: string }> },
) {
  const { server_id, channel_id } = await context.params;
  const session = await auth0.getSession();
  if (!session?.tokenSet?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const formData = await req.formData();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/servers/${server_id}/channels/${channel_id}/files`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${session.tokenSet.accessToken}` },
      body: formData as any,
    },
  );
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
