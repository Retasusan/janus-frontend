"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Server } from "../serverSidebar/ServerSidebar";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  server: Server | null;
};

export default function InviteCodeModal({ isOpen, onClose, server }: Props) {
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && server) {
      generateInviteCode();
    }
  }, [isOpen, server]);

  const generateInviteCode = async () => {
    if (!server) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/servers/${server.id}/invite`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`招待コードの生成に失敗しました (${res.status})`);
      }

      const data = await res.json();
      setInviteCode(data.inviteCode);
    } catch (err: any) {
      setError(err.message || "招待コードの生成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!inviteCode) return;

    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("クリップボードへのコピーに失敗しました:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl">招待コードを作成</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {server && (
              <div className="text-sm text-gray-600">
                サーバー: <span className="font-semibold">{server.name}</span>
              </div>
            )}

            {loading && (
              <div className="text-center py-4">
                <div className="text-gray-500">招待コードを生成中...</div>
              </div>
            )}

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            {inviteCode && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    招待コード
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={inviteCode}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                    >
                      {copied ? "コピー済み" : "コピー"}
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-200">
                  💡 この招待コードを他のユーザーに共有して、サーバーに招待しましょう。コードは一度生成されると永続的に有効です。
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                閉じる
              </Button>
              {inviteCode && (
                <Button
                  type="button"
                  onClick={generateInviteCode}
                  disabled={loading}
                >
                  新しいコードを生成
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}