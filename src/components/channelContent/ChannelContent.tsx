"use client";

import { useEffect, useRef, useState } from "react";

export type Channel = {
  id: number;
  name: string;
  serverId: number;
};

export type Message = {
  id: number;
  content: string;
  author: string;
  createdAt: string;
};

type Props = {
  channel: Channel;
};

export default function ChannelContent({ channel }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/servers/${channel.serverId}/channels/${channel.id}/messages`,
          { credentials: "include" }
        );
        if (res.ok) {
          const data: Message[] = await res.json();
          setMessages(data);
        } else {
          setMessages([]);
        }
      } catch (err: any) {
        setError(err.message);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [channel]);

  // メッセージが更新されたら最下部にスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(
        `/api/servers/${channel.serverId}/channels/${channel.id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content: messageInput.trim() }),
        }
      );

      if (res.ok) {
        const newMessage: Message = await res.json();
        setMessages((prev) => [...prev, newMessage]);
        setMessageInput("");
      } else {
        throw new Error(`メッセージ送信エラー ${res.status}`);
      }
    } catch (err: any) {
      alert(`メッセージ送信エラー: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">メッセージを読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">エラー: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* チャンネルヘッダー */}
      <div className="h-16 flex items-center px-4 border-b border-gray-300 bg-white shadow-sm">
        <div className="flex items-center">
          <span className="text-gray-500 mr-2">#</span>
          <h1 className="text-lg font-semibold text-gray-800">{channel.name}</h1>
        </div>
      </div>

      {/* メッセージエリア */}
      <div className="flex-1 overflow-auto p-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <h3 className="text-xl font-semibold mb-2">#{channel.name} へようこそ！</h3>
            <p>これは #{channel.name} チャンネルの始まりです。</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex flex-col">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-gray-800">{message.author}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(message.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="text-gray-700">{message.content}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* メッセージ入力エリア */}
      <div className="p-4 border-t border-gray-300 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`#${channel.name} にメッセージを送信`}
            disabled={sending}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!messageInput.trim() || sending}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-150"
          >
            {sending ? "送信中..." : "送信"}
          </button>
        </form>
      </div>
    </div>
  );
}