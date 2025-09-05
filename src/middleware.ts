import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0 } from "@/app/lib/auth0";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // _next や favicon 等はスキップ
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/sitemap.xml") ||
    pathname.startsWith("/robots.txt")
  ) {
    return NextResponse.next();
  }

  // /app 以下だけ保護
  if (pathname.startsWith("/app")) {
    const session = await auth0.getSession(request);

    if (!session?.user) {
      // 未ログインなら / にリダイレクト
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // それ以外は放置
  return await auth0.middleware(request);
}

export const config = {
  matcher: [
    // _next, favicon, sitemap, robots を除いたすべてのパス
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
