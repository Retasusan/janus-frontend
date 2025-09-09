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
  const [newMessage, setNewMessage] = useState("");

  // メッセージ取得
  useEffect(() => {
    if (!serverId || !channelId) return;

    const fetchMessages = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/servers/${serverId}/channels/${channelId}/messages`,
          { credentials: "include" },
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

  // メッセージ送信
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const res = await fetch(
        `/api/servers/${serverId}/channels/${channelId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content: newMessage }),
        },
      );

      if (!res.ok) throw new Error(`Failed to send message (${res.status})`);

      const msg: Message = await res.json();
      setMessages((prev) => [...prev, msg]);
      setNewMessage("");
    } catch (err: any) {
      alert(`メッセージ送信エラー: ${err.message}`);
    }
  };

  if (loading) return <p className="text-gray-400">読み込み中...</p>;
  if (error) return <p className="text-red-500">エラー: {error}</p>;

  return (
    <div className="p-4 flex flex-col space-y-4 h-full">
      <h1 className="text-xl font-bold">
        Server: {serverId} / Channel: {channelId}
      </h1>

      <div className="flex-1 overflow-auto space-y-2">
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

      {/* 投稿フォーム */}
      <div className="flex mt-2 gap-2">
        <input
          type="text"
          placeholder="メッセージを入力..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          className="flex-1 px-3 py-2 rounded bg-gray-200 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleSendMessage}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
        >
          送信
        </button>
      </div>
    </div>
  );
}
