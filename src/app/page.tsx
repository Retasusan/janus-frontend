import Link from "next/link";
import { auth0 } from "@/app/lib/auth0";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";

export default async function Home() {
  const session = await auth0.getSession();

  // ログイン済みの場合はアプリにリダイレクト
  if (session) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation isLoggedIn={true} />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">おかえりなさい、{session.user.name}さん！</h1>
          <p className="text-muted-foreground mb-8">アプリケーションを使用するには下のボタンをクリックしてください。</p>
          <div className="space-x-4">
            <Link
              href="/app"
              className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              アプリを開く
            </Link>
            <Link
              href="/auth/logout"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              ログアウト
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 未ログインページ - Discord風ランディングページ
  return (
    <div className="min-h-screen bg-background">
      <Navigation isLoggedIn={false} />
      <Hero />
      <Features />
      <Footer />
    </div>
  );
}
