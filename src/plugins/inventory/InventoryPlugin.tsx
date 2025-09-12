"use client";

import React, { useEffect, useState } from 'react';
import { ChannelPlugin } from '@/types/plugin';
import { ChannelType, BaseChannel } from '@/types/channel';
import { Package, Plus, Download, AlertTriangle, Layers, Box } from 'lucide-react';

export function InventoryContent({ channel }: { channel: BaseChannel }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [location, setLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await globalThis.fetch(`/api/servers/${channel.serverId}/channels/${channel.id}/inventory_items`, { credentials: 'include' });
        const data = res.ok ? await res.json() : [];
        if (mounted) setItems(Array.isArray(data) ? data : []);
      } catch {
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [channel.serverId, channel.id]);

  const create = async () => {
    if (!name.trim()) return;
    const res = await globalThis.fetch(`/api/servers/${channel.serverId}/channels/${channel.id}/inventory_items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ inventory_item: { name: name.trim(), quantity, location } }),
    });
    if (res.ok) {
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    }
    setName(''); setQuantity(0); setLocation('');
  };

  const categories = [...new Set(items.map(item => item.category || 'その他'))];
  const locations = [...new Set(items.map(item => item.location || '不明'))];
  const filteredItems = selectedCategory ? items.filter(item => (item.category || 'その他') === selectedCategory) : items;
  const totalItems = items.length;
  const totalValue = items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0);
  const lowStockItems = items.filter(item => (item.quantity || 0) < 5);

  if (loading) return (
    <div className="h-full bg-gradient-to-br from-orange-900/30 to-amber-700/20 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-400"></div>
        <p className="text-orange-400 font-medium">在庫データを読み込み中...</p>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-gradient-to-br from-orange-900/30 to-amber-700/20">
      {/* ダッシュボードカード */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-6 text-white shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">総アイテム数</p>
                <p className="text-3xl font-bold">{totalItems}</p>
              </div>
              <Box className="w-12 h-12 text-orange-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl p-6 text-white shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">在庫切れ警告</p>
                <p className="text-3xl font-bold text-yellow-200">{lowStockItems.length}</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-yellow-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">カテゴリ数</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
              <Layers className="w-12 h-12 text-green-200" />
            </div>
          </div>
          
          <div className="flex flex-col space-y-3">
            <button 
              onClick={() => {/* Add item modal */}} 
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-white font-medium transition-all transform hover:-translate-y-1 flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>アイテム追加</span>
            </button>
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-white font-medium transition-all">
              <Download className="w-5 h-5 mr-2 inline" />
              エクスポート
            </button>
          </div>
        </div>
        
        {/* フィルターと検索 */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              type="text" 
              placeholder="アイテム検索..." 
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none transition-colors"
            />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-orange-400 focus:outline-none transition-colors"
            >
              <option value="" className="text-gray-800">すべてのカテゴリ</option>
              {categories.map(cat => (
                <option key={cat} value={cat} className="text-gray-800">{cat}</option>
              ))}
            </select>
            <select className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-orange-400 focus:outline-none transition-colors">
              <option value="" className="text-gray-800">すべての場所</option>
              {locations.map(loc => (
                <option key={loc} value={loc} className="text-gray-800">{loc}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* アイテム追加フォーム */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">新しいアイテムを追加</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input 
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none transition-colors" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="アイテム名" 
              />
              <input 
                type="number" 
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none transition-colors" 
                value={quantity} 
                onChange={(e) => setQuantity(Number(e.target.value))} 
                placeholder="数量"
              />
              <input 
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none transition-colors" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                placeholder="保管場所（任意）" 
              />
            </div>
            <div className="flex justify-end mt-4">
              <button 
                onClick={create} 
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-6 py-3 rounded-xl font-medium text-white transition-all transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>追加</span>
              </button>
            </div>
          </div>

          {/* アイテムリスト */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">アイテム一覧</h3>
            {filteredItems.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <p className="text-xl font-semibold">
                  {selectedCategory ? `「${selectedCategory}」カテゴリにアイテムがありません` : 'アイテムがありません'}
                </p>
                <p className="text-gray-400">最初のアイテムを追加してください</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer group transform hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-lg font-semibold text-white">{item.name}</h4>
                        <p className="text-sm text-gray-400">{item.category || 'その他'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        (item.quantity || 0) < 5 
                          ? 'bg-red-600/30 text-red-300' 
                          : 'bg-orange-600/30 text-orange-300'
                      }`}>
                        {item.quantity || 0} 個
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">保管場所:</span>
                        <span className="text-white">{item.location || '未設定'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">状態:</span>
                        <span className="text-green-400">{item.status || '利用可能'}</span>
                      </div>
                      {item.unitPrice && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">単価:</span>
                          <span className="text-white">¥{item.unitPrice.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const inventoryPlugin: ChannelPlugin = {
  meta: { type: ChannelType.INVENTORY, name: '物品管理', description: '備品の在庫管理', icon: <span>📦</span>, color: '#84cc16' },
  ContentComponent: InventoryContent,
};
