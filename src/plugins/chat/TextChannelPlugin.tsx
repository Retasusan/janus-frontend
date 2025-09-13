import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useEffect, useRef, useState } from "react";
import { ChannelPlugin } from '@/types/plugin';
import { ChannelType, BaseChannel } from '@/types/channel';

// メッセージ型（既存のものを再利用）
interface Message {
  id: number;
  content: string;
  created_at: string;
  author: string;
  author_name?: string;
  author_avatar?: string;
  reply_to?: number;
  is_own?: boolean;
}

// 日付フォーマット用のヘルパー関数
const formatMessageTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return '時刻不明';
    }
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('日付フォーマットエラー:', error, dateString);
    return '時刻不明';
  }
};

// 日付表示用のヘルパー関数（詳細版）
const formatMessageDateTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return '日時不明';
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // 今日のメッセージ
    if (messageDate.getTime() === today.getTime()) {
      return `今日 ${date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`;
    }
    // 昨日のメッセージ
    else if (messageDate.getTime() === yesterday.getTime()) {
      return `昨日 ${date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`;
    }
    // それ以前のメッセージ
    else {
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  } catch (error) {
    console.error('日付フォーマットエラー:', error, dateString);
    return '日時不明';
  }
};

// ユーザー名を取得するヘルパー関数
const getDisplayName = (msg: any) => {
  console.log('getDisplayName called with:', msg); // デバッグ用

  // 優先順位を調整
  if (msg.author_name) return msg.author_name;
  if (msg.author?.display_name) return msg.author.display_name;
  if (msg.author?.name) return msg.author.name;
  if (typeof msg.author === 'string' && msg.author && msg.author !== 'Unknown User') return msg.author;
  if (msg.author?.email) return msg.author.email;
  return 'Unknown User';
};

// アバターの初期文字を取得するヘルパー関数
const getAvatarInitial = (msg: any) => {
  const name = getDisplayName(msg);
  return name.charAt(0).toUpperCase();
};

// アバター画像URLを取得するヘルパー関数
const getAvatarUrl = (msg: any) => {
  return msg.author_avatar || msg.author?.avatar_url || msg.author?.picture || null;
};

