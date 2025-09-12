// app/api/servers/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/app/lib/auth0";

export async function GET() {
  // In App Router route handlers, call getSession() with no args so the SDK reads cookies via next/headers
  const session = await auth0.getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Forward to backend with Bearer token
  const apiRes = await fetch("http://localhost:8000/api/v1/servers", {
    headers: {
      Authorization: `Bearer ${session.tokenSet.accessToken}`,
    },
  });

  const data = await apiRes.json();
  return NextResponse.json(data, { status: apiRes.status });
}

export async function POST(request: NextRequest) {
  const session = await auth0.getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
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
