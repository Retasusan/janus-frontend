import { type NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/app/lib/auth0";

export async function POST(req: NextRequest) {
  const session = await auth0.getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const apiRes = await fetch(`${process.env.BACKEND_URL}/api/v1/servers/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.tokenSet.accessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      console.error("Backend error response:", errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json(errorData, { status: apiRes.status });
      } catch {
        return NextResponse.json(
          { error: "Backend server error" }, 
          { status: apiRes.status }
        );
      }
    }

    const data = await apiRes.json();
    return NextResponse.json(data, { status: apiRes.status });
  } catch (err: any) {
    console.error("API route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}