// テキストチャンネルのコンテンツコンポーネント
function TextChannelContent({ channel }: { channel: BaseChannel }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<any | null>(null);
  const [showDropdown, setShowDropdown] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<string>("");
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showDetailedTime, setShowDetailedTime] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const initialLoadRef = useRef<boolean>(true);

  // 現在のユーザー情報を取得
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const userData = await res.json();
          console.log('Full user data:', userData); // デバッグ用

          // 複数のフィールドをチェックしてユーザー名を決定
          const userName = userData.name ||
            userData.nickname ||
            userData.email ||
            userData.preferred_username ||
            userData.sub ||
            'You';

          console.log('Current user set to:', userName); // デバッグ用
          setCurrentUser(userName);
          setCurrentUserData(userData);
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      const isInitial = initialLoadRef.current;
      if (isInitial) setLoading(true);
      setError(null);

      if (channel.type !== ChannelType.TEXT) {
        setMessages([]);
        if (isInitial) setLoading(false);
        return;
      }

      if (!currentUser) {
        if (isInitial) setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/servers/${channel.serverId}/channels/${channel.id}/messages`,
          { credentials: "include" }
        );

        if (res.ok) {
          const data: any[] = await res.json();
          console.log('Messages received:', data); // デバッグ用
          console.log('Current user for comparison:', currentUser); // デバッグ用

          // メッセージに自分のものかどうかの情報を追加し、日付を正規化
          const messagesWithOwnership = data.map(msg => {
            // より詳細な作成者情報の処理
            const authorName = getDisplayName(msg);

            // 自分のメッセージかどうかの判定（複数の条件でチェック）
            const isOwn = msg.author === currentUser ||
              msg.author_name === currentUser ||
              (msg.author?.name && msg.author.name === currentUser) ||
              (msg.author?.email && msg.author.email === currentUser) ||
              (currentUserData?.email && msg.author === currentUserData.email) ||
              (currentUserData?.sub && msg.author === currentUserData.sub);

            console.log(`Message from ${authorName} (raw author: ${JSON.stringify(msg.author)}, author_name: ${msg.author_name}), current user: ${currentUser}, is_own: ${isOwn}`); // デバッグ用

            // 日付フィールドの正規化
            const normalizedCreatedAt = msg.created_at || msg.createdAt || new Date().toISOString();

            return {
              ...msg,
              created_at: normalizedCreatedAt,
              is_own: isOwn
            };
          });
          setMessages(messagesWithOwnership);
        } else {
          setMessages([]);
        }
      } catch (err: any) {
        setError(err.message);
        setMessages([]);
      } finally {
        if (isInitial) {
          setLoading(false);
          initialLoadRef.current = false;
        }
      }
    };

    // リアルタイム更新のためのポーリング
    const interval = setInterval(fetchMessages, 3000);
    fetchMessages();

    return () => clearInterval(interval);
  }, [channel, currentUser, currentUserData]);

  // メッセージが更新されたら自動スクロールが有効な場合のみ最下部にスクロール
  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScroll]);

  // スクロール位置を監視して自動スクロールを制御
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

      // ユーザーが手動でスクロールして底から離れた場合は自動スクロールを無効に
      if (!isNearBottom && autoScroll) {
        setAutoScroll(false);
      }
      // ユーザーが底に戻った場合は自動スクロールを有効に
      else if (isNearBottom && !autoScroll) {
        setAutoScroll(true);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [autoScroll]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim() || sending) return;

    setSending(true);
    try {
      const payload: any = { content: messageInput.trim() };
      if (replyTo) {
        payload.reply_to = replyTo.id;
      }

      const res = await fetch(
        `/api/servers/${channel.serverId}/channels/${channel.id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        const responseData = await res.json();
        console.log('Message send response:', responseData); // デバッグ用

        // POSTレスポンスが単一メッセージか全メッセージリストかを判定
        if (Array.isArray(responseData)) {
          // 全メッセージリストが返された場合（修正済みAPI）
          const messagesWithOwnership = responseData.map(msg => {
            const authorName = getDisplayName(msg);
            const isOwn = msg.author === currentUser ||
              msg.author_name === currentUser ||
              (currentUserData?.email && msg.author === currentUserData.email) ||
              (currentUserData?.sub && msg.author === currentUserData.sub);
            const normalizedCreatedAt = msg.created_at || msg.createdAt || new Date().toISOString();
            return {
              ...msg,
              created_at: normalizedCreatedAt,
              is_own: isOwn
            };
          });
          setMessages(messagesWithOwnership);
        } else {
          // 単一メッセージが返された場合（従来のAPI）
          const newMessage = {
            ...responseData,
            created_at: responseData.created_at || responseData.createdAt || new Date().toISOString(),
            is_own: true
          };
          setMessages((prev) => [...prev, newMessage]);
        }

        setMessageInput("");
        setReplyTo(null);
      } else {
        throw new Error(`メッセージ送信エラー ${res.status}`);
      }
    } catch (err: any) {
      alert(`メッセージ送信エラー: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (!confirm('このメッセージを削除しますか？')) return;

    try {
      const res = await fetch(
        `/api/servers/${channel.serverId}/channels/${channel.id}/messages/${messageId}`,
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400"></div>
          <p className="text-gray-300 font-medium">メッセージを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl mx-auto flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-red-400 font-medium">エラー: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <span className="mr-2">#</span>
          {channel.name}
        </h3>
        <div className="flex items-center space-x-4">
          {/* 現在のユーザー表示（デバッグ用） */}
          <span className="text-xs text-gray-400">
            User: {currentUser}
          </span>
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${autoScroll
              ? 'bg-green-500/20 text-green-400 border border-green-400/30'
              : 'bg-red-500/20 text-red-400 border border-red-400/30'
              }`}
            title={autoScroll ? '自動スクロール: 有効' : '自動スクロール: 無効'}
          >
            {autoScroll ? '🔄 自動' : '⏸️ 手動'}
          </button>
        </div>
      </div>

      {/* メッセージエリア */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mx-auto flex items-center justify-center">
                <span className="text-3xl">#</span>
              </div>
              <div>
                <p className="text-xl font-semibold text-white mb-2">#{channel.name} へようこそ</p>
                <p className="text-gray-400">最初のメッセージを送信してください</p>
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const repliedMsg = msg.reply_to ? getRepliedMessage(msg.reply_to) : null;
            const displayName = getDisplayName(msg);
            const avatarUrl = getAvatarUrl(msg);
            const avatarInitial = getAvatarInitial(msg);

            return (
              <div
                key={msg.id}
                className={`flex ${msg.is_own ? 'justify-end' : 'justify-start'} group mb-4`}
              >
                {/* アバター（左側メッセージのみ） */}
                {!msg.is_own && (
                  <Avatar className="w-10 h-10 mr-3 mt-1 flex-shrink-0">
                    <AvatarImage
                      src={avatarUrl}
                      alt={displayName}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white text-sm">
                      {avatarInitial}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`max-w-xs lg:max-w-md relative ${msg.is_own ? 'order-2' : 'order-1'}`}>
                  {/* リプライ表示 */}
                  {repliedMsg && (
                    <div className="mb-2 pl-3 border-l-2 border-purple-400 bg-white/5 rounded-r-lg p-2">
                      <div className="flex items-center space-x-2 mb-1">
                        <Avatar className="w-4 h-4">
                          <AvatarImage src={getAvatarUrl(repliedMsg)} alt={getDisplayName(repliedMsg)} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white text-xs">
                            {getAvatarInitial(repliedMsg)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-xs text-gray-400">
                          返信先: <span className="text-purple-300 font-medium">{getDisplayName(repliedMsg)}</span>
                        </p>
                      </div>
                      <p className="text-sm text-gray-300 truncate bg-white/5 px-2 py-1 rounded">
                        {repliedMsg.content}
                      </p>
                    </div>
                  )}

                  {/* メッセージバブル */}
                  <div
                    className={`px-4 py-3 rounded-2xl ${msg.is_own
                      ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white'
                      : 'bg-white/10 backdrop-blur-sm border border-white/20 text-white'
                      }`}
                  >
                    {!msg.is_own && (
                      <p className="text-xs font-semibold mb-1 text-gray-300">
                        {displayName}
                      </p>
                    )}
                    <p className="break-words">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.is_own ? 'text-white/70' : 'text-gray-400'}`}>
                      {formatMessageTime(msg.created_at)}
                    </p>
                  </div>

                  {/* アクションボタン */}
                  <div className="flex items-center space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setReplyTo(msg)}
                      className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                      title="返信"
                    >
                      <span className="text-gray-300">↵</span>
                    </button>

                    {msg.is_own && (
                      <div className="relative">
                        <button
                          onClick={() => setShowDropdown(showDropdown === msg.id ? null : msg.id)}
                          className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        >
                          <span className="text-gray-300">⋮</span>
                        </button>

                        {showDropdown === msg.id && (
                          <div className="absolute right-0 mt-2 w-32 bg-gray-800 border border-white/20 rounded-lg shadow-lg z-10">
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="w-full px-3 py-2 text-left text-red-400 hover:bg-white/10 rounded-lg flex items-center space-x-2"
                            >
                              <span>🗑️</span>
                              <span>削除</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* アバター（右側メッセージのみ） */}
                {msg.is_own && (
                  <Avatar className="w-10 h-10 ml-3 mt-1 flex-shrink-0">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white text-sm">
                      {avatarInitial}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <div className="p-4 bg-white/5 backdrop-blur-sm border-t border-white/10">
        {replyTo && (
          <div className="mb-3 p-3 bg-purple-500/20 border border-purple-400/30 rounded-lg flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Avatar className="w-6 h-6">
                <AvatarImage src={getAvatarUrl(replyTo)} alt={getDisplayName(replyTo)} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white text-xs">
                  {getAvatarInitial(replyTo)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs text-purple-300">
                  返信先: <span className="font-medium">{getDisplayName(replyTo)}</span>
                </p>
                <p className="text-sm text-white truncate max-w-md">{replyTo.content}</p>
              </div>
            </div>
            <button
              onClick={() => setReplyTo(null)}
              className="text-purple-300 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
              title="リプライをキャンセル"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`#${channel.name} にメッセージを送信`}
            disabled={sending}
            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!messageInput.trim() || sending}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl text-white font-medium transition-all transform hover:-translate-y-1 disabled:transform-none disabled:opacity-50 flex items-center space-x-2"
          >
            <span className="hidden sm:inline">{sending ? "送信中..." : "送信"}</span>
            <span>📤</span>
          </button>
        </form>
      </div>
    </div>
  );
}

// テキストチャンネルプラグインの定義
export const textChannelPlugin: ChannelPlugin = {
  meta: {
    type: ChannelType.TEXT,
    name: 'テキストチャンネル',
    description: 'テキストメッセージでのコミュニケーション',
    icon: <span className="text-lg">#</span>,
    color: '#6366f1',
  },
  ContentComponent: TextChannelContent,
};