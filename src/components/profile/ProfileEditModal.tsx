"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  user: { name: string; email: string; picture: string; sub: string };
  onSave: (userData: { name: string; avatar: string }) => Promise<void>;
};

// 事前定義されたアバターオプション
const AVATAR_OPTIONS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=2", 
  "https://api.dicebear.com/7.x/avataaars/svg?seed=3",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=4",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=5",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=6",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=7",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=8",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=1",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=2",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=3",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=4",
];

export default function ProfileEditModal({ isOpen, onClose, user, onSave }: Props) {
  const [name, setName] = useState(user.name);
  const [selectedAvatar, setSelectedAvatar] = useState(user.picture || AVATAR_OPTIONS[0]);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB制限
        setError("ファイルサイズは5MB以下にしてください");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCustomAvatar(result);
        setSelectedAvatar(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await onSave({
        name: name.trim(),
        avatar: selectedAvatar,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "プロフィールの更新に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl bg-gray-800/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white mb-2">プロフィールを編集</h2>
          <p className="text-gray-400">名前とアイコンを変更できます</p>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 現在のアイコン表示 */}
            <div className="flex items-center space-x-4 mb-6">
              <Avatar className="w-20 h-20 border-4 border-white/20">
                <AvatarImage src={selectedAvatar} alt={name} />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-purple-500 to-blue-600 text-white">
                  {name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold text-white">{name}</h3>
                <p className="text-gray-400 text-sm">{user.email}</p>
              </div>
            </div>

            {/* 名前入力 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white mb-3">
                表示名
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="表示名を入力"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors"
                disabled={loading}
                required
              />
            </div>

            {/* アバター選択 */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                アイコンを選択
              </label>
              
              {/* ファイルアップロード */}
              <div className="mb-4">
                <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  ローカル画像をアップロード
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-gray-400 text-sm mt-1">JPG, PNG, GIF (最大5MB)</p>
              </div>

              {/* プリセットアバター */}
              <div className="grid grid-cols-6 gap-3 max-h-64 overflow-y-auto p-2 bg-white/5 rounded-xl">
                {AVATAR_OPTIONS.map((avatar, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setSelectedAvatar(avatar);
                      setCustomAvatar(null);
                    }}
                    className={`relative w-16 h-16 rounded-full overflow-hidden border-2 transition-all hover:scale-105 ${
                      selectedAvatar === avatar && !customAvatar
                        ? "border-purple-400 ring-2 ring-purple-400/50"
                        : "border-white/20 hover:border-white/40"
                    }`}
                  >
                    <Avatar className="w-full h-full">
                      <AvatarImage src={avatar} alt={`Avatar ${index + 1}`} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white text-sm">
                        {index + 1}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="text-red-300 text-sm bg-red-500/20 border border-red-500/30 p-4 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-gray-300 font-medium transition-all disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl text-white font-medium transition-all transform hover:-translate-y-1 disabled:transform-none disabled:opacity-50"
              >
                {loading ? "保存中..." : "保存"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
