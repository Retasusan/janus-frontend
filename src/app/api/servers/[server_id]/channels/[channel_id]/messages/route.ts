import { type NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/app/lib/auth0";

// GET ハンドラ
export async function GET(
  //biome-ignore lint: request is unused but required
  req: NextRequest, // ← NextRequestは使用しないが、必須
  { params }: { params: { server_id: string; channel_id: string } },
) {
  const { server_id, channel_id } = params;

  const session = await auth0.getSession();
  if (!session?.tokenSet?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(
      `http://localhost:8000/api/v1/servers/${server_id}/channels/${channel_id}/messages`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.tokenSet.accessToken}`,
        },
      },
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST ハンドラ
export async function POST(
  req: NextRequest,
  { params }: { params: { server_id: string; channel_id: string } },
) {
  const { server_id, channel_id } = params;

  const session = await auth0.getSession();
  if (!session?.tokenSet?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  try {
    const res = await fetch(
      `http://localhost:8000/api/v1/servers/${server_id}/channels/${channel_id}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.tokenSet.accessToken}`,
        },
        body: JSON.stringify(body),
      },
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
