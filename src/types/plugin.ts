import { ReactNode } from 'react';
import { BaseChannel, ChannelType } from './channel';

// プラグインのメタデータ
export interface ChannelPluginMeta {
  type: ChannelType;
  name: string;
  description: string;
  icon: ReactNode;
  color: string;
}

// チャンネル作成時の設定フォーム
export interface ChannelCreateFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

// チャンネルコンテンツのプロパティ
export interface ChannelContentProps {
  channel: BaseChannel;
}

// チャンネルプラグインのインターフェース
export interface ChannelPlugin {
  meta: ChannelPluginMeta;
  
  // チャンネル作成フォームコンポーネント（オプション）
  CreateForm?: React.ComponentType<ChannelCreateFormProps>;
  
  // メインのチャンネルコンテンツコンポーネント
  ContentComponent: React.ComponentType<ChannelContentProps>;
  
  // チャンネル設定コンポーネント（オプション）
  SettingsComponent?: React.ComponentType<ChannelContentProps>;
  
  // サイドバーでの表示用アイコン（オプション）
  SidebarIcon?: React.ComponentType<{ channel: BaseChannel }>;
}