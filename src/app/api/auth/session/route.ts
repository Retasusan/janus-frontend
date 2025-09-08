import { NextResponse } from "next/server";
import { auth0 } from "@/app/lib/auth0";

export async function GET() {
  const session = await auth0.getSession();

  if (!session) return NextResponse.json({ loggedIn: false });

  return NextResponse.json({
    loggedIn: true,
    user: session.user,
    token: session.tokenSet.accessToken,
  });
}
