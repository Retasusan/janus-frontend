"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Message = {
  id: number;
  author: string;
  content: string;
};

export default function ChannelPage() {
  const params = useParams();
  const { serverId, channelId } = params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!serverId || !channelId) return;

    const fetchMessages = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/servers/${serverId}/channels/${channelId}/messages`,
        );

        if (!res.ok)
          throw new Error(`Failed to fetch messages (${res.status})`);
        const data: Message[] = await res.json();
        setMessages(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [serverId, channelId]);

  if (loading) return <p className="text-gray-400">読み込み中...</p>;
  if (error) return <p className="text-red-500">エラー: {error}</p>;

  return (
    <div className="p-4 flex flex-col space-y-2">
      <h1 className="text-xl font-bold mb-4">
        Server: {serverId} / Channel: {channelId}
      </h1>

      {messages.length === 0 ? (
        <p className="text-gray-500">メッセージはまだありません。</p>
      ) : (
        messages.map((msg) => (
          <div key={msg.id} className="p-2 bg-gray-100 rounded-md shadow-sm">
            <span className="font-semibold mr-2">{msg.author}:</span>
            <span>{msg.content}</span>
          </div>
        ))
      )}
    </div>
  );
}
