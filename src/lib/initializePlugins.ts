import { pluginRegistry } from './pluginRegistry';
import { textChannelPlugin } from '@/plugins/chat/TextChannelPlugin';
import { fileSharePlugin } from '@/plugins/file-share/FileSharePlugin';
import { calendarPlugin } from '@/plugins/calendar/CalendarPlugin';
import { wikiPlugin } from '@/plugins/wiki/WikiPlugin';
import { whiteboardPlugin } from '@/plugins/whiteboard/WhiteboardPlugin';
import { surveyPlugin } from '@/plugins/survey/SurveyPlugin';
import { tasksPlugin } from '@/plugins/tasks/TasksPlugin';
import { budgetPlugin } from '@/plugins/budget/BudgetPlugin';
import { inventoryPlugin } from '@/plugins/inventory/InventoryPlugin';
import { diaryPlugin } from '@/plugins/diary/DiaryPlugin';

// プラグインを登録する関数
export function initializePlugins() {
  // 基本的なプラグインを登録
  pluginRegistry.register(textChannelPlugin);
  pluginRegistry.register(fileSharePlugin);
  pluginRegistry.register(calendarPlugin);
  // 新規追加プラグイン
  pluginRegistry.register(wikiPlugin);
  pluginRegistry.register(whiteboardPlugin);
  pluginRegistry.register(surveyPlugin);
  pluginRegistry.register(tasksPlugin);
  pluginRegistry.register(budgetPlugin);
  pluginRegistry.register(inventoryPlugin);
  pluginRegistry.register(diaryPlugin);
  
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