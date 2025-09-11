"use client";


import { useEffect, useState } from "react";
import { BiHash } from "react-icons/bi";
import { IoMdAdd } from "react-icons/io";
import CreateChannelModal from "@/components/channelContent/CreateChannelModal";
import { CreateChannelRequest, ChannelType } from "@/types/channel";
import { pluginRegistry } from "@/lib/pluginRegistry";
import "@/lib/initializePlugins"; // プラグインを初期化

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
  type?: ChannelType;
};

type Props = {
  server: Server;
  selectedChannel: Channel | null;
  onSelectChannel: (channel: Channel) => void;
};

export default function ChannelSidebar({ 
  server, 
  selectedChannel, 
  onSelectChannel 
}: Props) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchChannels = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/servers/${server.id}/channels`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Channel fetch error ${res.status}`);
        const data: Channel[] = await res.json();
        let channelsWithServerId = data.map((c) => ({
          ...c,
          serverId: server.id,
        }));

        // if some channels are missing type, retry once to get normalized types from server
        const missingType = channelsWithServerId.some((c) => !c.type);
        if (missingType) {
          try {
            const res2 = await fetch(`/api/servers/${server.id}/channels`, { credentials: 'include' });
            if (res2.ok) {
              const data2: Channel[] = await res2.json();
              channelsWithServerId = data2.map((c) => ({ ...c, serverId: server.id }));
            }
          } catch (e) {
            // ignore retry error
          }
        }
        setChannels(channelsWithServerId);
        
        // 最初のチャンネルを自動選択（チャンネルがある場合）
        if (channelsWithServerId.length > 0 && !selectedChannel) {
          onSelectChannel(channelsWithServerId[0]);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, [server]);

  const handleCreateChannel = async (data: CreateChannelRequest) => {
    try {
      const res = await fetch(`/api/servers/${server.id}/channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error(`Channel create error ${res.status}`);
      const newChannel: Channel = await res.json();

      const channelWithServerId = {
        ...newChannel,
        serverId: server.id,
        type: data.type,
      };

      setChannels((prev) => [...prev, channelWithServerId]);
      onSelectChannel(channelWithServerId);
    } catch (err: any) {
      alert(`チャンネル作成エラー: ${err.message}`);
    }
  };

  if (loading)
    return <p className="text-gray-400 text-xs px-2 py-1">読み込み中...</p>;
  if (error) return <p className="text-red-500 text-xs px-2 py-1">{error}</p>;

  return (
    <div className="w-64 bg-gray-800/95 backdrop-blur-sm border-r border-white/10 text-gray-100 h-full flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-white/10 font-bold text-white bg-white/5">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
          {server.name}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 py-4">
        <div className="flex items-center justify-between px-3 mb-3 text-gray-300 uppercase text-xs font-semibold">
          <span>チャンネル</span>
          <button
            type="button"
            className="w-6 h-6 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 transition-colors text-gray-300 hover:text-white"
            onClick={() => setShowCreateModal(true)}
          >
            <IoMdAdd size={16} />
          </button>
        </div>

        <div className="flex flex-col space-y-2">
          {channels.length === 0 ? (
            <div className="px-3 py-6 text-center text-gray-400 text-sm bg-white/5 rounded-lg border border-white/10">
              <p className="mb-2 text-gray-300">チャンネルがありません</p>
              <p className="text-xs text-gray-400">「+」ボタンでチャンネルを作成してください</p>
            </div>
          ) : (
            channels.map((channel) => {
              const isSelected = selectedChannel?.id === channel.id;
              const channelType = channel.type || ChannelType.TEXT;
              const plugin = pluginRegistry.get(channelType);

              const handleSelect = async () => {
                // if type is missing, re-fetch channels to get normalized type from server
                if (!channel.type) {
                  try {
                    const res = await fetch(`/api/servers/${server.id}/channels`, { credentials: 'include' });
                    if (res.ok) {
                      const data: Channel[] = await res.json();
                      const channelsWithServerId = data.map((c) => ({ ...c, serverId: server.id }));
                      setChannels(channelsWithServerId);
                      const fresh = channelsWithServerId.find((c) => c.id === channel.id);
                      if (fresh) {
                        onSelectChannel(fresh);
                        return;
                      }
                    }
                  } catch (e) {
                    // ignore and fall back to original channel
                  }
                }
                onSelectChannel(channel);
              };

              return (
                <button
                  key={channel.id}
                  type="button"
                  onClick={handleSelect}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium focus:outline-none transition-all duration-200 ${
                    isSelected
                      ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-400/30 shadow-lg"
                      : "text-gray-300 hover:bg-white/10 hover:text-white hover:translate-x-1"
                  }`}
                >
                  <span className="mr-3 flex-shrink-0" style={{ color: plugin?.meta.color || '#9ca3af' }}>
                    {plugin?.meta.icon || <BiHash />}
                  </span>
                  <span className="truncate">{channel.name}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* チャンネル作成モーダル */}
      <CreateChannelModal
        serverId={server.id}
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateChannel}
      />
    </div>
  );
}
