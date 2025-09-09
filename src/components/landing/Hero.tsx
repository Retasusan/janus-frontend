import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20 py-20 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            チームワークを
            <span className="text-primary"> 革新する</span>
            <br />
            コラボレーションプラットフォーム
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
            リアルタイムチャット、プロジェクト管理、ファイル共有など、チームが必要とするすべての機能を一つのプラットフォームで。
            生産性を向上させ、コミュニケーションを円滑にします。
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/auth/login?screen_hint=signup"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            >
              無料で始める
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <button className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-base font-semibold hover:bg-accent hover:text-accent-foreground transition-colors">
              <Play className="mr-2 h-4 w-4" />
              デモを見る
            </button>
          </div>
          <div className="mt-16 flow-root sm:mt-24">
            <div className="relative rounded-xl bg-muted/50 p-2 ring-1 ring-inset ring-border lg:rounded-2xl lg:p-4">
              <div className="aspect-video rounded-lg bg-background shadow-2xl ring-1 ring-border">
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <Play className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-sm">アプリケーションのプレビュー</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}