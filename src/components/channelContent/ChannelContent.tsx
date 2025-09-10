"use client";

import { BaseChannel, ChannelType } from '@/types/channel';
import BaseChannelContent from './BaseChannelContent';
import '@/lib/initializePlugins'; // プラグインを初期化

// 後方互換性のための型定義
export type Channel = {
  id: number;
  name: string;
  serverId: number;
  type?: ChannelType; // オプショナルにして後方互換性を保つ
};

export type Message = {
  id: number;
  content: string;
  author: string;
  createdAt: string;
};

type Props = {
  channel: Channel;
};

export default function ChannelContent({ channel }: Props) {
  // 既存のChannelをBaseChannelに変換
  const baseChannel: BaseChannel = {
    id: channel.id,
    name: channel.name,
    serverId: channel.serverId,
    type: channel.type || ChannelType.TEXT, // デフォルトはテキストチャンネル
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <div className="h-full">
      <BaseChannelContent channel={baseChannel} />
    </div>
  );
}