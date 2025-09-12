"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { FiUserPlus, FiShare2 } from "react-icons/fi";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import JoinServerModal from "../server/JoinServerModal";
import InviteCodeModal from "../server/InviteCodeModal";
import ModalPortal from "../ui/ModalPortal";

export type Server = {
  id: number;
  name: string;
  icon?: string;
  api_token?: string;
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
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; server: Server } | null>(null);
  const [showServerSettings, setShowServerSettings] = useState<Server | null>(null);

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

    const handleInviteServer = async (inviteCode: string) => {
    const res = await fetch("/api/servers/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ inviteCode }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `Failed to join server: ${res.status}`);
    }

    // サーバーリストを更新
    const updatedRes = await fetch("/api/servers", { credentials: "include" });
    if (updatedRes.ok) {
      const updatedServers = await updatedRes.json();
      onServersUpdate(updatedServers);
    }
  };

  const handleRightClick = (e: React.MouseEvent, server: Server) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      server
    });
  };

  const handleDeleteServer = async (server: Server) => {
    if (!confirm(`サーバー「${server.name}」を削除しますか？この操作は取り消せません。`)) return;
    
    try {
      const res = await fetch(`/api/servers/${server.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Failed to delete server: ${res.status}`);
      }

      // サーバーリストを更新
      const updatedServers = servers.filter(s => s.id !== server.id);
      onServersUpdate(updatedServers);
      
      // 削除されたサーバーが選択されていた場合、選択を解除
      if (selectedServer?.id === server.id) {
        onSelectServer(updatedServers[0] || null);
      }
    } catch (error) {
      alert(`サーバーの削除に失敗しました: ${error}`);
    }
    setContextMenu(null);
  };

  const handleUpdateServer = async (server: Server, newName: string) => {
    try {
      const res = await fetch(`/api/servers/${server.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newName }),
      });

      if (!res.ok) {
        throw new Error(`Failed to update server: ${res.status}`);
      }

      // サーバーリストを更新
      const updatedServers = servers.map(s => 
        s.id === server.id ? { ...s, name: newName } : s
      );
      onServersUpdate(updatedServers);
    } catch (error) {
      alert(`サーバーの更新に失敗しました: ${error}`);
    }
  };

  const handleGenerateToken = async (server: Server) => {
    try {
      const res = await fetch(`/api/servers/${server.id}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Failed to generate token: ${res.status}`);
      }

      const data = await res.json();
      
      // サーバーリストを更新
      const updatedServers = servers.map(s => 
        s.id === server.id ? { ...s, api_token: data.token } : s
      );
      onServersUpdate(updatedServers);
      
      // モーダルの状態も更新
      setShowServerSettings({ ...server, api_token: data.token });
    } catch (error) {
      alert(`トークンの生成に失敗しました: ${error}`);
    }
  };

  const handleServerRightClick = (e: React.MouseEvent, server: Server) => {
    e.preventDefault();
    onSelectServer(server);
    setShowInviteModal(true);
  };

  return (
    <div className="w-16 bg-gray-800/95 backdrop-blur-sm border-r border-white/10 text-gray-300 h-full flex flex-col items-center py-4 space-y-3">
      {loading && <p className="text-gray-400 text-xs">読み込み中...</p>}
      {error && <p className="text-red-400 text-xs">{error}</p>}

      <div className="flex flex-col items-center space-y-3 flex-1">
        {servers.map((server) => {
          const isSelected = selectedServer?.id === server.id;
          return (
            <div key={server.id} className="relative group">
              {/* 選択インジケーター */}
              <div
                className={`absolute -left-2 top-1/2 transform -translate-y-1/2 w-1 bg-gradient-to-b from-purple-400 to-blue-400 rounded-r-full transition-all duration-200 ${isSelected ? "h-8" : "h-0 group-hover:h-4"
                  }`}
              />

              <button
                type="button"
                onClick={() => onSelectServer(server)}
                onContextMenu={(e) => handleRightClick(e, server)}
                className="relative focus:outline-none"
              >
                <Avatar
                  className={`w-12 h-12 transition-all duration-200 ${isSelected
                    ? "rounded-2xl ring-2 ring-purple-400/50"
                    : "rounded-full group-hover:rounded-2xl"
                    }`}
                >
                  <AvatarImage src={server.src} alt={server.name} />
                  <AvatarFallback
                    className={`transition-all duration-200 font-semibold ${isSelected
                      ? "rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 text-white"
                      : "rounded-full bg-white/10 text-gray-300 group-hover:rounded-2xl group-hover:bg-gradient-to-br group-hover:from-purple-500 group-hover:to-blue-600 group-hover:text-white"
                      }`}
                  >
                    {server.fallback}
                  </AvatarFallback>
                </Avatar>

                {/* ツールチップ */}
                <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-800/95 backdrop-blur-sm border border-white/20 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  {server.name}
                  <div className="text-xs opacity-75 mt-1">右クリックで招待</div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* サーバー作成ボタン */}
      <button
        type="button"
        className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-gradient-to-br hover:from-green-500 hover:to-emerald-600 text-gray-300 hover:text-white group transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-green-400/50"
        onClick={handleAddServer}
        title="新しいサーバーを作成"
      >
        <IoMdAdd size={24} />
      </button>

      {/* サーバー参加ボタン */}
      <button
        type="button"
        className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-gradient-to-br hover:from-blue-500 hover:to-cyan-600 text-gray-300 hover:text-white group transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-blue-400/50"
        onClick={() => {
          console.log('Join button clicked - opening modal');
          setShowJoinModal(true);
        }}
        title="サーバーに参加"
      >
        <FiUserPlus size={20} />
      </button>

      {/* 招待コード作成ボタン（選択されたサーバーがある場合のみ表示） */}
      {selectedServer && (
        <button
          type="button"
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-gradient-to-br hover:from-purple-500 hover:to-indigo-600 text-gray-300 hover:text-white group transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-purple-400/50"
          onClick={() => setShowInviteModal(true)}
          title="招待コードを作成"
        >
          <FiShare2 size={20} />
        </button>
      )}

      {/* モーダル */}
      <JoinServerModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoinServer={handleInviteServer}
      />

      <InviteCodeModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        server={selectedServer}
      />

      {/* コンテキストメニュー */}
      {contextMenu && (
        <>
          <div 
            className="fixed inset-0 z-[60]" 
            onClick={() => setContextMenu(null)}
          />
          <div 
            className="fixed bg-gray-800/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-2xl z-[70] py-2 min-w-48"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={() => {
                setShowServerSettings(contextMenu.server);
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center space-x-2"
            >
              <span>⚙️</span>
              <span>サーバー設定</span>
            </button>
            <button
              onClick={() => {
                setShowInviteModal(true);
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center space-x-2"
            >
              <span>🔗</span>
              <span>招待リンク</span>
            </button>
            <hr className="border-white/10 my-1" />
            <button
              onClick={() => handleDeleteServer(contextMenu.server)}
              className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/20 flex items-center space-x-2"
            >
              <span>🗑️</span>
              <span>サーバーを削除</span>
            </button>
          </div>
        </>
      )}

      {/* サーバー設定モーダル */}
      {showServerSettings && (
        <ModalPortal isOpen={true}>
          <div
            style={{ pointerEvents: "auto" }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <div className="bg-gray-800/95 backdrop-blur-sm border border-white/20 rounded-2xl p-8 w-full max-w-lg mx-4 text-white">
              <h2 className="text-2xl font-bold mb-6 text-center">サーバー設定</h2>
              
              {/* サーバートークン表示 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  サーバートークン（SDK用）
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={showServerSettings.api_token || '未生成'}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleGenerateToken(showServerSettings)}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white text-sm"
                  >
                    生成
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  このトークンを使ってJanus-SDKからサーバーにアクセスできます
                </p>
              </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newName = formData.get('serverName') as string;
              if (newName.trim()) {
                handleUpdateServer(showServerSettings, newName.trim());
                setShowServerSettings(null);
              }
            }}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  サーバー名
                </label>
                <input
                  name="serverName"
                  type="text"
                  defaultValue={showServerSettings.name}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowServerSettings(null)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-gray-300 font-medium transition-all"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 rounded-xl text-white font-medium transition-all transform hover:-translate-y-1"
                >
                  保存
                </button>
              </div>
            </form>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
