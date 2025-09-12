import { type NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/app/lib/auth0";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ server_id: string; channel_id: string; file_id: string }> },
) {
  const { server_id, channel_id, file_id } = await context.params;
  const session = await auth0.getSession();
  if (!session?.tokenSet?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const backend = `${process.env.BACKEND_URL}/api/v1/servers/${server_id}/channels/${channel_id}/files/${file_id}/download`;
  const res = await fetch(backend, {
    headers: { Authorization: `Bearer ${session.tokenSet.accessToken}` },
    redirect: "manual",
  });
  // Backendは署名URLへリダイレクトするため、そのLocationを転送
  const location = res.headers.get("location");
  if (location && res.status >= 300 && res.status < 400) {
    return NextResponse.redirect(location, 302);
  }
  const data = await res.text();
  return new NextResponse(data, { status: res.status });
}
