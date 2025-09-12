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
  const url = new URL(req.url);
  const search = url.searchParams.toString();
  const apiUrl = `${process.env.BACKEND_URL}/api/v1/servers/${server_id}/channels/${channel_id}/events${search ? `?${search}` : ""}`;
  const res = await fetch(apiUrl, {
    headers: { Authorization: `Bearer ${session.tokenSet.accessToken}` },
  });
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
  const body = await req.json();
  // Map keys: startDate -> start_at, endDate -> end_at, allDay -> all_day
  const mapped = {
    title: body.title,
    description: body.description,
    start_at: body.startDate,
    end_at: body.endDate,
    all_day: !!body.allDay,
  };
  const payload = { event: mapped };

  const res = await fetch(
    `${process.env.BACKEND_URL}/api/v1/servers/${server_id}/channels/${channel_id}/events`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.tokenSet.accessToken}`,
      },
      body: JSON.stringify(payload),
    },
  );
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
