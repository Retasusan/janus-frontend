import { type NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/app/lib/auth0";

export async function GET(
  _req: NextRequest,
  context: { params: { server_id: string } },
) {
  const { server_id } = await context.params;

  const session = await auth0.getSession();
  if (!session?.tokenSet?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(
      `http://localhost:8000/api/v1/servers/${server_id}/members`,
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