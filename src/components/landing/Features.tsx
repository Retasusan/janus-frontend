import { MessageSquare, FolderOpen, Calendar, Users, FileText, Zap } from "lucide-react";

const features = [
  {
    name: "リアルタイムチャット",
    description: "チームメンバーとリアルタイムでコミュニケーション。チャンネル機能でトピック別に整理。",
    icon: MessageSquare,
  },
  {
    name: "プロジェクト管理",
    description: "タスクの作成、割り当て、進捗管理を一元化。チームの生産性を向上させます。",
    icon: FolderOpen,
  },
  {
    name: "カレンダー統合",
    description: "スケジュール管理とミーティング調整を簡単に。チーム全体の予定を把握。",
    icon: Calendar,
  },
  {
    name: "チーム管理",
    description: "メンバーの役割と権限を細かく設定。セキュアなチーム環境を構築。",
    icon: Users,
  },
  {
    name: "ファイル共有",
    description: "ドキュメントやファイルを安全に共有。バージョン管理機能付き。",
    icon: FileText,
  },
  {
    name: "高速パフォーマンス",
    description: "最新技術を使用した高速なアプリケーション。ストレスフリーな操作体験。",
    icon: Zap,
  },
];

export function Features() {
  return (
    <section className="py-24 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">すべてが揃っています</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            チームワークを加速する機能
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            現代のチームが必要とするすべての機能を一つのプラットフォームに統合。
            効率的なコラボレーションを実現します。
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                  <feature.icon className="h-5 w-5 flex-none text-primary" aria-hidden="true" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}