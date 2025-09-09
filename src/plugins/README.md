# チャンネルプラグインシステム

このディレクトリには、様々なチャンネルタイプに対応するプラグインが含まれています。

## 概要

Janusでは、プラグインシステムを使用して様々なタイプのチャンネルを作成できます。各プラグインは独自のUI、機能、設定を提供します。

## 利用可能なプラグイン

### 1. テキストチャンネル (`chat/TextChannelPlugin.tsx`)
- **機能**: リアルタイムテキストメッセージング
- **アイコン**: #
- **用途**: 一般的なチャット、ディスカッション

### 2. ファイル共有チャンネル (`file-share/FileSharePlugin.tsx`)
- **機能**: ファイルのアップロード、ダウンロード、共有
- **アイコン**: 📁
- **設定**: 最大ファイルサイズ、許可するファイルタイプ
- **用途**: ドキュメント共有、画像共有

### 3. カレンダーチャンネル (`calendar/CalendarPlugin.tsx`)
- **機能**: イベント作成、スケジュール管理
- **アイコン**: 📅
- **設定**: メンバー権限、承認フロー
- **用途**: ミーティング予定、プロジェクトスケジュール

## 新しいプラグインの作成

### 1. プラグインの基本構造

```typescript
import { ChannelPlugin } from '@/types/plugin';
import { ChannelType } from '@/types/channel';

// コンテンツコンポーネント
function MyChannelContent({ channel }: { channel: BaseChannel }) {
  return (
    <div className="flex flex-col h-full">
      {/* ヘッダー */}
      <div className="h-16 flex items-center px-4 border-b border-gray-300 bg-white shadow-sm">
        <h1 className="text-lg font-semibold text-gray-800">{channel.name}</h1>
      </div>
      
      {/* メインコンテンツ */}
      <div className="flex-1 p-4">
        {/* あなたのカスタムUI */}
      </div>
    </div>
  );
}

// プラグイン定義
export const myChannelPlugin: ChannelPlugin = {
  meta: {
    type: ChannelType.CUSTOM, // 新しいタイプを定義
    name: 'カスタムチャンネル',
    description: 'カスタム機能を提供するチャンネル',
    icon: <span className="text-lg">🎯</span>,
    color: '#8b5cf6',
  },
  ContentComponent: MyChannelContent,
};
```

### 2. 設定フォームの追加（オプション）

```typescript
function MyCreateForm({ onSubmit }: ChannelCreateFormProps) {
  const [setting1, setSetting1] = useState('');
  
  const handleSubmit = () => {
    onSubmit({ setting1 });
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={setting1}
        onChange={(e) => setSetting1(e.target.value)}
        placeholder="設定値を入力"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
      />
      <button onClick={handleSubmit}>設定を保存</button>
    </div>
  );
}

// プラグインに追加
export const myChannelPlugin: ChannelPlugin = {
  // ... 他の設定
  CreateForm: MyCreateForm,
};
```

### 3. プラグインの登録

`src/lib/initializePlugins.ts` にプラグインを追加：

```typescript
import { myChannelPlugin } from '@/plugins/my-plugin/MyPlugin';

export function initializePlugins() {
  // 既存のプラグイン
  pluginRegistry.register(textChannelPlugin);
  pluginRegistry.register(fileSharePlugin);
  pluginRegistry.register(calendarPlugin);
  
  // 新しいプラグイン
  pluginRegistry.register(myChannelPlugin);
}
```

### 4. チャンネルタイプの追加

`src/types/channel.ts` に新しいタイプを追加：

```typescript
export enum ChannelType {
  TEXT = 'text',
  VOICE = 'voice',
  CALENDAR = 'calendar',
  FILE_SHARE = 'file-share',
  PROJECT = 'project',
  SURVEY = 'survey',
  WHITEBOARD = 'whiteboard',
  WIKI = 'wiki',
  CUSTOM = 'custom', // 新しいタイプ
}
```

## 使用方法

### チャンネル作成

```typescript
import CreateChannelModal from '@/components/channelContent/CreateChannelModal';

function MyComponent() {
  const [showModal, setShowModal] = useState(false);

  const handleCreateChannel = async (data: CreateChannelRequest) => {
    // APIを呼び出してチャンネルを作成
    const response = await fetch('/api/channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  };

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        チャンネル作成
      </button>
      
      <CreateChannelModal
        serverId={serverId}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreateChannel}
      />
    </>
  );
}
```

### チャンネル表示

```typescript
import BaseChannelContent from '@/components/channelContent/BaseChannelContent';

function ChannelView({ channel }: { channel: BaseChannel }) {
  return <BaseChannelContent channel={channel} />;
}
```

## ベストプラクティス

1. **一貫性のあるUI**: 他のプラグインと一貫したデザインを使用
2. **エラーハンドリング**: 適切なローディング状態とエラー表示
3. **レスポンシブデザイン**: モバイルデバイスでも使いやすいUI
4. **アクセシビリティ**: キーボードナビゲーションとスクリーンリーダー対応
5. **パフォーマンス**: 大量のデータを効率的に処理

## 今後の拡張予定

- Wiki チャンネル
- ホワイトボード チャンネル
- アンケート チャンネル
- プロジェクト管理チャンネル
- 音声チャンネル