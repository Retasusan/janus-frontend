import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20 py-20 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            サークル運営を
            <span className="text-primary"> もっと簡単に</span>
            <br />
            管理プラットフォーム
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
            メンバー管理、イベント企画、連絡事項の共有など、サークル運営に必要な機能をすべて一つのプラットフォームで。
            面倒な管理作業を効率化し、活動に集中できます。
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/auth/login?screen_hint=signup"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            >
              無料で始める
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-base font-semibold hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              使い方を見る
            </Link>
          </div>
          <div className="mt-16 sm:mt-24">
            <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
              <div className="text-center p-6 rounded-lg bg-muted/30 border">
                <div className="text-3xl font-bold text-primary mb-2">3分</div>
                <div className="text-sm text-muted-foreground">セットアップ完了</div>
              </div>
              <div className="text-center p-6 rounded-lg bg-muted/30 border">
                <div className="text-3xl font-bold text-primary mb-2">リアルタイム</div>
                <div className="text-sm text-muted-foreground">メンバー連絡</div>
              </div>
              <div className="text-center p-6 rounded-lg bg-muted/30 border">
                <div className="text-3xl font-bold text-primary mb-2">簡単</div>
                <div className="text-sm text-muted-foreground">イベント管理</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}