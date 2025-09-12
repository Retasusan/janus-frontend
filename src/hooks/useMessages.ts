import { useState, useEffect } from 'react';

interface Message {
  id: string;
  content: string;
  user_id: string;
  username: string;
  created_at: string;
  // 他の必要なフィールド
}

export function useMessages(serverId: string, channelId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/servers/${serverId}/channels/${channelId}/messages`);
      if (!response.ok) {
        throw new Error('メッセージの取得に失敗しました');
      }
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/servers/${serverId}/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('メッセージの送信に失敗しました');
      }

      // POSTレスポンスで最新のメッセージ一覧を受け取る
      const data = await response.json();
      setMessages(data.messages || []);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      return false;
    }
  };

  useEffect(() => {
    if (serverId && channelId) {
      fetchMessages();
    }
  }, [serverId, channelId]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    refetch: fetchMessages,
  };
}