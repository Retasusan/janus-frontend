"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BiHash } from "react-icons/bi";
import ChannelSidebar from "../../components/channelSidebar/ChannelSidebar";
import ChannelContent from "../../components/channelContent/ChannelContent";
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

  // プロファイルページの場合は異なるレイアウトを使用
  if (isProfilePage) {
    return (
      <div className="h-screen flex flex-col">
        <Header />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Header />

      <div className="flex flex-1 h-full">
        <ServerSidebar
          onSelectServer={setSelectedServer}
          selectedServer={selectedServer}
          servers={servers}
          onServersUpdate={setServers}
        />

        {selectedServer && (
          <div className="w-64 flex flex-col">
            <ChannelSidebar 
              server={selectedServer} 
              selectedChannel={selectedChannel}
              onSelectChannel={setSelectedChannel}
            />
          </div>
        )}

        <div className="flex-1 bg-gradient-to-br from-gray-900 to-gray-800">
          {selectedChannel ? (
            <ChannelContent channel={selectedChannel} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-300 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <BiHash className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-3 text-white">チャンネルを選択してください</h2>
                <p className="text-gray-400">左側のサーバーからチャンネルを選択してください</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
