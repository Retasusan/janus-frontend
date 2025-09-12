"use client";

import React, { useEffect, useState } from "react";
import ModalPortal from "../ui/ModalPortal";
import { Server } from "../serverSidebar/ServerSidebar";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  server: Server | null;
};

export default function InviteCodeModal({ isOpen, onClose, server }: Props) {
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && server) {
      generateInviteCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setInviteCode(data?.inviteCode ?? null);
    } catch (err: any) {
      setError(err?.message ?? "招待コードの生成に失敗しました");
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
    <ModalPortal isOpen={isOpen}>
      <div
        style={{ pointerEvents: "auto" }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <div className="max-w-xl w-full bg-gray-900/80 border border-white/10 rounded-2xl p-6">
          <h3 className="text-2xl font-semibold mb-4 text-white">サーバー招待コード</h3>

          <div className="space-y-4">
            {error && <div className="text-sm text-red-400">{error}</div>}

            {inviteCode ? (
              <div className="flex items-center space-x-4">
                <input
                  readOnly
                  value={inviteCode}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-mono"
                />
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-green-600 rounded-lg text-white"
                >
                  {copied ? "✓ コピー済み" : "コピー"}
                </button>
                <button
                  type="button"
                  onClick={generateInviteCode}
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 rounded-lg text-white disabled:opacity-50"
                >
                  {loading ? "生成中..." : "新しいコードを生成"}
                </button>
              </div>
            ) : (
              <div className="text-sm text-gray-300">招待コードを生成するにはボタンを押してください。</div>
            )}

            <div className="text-sm text-blue-300 bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
              💡 この招待コードを他のユーザーに共有して、サーバーに招待しましょう。
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/5 rounded-lg text-gray-200"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}