"use client";


import { useEffect, useState } from "react";
import { BiHash } from "react-icons/bi";
import { IoMdAdd } from "react-icons/io";

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
        const channelsWithServerId = data.map((c) => ({
          ...c,
          serverId: server.id,
        }));
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

  const handleAddChannel = async () => {
    const name = prompt("新しいチャンネル名を入力してください:");
    if (!name) return;

    try {
      const res = await fetch(`/api/servers/${server.id}/channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error(`Channel create error ${res.status}`);
      const newChannel: Channel = await res.json();

      const channelWithServerId = {
        ...newChannel,
        serverId: server.id,
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
    <div className="w-56 bg-gray-800 text-gray-200 h-full flex flex-col">
      <div className="h-16 flex items-center px-4 border-b border-gray-700 font-bold">
        {server.name}
      </div>

      <div className="flex-1 overflow-auto px-2 py-3">
        <div className="flex items-center justify-between px-2 mb-2 text-gray-400 uppercase text-xs font-semibold">
          <span>Text Channels</span>
          <button
            type="button"
            className="hover:text-white"
            onClick={handleAddChannel}
          >
            <IoMdAdd size={16} />
          </button>
        </div>

        <div className="flex flex-col space-y-1">
          {channels.length === 0 ? (
            <div className="px-2 py-4 text-center text-gray-400 text-sm">
              <p className="mb-2">チャンネルがありません</p>
              <p className="text-xs">「+」ボタンでチャンネルを作成してください</p>
            </div>
          ) : (
            channels.map((channel) => {
              const isSelected = selectedChannel?.id === channel.id;
              return (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() => onSelectChannel(channel)}
                  className={`flex items-center px-2 py-1 rounded text-sm font-medium focus:outline-none transition-colors duration-150 ${
                    isSelected
                      ? "bg-gray-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <BiHash className="mr-2" />
                  {channel.name}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
