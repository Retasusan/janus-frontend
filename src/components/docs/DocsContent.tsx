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
          YourAppの使い方、機能、APIについて詳しく説明します。
        </p>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>🚀 クイックスタート</CardTitle>
            <CardDescription>
              5分でYourAppを始める方法
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              アカウント作成からチーム設定まで、すぐに使い始められるガイドです。
            </p>
            <Link 
              href="/docs/quickstart" 
              className="text-sm font-medium text-primary hover:underline"
            >
              クイックスタートを見る →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>💬 チャット機能</CardTitle>
            <CardDescription>
              リアルタイムコミュニケーション
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              チャンネル作成、メッセージ送信、ファイル共有などの基本操作を学びます。
            </p>
            <Link 
              href="/docs/chat" 
              className="text-sm font-medium text-primary hover:underline"
            >
              チャット機能を見る →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📋 プロジェクト管理</CardTitle>
            <CardDescription>
              タスクとプロジェクトの管理
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              プロジェクト作成、タスク割り当て、進捗管理の方法を説明します。
            </p>
            <Link 
              href="/docs/projects" 
              className="text-sm font-medium text-primary hover:underline"
            >
              プロジェクト管理を見る →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🔌 API リファレンス</CardTitle>
            <CardDescription>
              開発者向けAPI仕様
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              REST API、WebSocket、認証方法などの技術仕様を提供します。
            </p>
            <Link 
              href="/docs/api" 
              className="text-sm font-medium text-primary hover:underline"
            >
              API仕様を見る →
            </Link>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <h2 className="text-2xl font-bold mb-4">人気のトピック</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold">
              <Link href="/docs/installation" className="hover:underline">
                インストールとセットアップ
              </Link>
            </h3>
            <p className="text-sm text-muted-foreground">
              YourAppをインストールして初期設定を行う方法
            </p>
          </div>
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold">
              <Link href="/docs/plugins" className="hover:underline">
                プラグインシステム
              </Link>
            </h3>
            <p className="text-sm text-muted-foreground">
              カスタムプラグインの作成と管理方法
            </p>
          </div>
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold">
              <Link href="/docs/security" className="hover:underline">
                セキュリティ設定
              </Link>
            </h3>
            <p className="text-sm text-muted-foreground">
              安全なチーム環境を構築するためのセキュリティ設定
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <div className="bg-muted/50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-2">サポートが必要ですか？</h2>
        <p className="text-muted-foreground mb-4">
          ドキュメントで解決できない問題がある場合は、お気軽にお問い合わせください。
        </p>
        <div className="flex space-x-4">
          <Link 
            href="/support" 
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            サポートに連絡
          </Link>
          <Link 
            href="/community" 
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            コミュニティ
          </Link>
        </div>
      </div>
    </div>
  );
}