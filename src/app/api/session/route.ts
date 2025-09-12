import { auth0 } from "@/app/lib/auth0";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ user: null, tokenSet: null }, { status: 200 });
    }
    // Return user and tokenSet for debugging
    return NextResponse.json({ user: session.user, tokenSet: session.tokenSet }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
