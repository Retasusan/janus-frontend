"use client";

import { useRouter } from "next/navigation";
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
  url?: string;
};

type Props = {
  server: Server;
};

export default function ChannelSidebar({ server }: Props) {
  const router = useRouter();
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
        setChannels(
          data.map((c) => ({
            ...c,
            url: `/app/servers/${server.id}/channels/${c.id}`,
          })),
        );
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

      setChannels((prev) => [
        ...prev,
        {
          ...newChannel,
          url: `/app/servers/${server.id}/channels/${newChannel.id}`,
        },
      ]);

      router.push(`/app/servers/${server.id}/channels/${newChannel.id}`);
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
          {channels.map((channel) => (
            <button
              key={channel.id}
              type="button"
              onClick={() => router.push(channel.url!)}
              className="flex items-center px-2 py-1 text-gray-300 rounded hover:bg-gray-700 hover:text-white text-sm font-medium focus:outline-none"
            >
              <BiHash className="mr-2" />
              {channel.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
