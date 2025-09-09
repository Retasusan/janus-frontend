"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

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
  url?: string;
};

type Props = {
  selectedServer: Server | null;
  onSelectServer: (server: Server) => void;
  servers: Server[];
  onServersUpdate: (servers: Server[]) => void;
};

export default function ServerSidebar({
  selectedServer,
  onSelectServer,
  servers,
  onServersUpdate,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddServer = async () => {
    const name = prompt("新しいサーバー名を入力してください:");
    if (!name) return;

    setLoading(true);
    try {
      const res = await fetch("/api/servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);
      const newServer: Server = await res.json();

      const updatedServers = [
        ...servers,
        {
          ...newServer,
          url: `/app/servers/${newServer.id}/channels/1`,
          src: newServer.src || "/default-server.png",
          fallback: newServer.name[0],
        },
      ];

      onServersUpdate(updatedServers);
      onSelectServer(newServer);
      router.push(`/app/servers/${newServer.id}/channels/1`);
    } catch (err: any) {
      alert(`サーバー作成エラー: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-14 bg-gray-900 text-gray-600 h-full flex flex-col items-center py-3 space-y-2">
      {loading && <p className="text-gray-500 text-xs">読み込み中...</p>}
      {error && <p className="text-red-500 text-xs">{error}</p>}

      <div className="flex flex-col items-center space-y-2 flex-1">
        {servers.map((server) => {
          const isSelected = selectedServer?.id === server.id;
          return (
            <div key={server.id} className="relative group">
              {/* 選択インジケーター */}
              <div
                className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-1 bg-white rounded-r-full transition-all duration-200 ${isSelected ? "h-8" : "h-0 group-hover:h-4"
                  }`}
              />

              <button
                type="button"
                onClick={() => onSelectServer(server)}
                className="relative ml-3 focus:outline-none"
              >
                <Avatar
                  className={`w-10 h-10 mr-2 transition-all duration-200 ${isSelected
                    ? "rounded-2xl"
                    : "rounded-3xl group-hover:rounded-2xl"
                    }`}
                >
                  <AvatarImage src={server.src} alt={server.name} />
                  <AvatarFallback
                    className={`transition-all duration-200 ${isSelected
                      ? "rounded-2xl bg-indigo-600 text-white"
                      : "rounded-3xl bg-gray-700 text-gray-300 group-hover:rounded-2xl group-hover:bg-indigo-500 group-hover:text-white"
                      }`}
                  >
                    {server.fallback}
                  </AvatarFallback>
                </Avatar>

                {/* ツールチップ */}
                <div className="absolute left-14 top-1/2 transform -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  {server.name}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-700 hover:rounded-xl hover:bg-green-600 text-white"
        onClick={handleAddServer}
      >
        <IoMdAdd size={22} />
      </button>
    </div>
  );
}
