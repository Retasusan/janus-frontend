"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ChannelContent from "../../components/channelContent/ChannelContent";
import ChannelSidebar from "../../components/channelSidebar/ChannelSidebar";
import Header from "../../components/header/Header";
import ServerSidebar from "../../components/serverSidebar/ServerSidebar";

export type Server = {
  id: number;
  name: string;
  src?: string;
  fallback?: string;
  url?: string;
};

export type Channel = {
  id: number;
  name: string;
  serverId: number;
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [servers, setServers] = useState<Server[]>([]);

  // プロファイルページかどうかを判定
  const isProfilePage = pathname === "/app/profile";
  
  // 管理者ページかどうかを判定
  const isAdminPage = pathname.includes("/admin");

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const res = await fetch("/api/servers", { credentials: "include" });
        if (res.ok) {
          const data: Server[] = await res.json();
          setServers(data);
          // 最初のサーバーを自動選択
          if (data.length > 0 && !selectedServer) {
            setSelectedServer(data[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch servers:", error);
      }
    };

    fetchServers();
  }, [selectedServer]);

  // サーバー変更時にチャンネル選択をリセット
  useEffect(() => {
    setSelectedChannel(null);
  }, [selectedServer]);

  // 管理者ページの場合は子要素をそのまま表示
  if (isAdminPage) {
    return <>{children}</>;
  }

  // プロファイルページの場合は異なるレイアウトを使用
  if (isProfilePage) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <ServerSidebar
          onSelectServer={setSelectedServer}
          selectedServer={selectedServer}
          servers={servers}
          onServersUpdate={setServers}
        />

        {selectedServer && (
          <ChannelSidebar
            server={selectedServer}
            selectedChannel={selectedChannel}
            onSelectChannel={setSelectedChannel}
          />
        )}

        <div className="flex-1 bg-gray-200 h-full">
          {selectedChannel ? (
            <ChannelContent channel={selectedChannel} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <h2 className="text-xl font-semibold mb-2">
                  チャンネルを選択してください
                </h2>
                <p>左側のサーバーからチャンネルを選択してください</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
