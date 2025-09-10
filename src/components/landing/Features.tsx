import { MessageSquare, FolderOpen, Users, FileText, Zap } from "lucide-react";

const features = [
  {
    name: "リアルタイムチャット",
    description: "テキストチャンネルでリアルタイムにメッセージを送受信。グループでの会話を整理。",
    icon: MessageSquare,
  },
  {
    name: "ファイル共有",
    description: "ドキュメント、画像、その他のファイルを簡単にアップロード・共有。",
    icon: FileText,
  },
  {
    name: "カレンダー機能",
    description: "イベントやスケジュールを管理。チーム全体で予定を共有。",
    icon: FolderOpen,
  },
  {
    name: "サーバー管理",
    description: "複数のサーバーとチャンネルを作成・管理。用途別に整理して使用。",
    icon: Users,
  },
  {
    name: "簡単セットアップ",
    description: "3分で環境を構築。複雑な設定は不要で、すぐに使い始められます。",
    icon: Zap,
  },
];

export function Features() {
  return (
    <section className="py-24 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">シンプルで使いやすい</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            必要な機能だけを厳選
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            チャット、ファイル共有、カレンダーなど、コミュニケーションに必要な基本機能を提供。
            シンプルで直感的な操作で、すぐに使い始められます。
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2 xl:grid-cols-3">
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