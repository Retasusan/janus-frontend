"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Message = {
  id: number;
  author: string;
  content: string;
};

const mockMessages: Record<string, Message[]> = {
  "1-1": [
    { id: 1, author: "Alice", content: "こんにちは！" },
    { id: 2, author: "Bob", content: "お疲れ様です。" },
  ],
  "1-2": [{ id: 3, author: "Charlie", content: "ランダムな話題" }],
  "1-3": [{ id: 4, author: "Dave", content: "プロジェクトの進捗どうですか？" }],
  "2-1": [{ id: 5, author: "Eve", content: "サーバー2の一般チャネルです。" }],
  "2-2": [
    { id: 6, author: "Frank", content: "サーバー2のランダムチャネルです。" },
  ],
  "2-3": [
    {
      id: 7,
      author: "Grace",
      content: "サーバー2のプロジェクトチャネルです。",
    },
  ],
};

export default function ChannelPage() {
  const params = useParams();
  const { serverId, channelId } = params;

  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // サーバーIDとチャンネルIDでキーを作成してモックを取得
    const key = `${serverId}-${channelId}`;
    setMessages(mockMessages[key] || []);
  }, [serverId, channelId]);

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
