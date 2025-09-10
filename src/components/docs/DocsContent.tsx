import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export function DocsContent() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <h1 className="text-4xl font-bold">ドキュメント</h1>
          <Badge variant="secondary">v1.0</Badge>
        </div>
        <p className="text-xl text-muted-foreground">
          チャット、ファイル共有、カレンダー機能の使い方ガイド
        </p>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>🚀 基本的な使い方</CardTitle>
            <CardDescription>
              サーバーとチャンネルの作成
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              サーバーを作成し、チャンネルを追加して基本的な機能を使い始める方法を説明します。
            </p>
            <Link 
              href="/docs/getting-started" 
              className="text-sm font-medium text-primary hover:underline"
            >
              使い方を見る →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>💬 テキストチャット</CardTitle>
            <CardDescription>
              メッセージの送受信
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              テキストチャンネルでメッセージを送信し、リアルタイムで会話する方法を学びます。
            </p>
            <Link 
              href="/docs/text-chat" 
              className="text-sm font-medium text-primary hover:underline"
            >
              テキストチャットを見る →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📁 ファイル共有</CardTitle>
            <CardDescription>
              ファイルのアップロードと管理
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              ファイル共有チャンネルでファイルをアップロード・ダウンロードする方法を説明します。
            </p>
            <Link 
              href="/docs/file-sharing" 
              className="text-sm font-medium text-primary hover:underline"
            >
              ファイル共有を見る →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📅 カレンダー</CardTitle>
            <CardDescription>
              イベントとスケジュール管理
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              カレンダーチャンネルでイベントを作成し、スケジュールを管理する方法を紹介します。
            </p>
            <Link 
              href="/docs/calendar" 
              className="text-sm font-medium text-primary hover:underline"
            >
              カレンダーを見る →
            </Link>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📋 利用可能な機能
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>テキストチャット（メッセージ送受信）</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>ファイル共有（アップロード・ダウンロード）</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span>カレンダー（イベント作成・管理）</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span>サーバー・チャンネル管理</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <h2 className="text-2xl font-bold mb-4">機能別ガイド</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold">
              <Link href="/docs/getting-started" className="hover:underline">
                基本的な使い方
              </Link>
            </h3>
            <p className="text-sm text-muted-foreground">
              サーバー作成からチャンネル追加まで、基本操作を学ぶ
            </p>
          </div>
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold">
              <Link href="/docs/text-chat" className="hover:underline">
                テキストチャット
              </Link>
            </h3>
            <p className="text-sm text-muted-foreground">
              メッセージの送信とリアルタイム会話の方法
            </p>
          </div>
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold">
              <Link href="/docs/file-sharing" className="hover:underline">
                ファイル共有
              </Link>
            </h3>
            <p className="text-sm text-muted-foreground">
              ファイルのアップロード・ダウンロード・管理
            </p>
          </div>
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold">
              <Link href="/docs/calendar" className="hover:underline">
                カレンダー機能
              </Link>
            </h3>
            <p className="text-sm text-muted-foreground">
              イベント作成とスケジュール管理の使い方
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 border">
        <h2 className="text-xl font-semibold mb-2">🚀 実装済み機能</h2>
        <p className="text-muted-foreground mb-4">
          現在利用可能な機能をご紹介します。
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">💬</div>
            <div className="text-sm text-muted-foreground">テキストチャット</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">📁</div>
            <div className="text-sm text-muted-foreground">ファイル共有</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">📅</div>
            <div className="text-sm text-muted-foreground">カレンダー</div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <Link 
            href="/auth/login?screen_hint=signup" 
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            無料で始める
          </Link>
        </div>
      </div>
    </div>
  );
}