"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiShare2, FiUserPlus, FiSettings } from "react-icons/fi";
import { IoMdAdd } from "react-icons/io";
import InviteCodeModal from "../server/InviteCodeModal";
import JoinServerModal from "../server/JoinServerModal";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { AdminGate } from "../rbac/PermissionGate";

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
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

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

  const handleJoinServer = async (inviteCode: string) => {
    try {
      const res = await fetch("/api/servers/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ inviteCode }),
      });

      if (!res.ok) {
        let errorMessage = `サーバーへの参加に失敗しました (${res.status})`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          console.error("Failed to parse error response:", jsonError);
          const textResponse = await res.text();
          console.error("Raw response:", textResponse);
        }
        throw new Error(errorMessage);
      }

      let joinedServer: Server;
      try {
        joinedServer = await res.json();
      } catch (jsonError) {
        console.error("Failed to parse success response:", jsonError);
        const textResponse = await res.text();
        console.error("Raw response:", textResponse);
        throw new Error("サーバーからの応答を解析できませんでした");
      }

      const updatedServers = [
        ...servers,
        {
          ...joinedServer,
          url: `/app/servers/${joinedServer.id}/channels/1`,
          src: joinedServer.src || "/default-server.png",
          fallback: joinedServer.name[0],
        },
      ];

      onServersUpdate(updatedServers);
      onSelectServer(joinedServer);
      router.push(`/app/servers/${joinedServer.id}/channels/1`);
    } catch (err: any) {
      throw new Error(err.message || "サーバーへの参加に失敗しました");
    }
  };

  const handleServerRightClick = (e: React.MouseEvent, server: Server) => {
    e.preventDefault();
    onSelectServer(server);
    setShowInviteModal(true);
  };

  return (
    <div className="w-14 bg-gray-900 text-gray-600 min-h-screen flex flex-col items-center py-3 space-y-2">
      {loading && <p className="text-gray-500 text-xs">読み込み中...</p>}
      {error && <p className="text-red-500 text-xs">{error}</p>}

      <div className="flex flex-col items-center space-y-2 overflow-y-auto">
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
                onContextMenu={(e) => handleServerRightClick(e, server)}
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
                  <div className="text-xs opacity-75 mt-1">
                    右クリックで招待
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* サーバー作成ボタン */}
      <button
        type="button"
        className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-700 hover:rounded-xl hover:bg-green-600 text-white group"
        onClick={handleAddServer}
        title="新しいサーバーを作成"
      >
        <IoMdAdd size={22} />
      </button>

      {/* サーバー参加ボタン */}
      <button
        type="button"
        className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-700 hover:rounded-xl hover:bg-blue-600 text-white group"
        onClick={() => setShowJoinModal(true)}
        title="サーバーに参加"
      >
        <FiUserPlus size={18} />
      </button>

      {/* 招待コード作成ボタン（選択されたサーバーがある場合のみ表示） */}
      {selectedServer && (
        <button
          type="button"
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-700 hover:rounded-xl hover:bg-purple-600 text-white group"
          onClick={() => setShowInviteModal(true)}
          title="招待コードを作成"
        >
          <FiShare2 size={18} />
        </button>
      )}

      {/* 権限管理ボタン（Admin専用） */}
      {selectedServer && (
        <AdminGate serverId={selectedServer.id.toString()}>
          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-700 hover:rounded-xl hover:bg-orange-600 text-white group"
            onClick={() => router.push(`/servers/${selectedServer.id}/admin/roles`)}
            title="権限管理（Admin専用）"
          >
            <FiSettings size={18} />
          </button>
        </AdminGate>
      )}

      {/* モーダル */}
      <JoinServerModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoinServer={handleJoinServer}
      />

      <InviteCodeModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        server={selectedServer}
      />
    </div>
  );
}
