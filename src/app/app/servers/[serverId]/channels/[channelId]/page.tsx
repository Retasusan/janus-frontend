"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { Send, Reply, Trash2, MoreVertical } from "lucide-react";
import { useRealTimePolling } from "@/hooks/useRealTimePolling";

type Message = {
  id: number;
  author: string;
  content: string;
  created_at: string;
  reply_to?: number;
  is_own?: boolean;
};

export default function ChannelPage() {
  const params = useParams();
  const { serverId, channelId } = params;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialLoadRef = useRef<boolean>(true);
  const [currentUser, setCurrentUser] = useState<string>("");

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [showDropdown, setShowDropdown] = useState<number | null>(null);

  // 現在のユーザー情報を取得
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const userData = await res.json();
          setCurrentUser(userData.name || userData.email || 'You');
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error);
      }
    };
    fetchCurrentUser();
  }, []);

  // メッセージ取得関数
  const fetchMessages = useCallback(async () => {
    if (!serverId || !channelId) return;

    const isInitial = initialLoadRef.current;
    if (isInitial) setLoading(true);

    try {
      // チャンネルメタデータ確認
      const chRes = await fetch(`/api/servers/${serverId}/channels`, { credentials: 'include' });
      if (!chRes.ok) throw new Error(`Failed to fetch channel metadata (${chRes.status})`);
      const chData: any[] = await chRes.json();
      const channel = chData.find((c) => String(c.id) === String(channelId));

      if (!channel) {
        setMessages([]);
        setError('Channel metadata not found');
        return;
      }

      if (channel.type !== 'text') {
        setMessages([]);
        return;
      }

      const res = await fetch(`/api/servers/${serverId}/channels/${channelId}/messages`, { credentials: 'include' });
      if (!res.ok) throw new Error(`Failed to fetch messages (${res.status})`);
      const data: Message[] = await res.json();

      // メッセージに自分のものかどうかの情報を追加
      const messagesWithOwnership = data.map(msg => ({
        ...msg,
        is_own: msg.author === currentUser
      }));

      setMessages(messagesWithOwnership);
    } catch (err: any) {
      setError(err.message);
    } finally {
      if (isInitial) {
        setLoading(false);
        initialLoadRef.current = false;
      }
    }
  }, [serverId, channelId, currentUser]);

  // 初期読み込み
  useEffect(() => {
    setLoading(true);
    fetchMessages();
  }, [fetchMessages]);

  // リアルタイム更新（3秒間隔）
  useRealTimePolling(fetchMessages, 3000);

  // 新しいメッセージが来たら自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // メッセージ送信
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const payload: any = { content: newMessage };
      if (replyTo) {
        payload.reply_to = replyTo.id;
      }

      const res = await fetch(
        `/api/servers/${serverId}/channels/${channelId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) throw new Error(`Failed to send message (${res.status})`);

      const msg: Message = await res.json();
      setMessages((prev) => [...prev, { ...msg, is_own: true }]);
      setNewMessage("");
      setReplyTo(null);
    } catch (err: any) {
      alert(`メッセージ送信エラー: ${err.message}`);
    }
  };

  // メッセージ削除
  const handleDeleteMessage = async (messageId: number) => {
    if (!confirm('このメッセージを削除しますか？')) return;

    try {
      const res = await fetch(
        `/api/servers/${serverId}/channels/${channelId}/messages/${messageId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error(`Failed to delete message (${res.status})`);

      setMessages((prev) => prev.filter(msg => msg.id !== messageId));
      setShowDropdown(null);
    } catch (err: any) {
      alert(`メッセージ削除エラー: ${err.message}`);
    }
  };

  const getRepliedMessage = (replyToId: number) => {
    return messages.find(msg => msg.id === replyToId);
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400"></div>
        <p className="text-gray-300 font-medium">メッセージを読み込み中...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-red-500/20 rounded-2xl mx-auto flex items-center justify-center">
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="text-red-400 font-medium">エラー: {error}</p>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mx-auto flex items-center justify-center">
                <Send className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-xl font-semibold text-white mb-2">会話を始めましょう</p>
                <p className="text-gray-400">最初のメッセージを送信してください</p>
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const repliedMsg = msg.reply_to ? getRepliedMessage(msg.reply_to) : null;
            
            return (
              <div
                key={msg.id}
                className={`flex ${msg.is_own ? 'justify-end' : 'justify-start'} group`}
              >
                <div className={`max-w-xs lg:max-w-md relative ${msg.is_own ? 'order-2' : 'order-1'}`}>
                  {/* リプライ表示 */}
                  {repliedMsg && (
                    <div className="mb-2 pl-3 border-l-2 border-gray-500">
                      <p className="text-xs text-gray-400 mb-1">返信先: {repliedMsg.author}</p>
                      <p className="text-sm text-gray-300 truncate">{repliedMsg.content}</p>
                    </div>
                  )}
                  
                  {/* メッセージバブル */}
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      msg.is_own
                        ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white'
                        : 'bg-white/10 backdrop-blur-sm border border-white/20 text-white'
                    }`}
                  >
                    {!msg.is_own && (
                      <p className="text-xs font-semibold mb-1 text-gray-300">{msg.author}</p>
                    )}
                    <p className="break-words">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.is_own ? 'text-white/70' : 'text-gray-400'}`}>
                      {new Date(msg.created_at).toLocaleTimeString('ja-JP', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>

                  {/* アクションボタン */}
                  <div className="flex items-center space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setReplyTo(msg)}
                      className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                      title="返信"
                    >
                      <Reply className="w-4 h-4 text-gray-300" />
                    </button>
                    
                    {msg.is_own && (
                      <div className="relative">
                        <button
                          onClick={() => setShowDropdown(showDropdown === msg.id ? null : msg.id)}
                          className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-300" />
                        </button>
                        
                        {showDropdown === msg.id && (
                          <div className="absolute right-0 mt-2 w-32 bg-gray-800 border border-white/20 rounded-lg shadow-lg z-10">
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="w-full px-3 py-2 text-left text-red-400 hover:bg-white/10 rounded-lg flex items-center space-x-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>削除</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <div className="p-4 bg-white/5 backdrop-blur-sm border-t border-white/10">
        {replyTo && (
          <div className="mb-3 p-3 bg-white/10 rounded-lg flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-400">返信先: {replyTo.author}</p>
              <p className="text-sm text-white truncate">{replyTo.content}</p>
            </div>
            <button
              onClick={() => setReplyTo(null)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        )}
        
        <div className="flex space-x-3">
          <input
            type="text"
            placeholder="メッセージを入力..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl text-white font-medium transition-all transform hover:-translate-y-1 disabled:transform-none disabled:opacity-50 flex items-center space-x-2"
          >
            <Send className="w-5 h-5" />
            <span className="hidden sm:inline">送信</span>
          </button>
        </div>
      </div>
    </div>
  );
}
