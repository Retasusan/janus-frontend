"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onJoinServer: (inviteCode: string) => Promise<void>;
};

export default function JoinServerModal({ isOpen, onClose, onJoinServer }: Props) {
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await onJoinServer(inviteCode.trim());
      setInviteCode("");
      onClose();
    } catch (err: any) {
      if (err.message.includes("404")) {
        setError("招待コードが見つかりません。正しいコードを入力してください。");
      } else if (err.message.includes("403")) {
        setError("このサーバーに参加する権限がありません。");
      } else if (err.message.includes("409")) {
        setError("既にこのサーバーに参加しています。");
      } else {
        setError(err.message || "サーバーへの参加に失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl">サーバーに参加</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-2">
                招待コード
              </label>
              <input
                id="inviteCode"
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="例: abc123def456"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={loading || !inviteCode.trim()}
              >
                {loading ? "参加中..." : "参加"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}