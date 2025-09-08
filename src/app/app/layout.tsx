"use client";

import { useState } from "react";
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);

  return (
    <div className="h-screen flex flex-col">
      <Header />

      <div className="flex flex-2 overflow-hidden">
        <ServerSidebar
          onSelectServer={setSelectedServer}
          selectedServer={selectedServer}
        />

        {selectedServer ? (
          <ChannelSidebar server={selectedServer} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            サーバーを選択してください
          </div>
        )}

        <div className="flex-1 bg-gray-200 overflow-auto p-4">{children}</div>
      </div>
    </div>
  );
}
