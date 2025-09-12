import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/app/lib/auth0";

export async function PUT(request: NextRequest) {
  try {
    const session = await auth0.getSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, avatar } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // ここでは、フロントエンド側で一時的にユーザー情報を更新
    // 実際のプロダクションでは、バックエンドのユーザーテーブルを更新する必要があります
    
    // Auth0のユーザーメタデータを更新する場合の実装例：
    // Management APIを使用してユーザープロフィールを更新
    
    return NextResponse.json({ 
      success: true,
      user: {
        ...session.user,
        name: name.trim(),
        picture: avatar
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
