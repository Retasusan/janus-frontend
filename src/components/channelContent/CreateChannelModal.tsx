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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">新しいチャンネルを作成</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* チャンネルタイプ選択 */}
          {!selectedType ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                チャンネルタイプを選択
              </label>
              <div className="grid grid-cols-2 gap-2">
                {availablePlugins.map((plugin) => (
                  <button
                    key={plugin.meta.type}
                    type="button"
                    onClick={() => handleTypeSelect(plugin.meta.type)}
                    className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <div className="flex items-center space-x-2">
                      <div style={{ color: plugin.meta.color }}>
                        {plugin.meta.icon}
                      </div>
                      <div>
                        <div className="font-medium">{plugin.meta.name}</div>
                        <div className="text-xs text-gray-500">
                          {plugin.meta.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* 選択されたタイプの表示 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div style={{ color: selectedPlugin?.meta.color }}>
                    {selectedPlugin?.meta.icon}
                  </div>
                  <span className="font-medium">{selectedPlugin?.meta.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedType(null)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  変更
                </button>
              </div>

              {/* チャンネル名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  チャンネル名 *
                </label>
                <input
                  type="text"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="チャンネル名を入力"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* 説明 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  説明（オプション）
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="チャンネルの説明を入力"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* プラグイン固有の設定フォーム */}
              {selectedPlugin?.CreateForm && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!selectedType || !channelName.trim() || isSubmitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '作成中...' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}