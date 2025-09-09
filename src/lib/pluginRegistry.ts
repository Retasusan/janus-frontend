import { ChannelPlugin } from '@/types/plugin';
import { ChannelType } from '@/types/channel';

// プラグインレジストリ
class PluginRegistry {
  private plugins = new Map<ChannelType, ChannelPlugin>();

  // プラグインを登録
  register(plugin: ChannelPlugin) {
    this.plugins.set(plugin.meta.type, plugin);
  }

  // プラグインを取得
  get(type: ChannelType): ChannelPlugin | undefined {
    return this.plugins.get(type);
  }

  // 全プラグインを取得
  getAll(): ChannelPlugin[] {
    return Array.from(this.plugins.values());
  }

  // 利用可能なチャンネルタイプを取得
  getAvailableTypes(): ChannelType[] {
    return Array.from(this.plugins.keys());
  }
}

// シングルトンインスタンス
export const pluginRegistry = new PluginRegistry();