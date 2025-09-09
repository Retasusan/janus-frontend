// チャンネルタイプの定義
export enum ChannelType {
  TEXT = 'text',
  VOICE = 'voice',
  CALENDAR = 'calendar',
  FILE_SHARE = 'file-share',
  PROJECT = 'project',
  SURVEY = 'survey',
  WHITEBOARD = 'whiteboard',
  WIKI = 'wiki',
}

// 基本的なチャンネル型
export interface BaseChannel {
  id: number;
  name: string;
  serverId: number;
  type: ChannelType;
  description?: string;
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// メッセージ型（テキストチャンネル用）
export interface Message {
  id: number;
  content: string;
  author: string;
  createdAt: string;
  channelId: number;
  attachments?: Attachment[];
}

// 添付ファイル型
export interface Attachment {
  id: number;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
}

// チャンネル作成用の型
export interface CreateChannelRequest {
  name: string;
  type: ChannelType;
  description?: string;
  settings?: Record<string, any>;
}