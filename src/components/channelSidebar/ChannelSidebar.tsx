"use client";

import { useEffect, useState } from "react";
import { BiHash } from "react-icons/bi";
import { IoMdAdd } from "react-icons/io";
import CreateChannelModal from "@/components/channelContent/CreateChannelModal";
import { pluginRegistry } from "@/lib/pluginRegistry";
import { ChannelType, type CreateChannelRequest } from "@/types/channel";
import { useToast } from "@/hooks/use-toast";
import { ChannelSidebarSkeleton } from "./ChannelSkeleton";
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
  onSelectChannel,
}: Props) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchChannels = async () => {
      setLoading(true);
      setError(null);
      try {
      const res = await fetch(`/api/servers/${server.id}/channels`, {
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP ${res.status}: チャンネル取得に失敗しました`;
        console.error("Channel fetch error details:", {
          status: res.status,
          errorData,
          serverId: server.id
        });
        throw new Error(errorMessage);
      }        const responseData = await res.json();

        // エラーレスポンスの場合
        if (responseData.error) {
          throw new Error(responseData.error);
        }

        // バックエンドは { channels: [...] } の形式で返すので、channelsプロパティを取得
        const channelsData = Array.isArray(responseData)
          ? responseData
          : responseData.channels || [];

        const channelsWithServerId = channelsData.map((c: any) => ({
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
        toast({
          variant: "destructive",
          title: "チャンネル読み込みエラー",
          description: "チャンネル一覧の読み込みに失敗しました。ページを再読み込みしてください。",
        });
        console.error("Channel fetch error:", err);
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

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}: チャンネル作成に失敗しました`);
      }

      const newChannel: Channel = await res.json();
      const channelWithServerId = {
        ...newChannel,
        serverId: server.id,
        type: data.type,
      };

      setChannels((prev) => [...prev, channelWithServerId]);
      onSelectChannel(channelWithServerId);
    } catch (err: any) {
      console.error("チャンネル作成エラー:", err);
      // エラーはCreateChannelModalで処理されるので、ここで再throw
      throw err;
    }
  };

  if (loading) return <ChannelSidebarSkeleton />;

  if (error) return <p className="text-red-500 text-xs px-2 py-1">{error}</p>;

  return (
    <div className="w-56 bg-gray-800 text-gray-200 min-h-screen flex flex-col">
      <div className="h-16 flex items-center px-4 border-b border-gray-700 font-bold">
        {server.name}
      </div>

      <div className="flex-1 px-2 py-3">
        <div className="flex items-center justify-between px-2 mb-2 text-gray-400 uppercase text-xs font-semibold">
          <span>Text Channels</span>
          <button
            type="button"
            className="hover:text-white"
            onClick={() => setShowCreateModal(true)}
          >
            <IoMdAdd size={16} />
          </button>
        </div>

        <div className="flex flex-col space-y-1">
          {channels.length === 0 ? (
            <div className="px-2 py-4 text-center text-gray-400 text-sm">
              <p className="mb-2">チャンネルがありません</p>
              <p className="text-xs">
                「+」ボタンでチャンネルを作成してください
              </p>
            </div>
          ) : (
            channels.map((channel) => {
              const isSelected = selectedChannel?.id === channel.id;
              const channelType = channel.type || ChannelType.TEXT;
              const plugin = pluginRegistry.get(channelType);

              return (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() => onSelectChannel(channel)}
                  className={`flex items-center px-2 py-1 rounded text-sm font-medium focus:outline-none transition-colors duration-150 ${isSelected
                    ? "bg-gray-600 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                >
                  <span
                    className="mr-2"
                    style={{ color: plugin?.meta.color || "#6b7280" }}
                  >
                    {plugin?.meta.icon || <BiHash />}
                  </span>
                  {channel.name}
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
