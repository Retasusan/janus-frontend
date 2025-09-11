"use client";

import { useState } from 'react';
import { ChannelType, CreateChannelRequest } from '@/types/channel';
import { pluginRegistry } from '@/lib/pluginRegistry';

interface Props {
  serverId: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateChannelRequest) => Promise<void>;
}

export default function CreateChannelModal({ serverId, isOpen, onClose, onSubmit }: Props) {
  const [selectedType, setSelectedType] = useState<ChannelType | null>(null);
  const [channelName, setChannelName] = useState('');
  const [description, setDescription] = useState('');
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availablePlugins = pluginRegistry.getAll();

  const handleTypeSelect = (type: ChannelType) => {
    setSelectedType(type);
    setSettings({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !channelName.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: channelName.trim(),
        type: selectedType,
        description: description.trim() || undefined,
        settings: Object.keys(settings).length > 0 ? settings : undefined,
      });
      
      // リセット
      setSelectedType(null);
      setChannelName('');
      setDescription('');
      setSettings({});
      onClose();
    } catch (error) {
      console.error('チャンネル作成エラー:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPlugin = selectedType ? pluginRegistry.get(selectedType) : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800/95 backdrop-blur-sm border border-white/20 rounded-2xl p-8 w-full max-w-2xl mx-4 text-white max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">新しいチャンネルを作成</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* チャンネルタイプ選択 */}
          {!selectedType ? (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">
                チャンネルタイプを選択
              </label>
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {availablePlugins.map((plugin) => (
                  <button
                    key={plugin.meta.type}
                    type="button"
                    onClick={() => handleTypeSelect(plugin.meta.type)}
                    className="p-3 bg-white/5 border border-white/20 rounded-xl hover:bg-white/10 hover:border-purple-400/50 text-left transition-all group flex flex-col items-center text-center"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-2" style={{ color: plugin.meta.color }}>
                      {plugin.meta.icon}
                    </div>
                    <div className="font-semibold text-white group-hover:text-purple-300 transition-colors text-sm mb-1">{plugin.meta.name}</div>
                    <div className="text-xs text-gray-400 line-clamp-2">
                      {plugin.meta.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* 選択されたタイプの表示 */}
              <div className="flex items-center justify-between bg-white/5 rounded-xl p-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center" style={{ color: selectedPlugin?.meta.color }}>
                    {selectedPlugin?.meta.icon}
                  </div>
                  <span className="font-semibold text-white">{selectedPlugin?.meta.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedType(null)}
                  className="text-sm text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg transition-colors"
                >
                  変更
                </button>
              </div>

              {/* チャンネル名 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  チャンネル名 *
                </label>
                <input
                  type="text"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="チャンネル名を入力"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white placeholder-gray-400"
                  required
                />
              </div>

              {/* 説明 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  説明（オプション）
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="チャンネルの説明を入力"
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white placeholder-gray-400 resize-none"
                />
              </div>

              {/* プラグイン固有の設定フォーム */}
              {selectedPlugin?.CreateForm && (
                <div className="bg-white/5 rounded-xl p-4">
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    詳細設定
                  </label>
                  <selectedPlugin.CreateForm
                    onSubmit={setSettings}
                    onCancel={() => setSettings({})}
                  />
                </div>
              )}
            </>
          )}

          {/* ボタン */}
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-300 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 hover:text-white transition-all"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!selectedType || !channelName.trim() || isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all transform hover:-translate-y-1 hover:shadow-lg disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {isSubmitting ? '作成中...' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}