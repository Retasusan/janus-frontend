import { MessageSquare, FolderOpen, Calendar, Users, FileText, Zap, Shield, Globe, Smartphone, BarChart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    name: "リアルタイムチャット",
    description: "チームメンバーとリアルタイムでコミュニケーション。チャンネル機能でトピック別に整理し、効率的な情報共有を実現します。",
    icon: MessageSquare,
    details: [
      "無制限のチャンネル作成",
      "ファイル・画像の共有",
      "メンション機能",
      "検索機能",
      "メッセージ履歴"
    ]
  },
  {
    name: "プロジェクト管理",
    description: "タスクの作成、割り当て、進捗管理を一元化。チームの生産性を向上させ、プロジェクトを成功に導きます。",
    icon: FolderOpen,
    details: [
      "カンバンボード",
      "ガントチャート",
      "タスク割り当て",
      "期限管理",
      "進捗レポート"
    ]
  },
  {
    name: "カレンダー統合",
    description: "スケジュール管理とミーティング調整を簡単に。チーム全体の予定を把握し、効率的な時間管理を実現します。",
    icon: Calendar,
    details: [
      "共有カレンダー",
      "ミーティング予約",
      "リマインダー機能",
      "外部カレンダー連携",
      "空き時間検索"
    ]
  },
  {
    name: "チーム管理",
    description: "メンバーの役割と権限を細かく設定。セキュアなチーム環境を構築し、適切なアクセス制御を実現します。",
    icon: Users,
    details: [
      "役割ベースアクセス制御",
      "メンバー招待",
      "権限管理",
      "チーム階層",
      "アクティビティログ"
    ]
  },
  {
    name: "ファイル共有",
    description: "ドキュメントやファイルを安全に共有。バージョン管理機能付きで、常に最新の情報にアクセスできます。",
    icon: FileText,
    details: [
      "ドラッグ&ドロップアップロード",
      "バージョン管理",
      "アクセス権限設定",
      "プレビュー機能",
      "検索機能"
    ]
  },
  {
    name: "高速パフォーマンス",
    description: "最新技術を使用した高速なアプリケーション。ストレスフリーな操作体験で、生産性を最大化します。",
    icon: Zap,
    details: [
      "リアルタイム同期",
      "オフライン対応",
      "高速検索",
      "自動保存",
      "レスポンシブデザイン"
    ]
  },
  {
    name: "セキュリティ",
    description: "エンタープライズレベルのセキュリティ機能。データの安全性を確保し、安心してご利用いただけます。",
    icon: Shield,
    details: [
      "エンドツーエンド暗号化",
      "二要素認証",
      "SSO対応",
      "監査ログ",
      "データバックアップ"
    ]
  },
  {
    name: "グローバル対応",
    description: "多言語対応とタイムゾーン設定で、世界中のチームとスムーズにコラボレーションできます。",
    icon: Globe,
    details: [
      "多言語インターフェース",
      "タイムゾーン対応",
      "通貨設定",
      "地域別設定",
      "国際化対応"
    ]
  },
  {
    name: "モバイル対応",
    description: "iOS・Android対応のネイティブアプリで、いつでもどこでもチームとつながることができます。",
    icon: Smartphone,
    details: [
      "ネイティブアプリ",
      "プッシュ通知",
      "オフライン同期",
      "タッチ最適化",
      "音声・ビデオ通話"
    ]
  },
  {
    name: "分析・レポート",
    description: "詳細な分析機能でチームのパフォーマンスを可視化。データドリブンな意思決定をサポートします。",
    icon: BarChart,
    details: [
      "ダッシュボード",
      "カスタムレポート",
      "パフォーマンス分析",
      "使用状況統計",
      "データエクスポート"
    ]
  }
];

export function FeaturesDetail() {
  return (
    <div className="py-24 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            すべての機能
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            チームワークを革新する包括的な機能セット。
            生産性向上とスムーズなコラボレーションを実現します。
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.name} className="h-full">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.name}</CardTitle>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.details.map((detail, index) => (
                    <li key={index} className="flex items-center text-sm text-muted-foreground">
                      <div className="mr-2 h-1.5 w-1.5 rounded-full bg-primary"></div>
                      {detail}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">さらに詳しく知りたいですか？</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            各機能の詳細な使い方や設定方法については、ドキュメントをご覧ください。
            また、無料トライアルで実際に機能をお試しいただけます。
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="/docs"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              ドキュメントを見る
            </a>
            <a
              href="/auth/login?screen_hint=signup"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              無料で始める
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}