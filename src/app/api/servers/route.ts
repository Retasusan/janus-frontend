// app/api/servers/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/app/lib/auth0";

export async function GET() {
  const session = await auth0.getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiRes = await fetch("http://localhost:8000/api/v1/servers", {
    headers: {
      Authorization: `Bearer ${session.tokenSet.accessToken}`,
    },
  });

  const data = await apiRes.json();
  return NextResponse.json(data, { status: apiRes.status });
}

export async function POST(req: NextRequest) {
  const session = await auth0.getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const apiRes = await fetch("http://localhost:8000/api/v1/servers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.tokenSet.accessToken}`,
    },
    body: JSON.stringify(body),
  });

  const data = await apiRes.json();
  return NextResponse.json(data, { status: apiRes.status });
}
