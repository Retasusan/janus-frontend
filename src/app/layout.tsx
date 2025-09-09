import { Auth0Provider } from "@auth0/nextjs-auth0";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YourApp - チームワークを革新するコラボレーションプラットフォーム",
  description: "リアルタイムチャット、プロジェクト管理、ファイル共有など、チームが必要とするすべての機能を一つのプラットフォームで。生産性を向上させ、コミュニケーションを円滑にします。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <Auth0Provider>
        <body className="h-full">{children}</body>
      </Auth0Provider>
    </html>
  );
}
