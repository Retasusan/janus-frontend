import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/app/lib/auth0";

async function proxy(req: NextRequest, path: string[]) {
  const session = await auth0.getSession();
  if (!session?.tokenSet?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const backendBase =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_URL ||
    "http://localhost:8000";
  const search = req.nextUrl.search;
  const target = `${backendBase}/api/v1/servers/${path.join("/")}${search}`;

  // Build headers and carry over common headers
  const headers = new Headers();
  headers.set("Authorization", `Bearer ${session.tokenSet.accessToken}`);
  const ct = req.headers.get("content-type");
  if (ct) headers.set("Content-Type", ct);
  const accept = req.headers.get("accept");
  if (accept) headers.set("Accept", accept);

  const init: RequestInit & { duplex?: "half" } = {
    method: req.method,
    headers,
    redirect: "manual",
  };
  if (!["GET", "HEAD"].includes(req.method)) {
    // Stream body as-is to support JSON and multipart
    init.duplex = "half";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (init as any).body = req.body as any;
  }

  const res = await fetch(target, init);

  // Handle redirect (e.g., file download)
  const location = res.headers.get("location");
  if (location && res.status >= 300 && res.status < 400) {
    return NextResponse.redirect(location, 302);
  }

  const contentType = res.headers.get("content-type") || "application/json";
  const text = await res.text();
  return new NextResponse(text, { status: res.status, headers: { "Content-Type": contentType } });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, (await params).path);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, (await params).path);
}

export async function HEAD(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, (await params).path);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, (await params).path);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, (await params).path);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, (await params).path);
}
