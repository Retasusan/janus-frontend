import { auth0 } from "@/app/lib/auth0";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 });
    }
    return NextResponse.json({ user: session.user }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
