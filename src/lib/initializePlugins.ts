import { pluginRegistry } from './pluginRegistry';
import { textChannelPlugin } from '@/plugins/chat/TextChannelPlugin';
import { fileSharePlugin } from '@/plugins/file-share/FileSharePlugin';
import { calendarPlugin } from '@/plugins/calendar/CalendarPlugin';

// プラグインを登録する関数
export function initializePlugins() {
  // 基本的なプラグインを登録
  pluginRegistry.register(textChannelPlugin);
  pluginRegistry.register(fileSharePlugin);
  pluginRegistry.register(calendarPlugin);
  
  // 他のプラグインもここで登録
  // pluginRegistry.register(wikiPlugin);
  // pluginRegistry.register(whiteboardPlugin);
  // pluginRegistry.register(surveyPlugin);
  // pluginRegistry.register(projectPlugin);
}

// アプリケーション起動時に呼び出す
if (typeof window !== 'undefined') {
  initializePlugins();
}