import { NextResponse } from "next/server";
import { auth0 } from "@/app/lib/auth0";

export async function GET() {
  try {
    const session = await auth0.getSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ユーザー情報を返す
    return NextResponse.json({
      sub: session.user.sub,
      name: session.user.name,
      email: session.user.email,
      picture: session.user.picture,
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
