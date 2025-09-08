import { type NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/app/lib/auth0";

export async function GET(
  _req: NextRequest,
  { params }: { params: { server_id: string } },
) {
  const session = await auth0.getSession();
  if (!session?.tokenSet?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(
      `http://localhost:8000/api/v1/servers/${params.server_id}/channels`,
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
  { params }: { params: { server_id: string } },
) {
  const session = await auth0.getSession(); // req を渡さない
  if (!session?.tokenSet?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  try {
    const res = await fetch(
      `http://localhost:8000/api/v1/servers/${params.server_id}/channels`,
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
