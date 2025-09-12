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

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/servers/${server_id}/channels/${channel_id}/messages`,
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

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/servers/${server_id}/channels/${channel_id}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.tokenSet.accessToken}`,
        },
        body: JSON.stringify(body),
      },
    );

    if (res.ok) {
      // 投稿成功後、最新のメッセージ一覧を取得
      const messagesRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/servers/${server_id}/channels/${channel_id}/messages`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.tokenSet.accessToken}`,
          },
        },
      );
      const messagesData = await messagesRes.json();
      return NextResponse.json(messagesData, { status: 200 });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// WebSocket通知関数（実装例）
async function notifyClients(serverId: string, channelId: string, messageData: any) {
  // WebSocketサーバーに新しいメッセージを送信
  // または外部のリアルタイム通信サービスを使用
}
