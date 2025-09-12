"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import ModalPortal from "../ui/ModalPortal";

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
    <ModalPortal isOpen={isOpen}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" style={{ pointerEvents: 'auto' }}>
        <div className="w-full max-w-2xl bg-gray-800/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl">
          <div className="p-8 border-b border-white/10">
            <h2 className="text-3xl font-bold text-white mb-3">サーバーに参加</h2>
            <p className="text-gray-400 text-lg">招待コードを入力してサーバーに参加しましょう</p>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label htmlFor="inviteCode" className="block text-base font-medium text-white mb-4">
                  招待コード
                </label>
                <input
                  id="inviteCode"
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="例: abc123def456"
                  className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors font-mono text-xl"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="text-red-300 text-base bg-red-500/20 border border-red-500/30 p-6 rounded-xl">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-gray-300 font-medium transition-all disabled:opacity-50 text-lg"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={loading || !inviteCode.trim()}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl text-white font-medium transition-all transform hover:-translate-y-1 disabled:transform-none disabled:opacity-50 text-lg"
                >
                  {loading ? "参加中..." : "参加"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}