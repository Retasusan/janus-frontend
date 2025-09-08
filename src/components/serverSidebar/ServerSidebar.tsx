"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
};

export default function ServerSidebar({
  selectedServer,
  onSelectServer,
}: Props) {
  const router = useRouter();
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/servers", { credentials: "include" });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data: Server[] = await res.json();
        setServers(
          data.map((s) => ({
            ...s,
            url: `/app/servers/${s.id}/channels/1`,
            src: s.src || "/default-server.png",
            fallback: s.fallback || s.name[0],
          })),
        );
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchServers();
  }, []);

  const handleAddServer = async () => {
    const name = prompt("新しいサーバー名を入力してください:");
    if (!name) return;

    try {
      const res = await fetch("/api/servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);
      const newServer: Server = await res.json();

      setServers((prev) => [
        ...prev,
        {
          ...newServer,
          url: `/app/servers/${newServer.id}/channels/1`,
          src: newServer.src || "/default-server.png",
          fallback: newServer.name[0],
        },
      ]);

      onSelectServer(newServer);
      router.push(`/app/servers/${newServer.id}/channels/1`);
    } catch (err: any) {
      alert(`サーバー作成エラー: ${err.message}`);
    }
  };

  return (
    <div className="w-14 bg-gray-900 text-gray-600 h-full flex flex-col items-center py-3 space-y-2">
      {loading && <p className="text-gray-500 text-xs">読み込み中...</p>}
      {error && <p className="text-red-500 text-xs">{error}</p>}

      <div className="flex flex-col items-center space-y-2 flex-1">
        {servers.map((server) => (
          <button
            key={server.id}
            type="button"
            onClick={() => onSelectServer(server)}
            className={`group relative focus:outline-none ${
              selectedServer?.id === server.id ? "ring-2 ring-green-500" : ""
            }`}
          >
            <Avatar className="w-10 h-10 rounded-lg transition-all group-hover:rounded-xl">
              <AvatarImage src={server.src} alt={server.name} />
              <AvatarFallback className="rounded-lg">
                {server.fallback}
              </AvatarFallback>
            </Avatar>
          </button>
        ))}
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
