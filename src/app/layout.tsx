import { Auth0Provider } from "@auth0/nextjs-auth0";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Co:Lab",
  description: "サークル管理のためのオールインワンツール",
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
