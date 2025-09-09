"use client";

import { BaseChannel } from '@/types/channel';
import { pluginRegistry } from '@/lib/pluginRegistry';

interface Props {
  channel: BaseChannel;
}

export default function BaseChannelContent({ channel }: Props) {
  // プラグインレジストリからチャンネルタイプに対応するプラグインを取得
  const plugin = pluginRegistry.get(channel.type);

  if (!plugin) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">
            未対応のチャンネルタイプ
          </div>
          <div className="text-gray-500">
            チャンネルタイプ「{channel.type}」に対応するプラグインが見つかりません
          </div>
        </div>
      </div>
    );
  }

  // プラグインのContentComponentを動的にレンダリング
  const { ContentComponent } = plugin;
  
  return <ContentComponent channel={channel} />;
}