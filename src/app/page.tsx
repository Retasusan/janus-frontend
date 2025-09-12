"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight, Users, MessageSquare, FileText, Calendar, Zap, Sparkles, Globe, Shield, Cpu } from "lucide-react";

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // セッション確認
    fetch("/api/session", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setSession(data.user ? data : null);
      })
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
    </div>
  );

  // ログイン済みの場合はアプリにリダイレクト
  if (session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Welcome back, {session.user?.name || 'User'}!</h1>
          <Link href="/app" className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-700 transition-all">
            <span>アプリを開く</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  // 未ログインページ
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6 lg:px-12">
        <div className="flex items-center space-x-3">
          <Image 
            src="/CoLab_logo.png" 
            alt="CoLab Logo" 
            width={48} 
            height={48}
            className="animate-bounce"
          />
          <span className="text-2xl font-bold text-white">CoLab</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-white/80 hover:text-white transition-colors">機能</a>
          <a href="#about" className="text-white/80 hover:text-white transition-colors">概要</a>
          <div className="flex space-x-4">
            <Link
              href="/auth/login"
              className="px-6 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg font-medium hover:bg-white/20 transition-all"
            >
              ログイン
            </Link>
            <Link
              href="/auth/login?screen_hint=signup"
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-700 transition-all transform hover:-translate-y-1 flex items-center space-x-2"
            >
              <span>今すぐ始める</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Content */}
          <div className="text-center py-20 lg:py-32">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8 animate-fade-in">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-medium">〜クラブ活動SNSの最適解〜</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 animate-fade-in-up">
              チームワークを
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                革新する
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-200">
              CoLabは、サークル、部活、プロジェクト管理が統合した<br />
              オールインワンのコラボレーションプラットフォームです
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 animate-fade-in-up delay-400">
              <Link
                href="/auth/login?screen_hint=signup"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-blue-700 transition-all transform hover:-translate-y-2 hover:shadow-2xl flex items-center justify-center space-x-3"
              >
                <span>無料で始める</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <a
                href="#features"
                className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all transform hover:-translate-y-2"
              >
                機能を見る
              </a>
            </div>
            
            {/* ログイン済みユーザー向けリンク */}
            <div className="mt-8 text-center animate-fade-in-up delay-600">
              <Link
                href="/app"
                className="inline-flex items-center space-x-2 text-white/70 hover:text-white transition-colors text-sm"
              >
                <span>ログイン済みの方はこちら</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Features Section */}
          <section id="features" className="py-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                すべてがここに
              </h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                プロジェクト管理からリアルタイムコミュニケーションまで、<br />
                チームに必要な機能をすべて提供します
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <MessageSquare className="w-8 h-8" />,
                  title: "リアルタイムチャット",
                  description: "チームメンバーとスムーズにコミュニケーション",
                  color: "from-green-500 to-emerald-600"
                },
                {
                  icon: <FileText className="w-8 h-8" />,
                  title: "Wiki & ドキュメント",
                  description: "Markdown対応の知識ベースで、チームの情報を整理・共有",
                  color: "from-blue-500 to-cyan-600"
                },
                {
                  icon: <Calendar className="w-8 h-8" />,
                  title: "プロジェクト管理",
                  description: "タスク管理、進捗追跡、期限管理で効率的なプロジェクト運営",
                  color: "from-purple-500 to-violet-600"
                },
                {
                  icon: <Users className="w-8 h-8" />,
                  title: "コラボレーティブホワイトボード",
                  description: "リアルタイムで共有できる描画ボードでアイデアを視覚化",
                  color: "from-orange-500 to-red-600"
                },
                {
                  icon: <Globe className="w-8 h-8" />,
                  title: "フォーラム機能",
                  description: "スレッド形式の議論で、深い話し合いを整理",
                  color: "from-teal-500 to-green-600"
                },
                {
                  icon: <Zap className="w-8 h-8" />,
                  title: "リアルタイム同期",
                  description: "すべての変更がリアルタイムで反映され、常に最新の状態を共有",
                  color: "from-yellow-500 to-orange-600"
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all transform hover:-translate-y-2 hover:shadow-2xl animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-white/70 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* About Section */}
          <section id="about" className="py-20">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12 lg:p-16">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">
                    なぜCoLabなのか？
                  </h2>
                  <div className="space-y-6">
                    {[
                      {
                        icon: <Shield className="w-6 h-6" />,
                        title: "様々な機能を搭載",
                        description: "幅広い機能性で、あらゆるチームのニーズに対応"
                      },
                      {
                        icon: <Cpu className="w-6 h-6" />,
                        title: "オープンなプラットフォーム",
                        description: "APIやプラグインで機能を拡張可能"
                      },
                      {
                        icon: <Sparkles className="w-6 h-6" />,
                        title: "直感的UI/UX",
                        description: "美しく使いやすいインターフェースで生産性を向上"
                      }
                    ].map((item, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                          <p className="text-white/70">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl blur-3xl"></div>
                  <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 text-center">
                    <Image 
                      src="/CoLab_logo.png" 
                      alt="CoLab Logo" 
                      width={120} 
                      height={120}
                      className="mx-auto mb-6 animate-float"
                    />
                    <h3 className="text-2xl font-bold text-white mb-4">今すぐ始めましょう</h3>
                    <p className="text-white/80 mb-8">
                      数分でセットアップ完了。<br />
                      チームの生産性を今すぐ向上させましょう。
                    </p>
                    <Link
                      href="/auth/login?screen_hint=signup"
                      className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-blue-700 transition-all transform hover:-translate-y-1"
                    >
                      <span>無料で開始</span>
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Image 
              src="/CoLab_logo.png" 
              alt="CoLab Logo" 
              width={32} 
              height={32}
            />
            <span className="text-xl font-bold text-white">CoLab</span>
          </div>
          <p className="text-white/60 mb-6">
            チームワークを革新する次世代コラボレーションプラットフォーム
          </p>
          <div className="flex justify-center space-x-6 text-white/60">
            <a href="#" className="hover:text-white transition-colors">プライバシーポリシー</a>
            <a href="#" className="hover:text-white transition-colors">利用規約</a>
            <a href="#" className="hover:text-white transition-colors">サポート</a>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .delay-200 {
          animation-delay: 200ms;
        }
        
        .delay-400 {
          animation-delay: 400ms;
        }
        
        .delay-500 {
          animation-delay: 500ms;
        }
        
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
}
