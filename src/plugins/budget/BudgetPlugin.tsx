"use client";

import React, { useEffect, useState } from 'react';
import { ChannelPlugin } from '@/types/plugin';
import { ChannelType, BaseChannel } from '@/types/channel';
import { Wallet, TrendingUp, TrendingDown, Plus, DollarSign, Calendar } from 'lucide-react';

function BudgetContent({ channel }: { channel: BaseChannel }) {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await globalThis.fetch(`/api/servers/${channel.serverId}/channels/${channel.id}/budget_entries`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setEntries(Array.isArray(data) ? data : []);
        } else setEntries([]);
      } catch (e) {
        setEntries([]);
      } finally { setLoading(false); }
    };
    load();
  }, [channel]);

  const create = async () => {
    const res = await globalThis.fetch(`/api/servers/${channel.serverId}/channels/${channel.id}/budget_entries`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ budget_entry: { kind, title, amount: Number(amount), occurred_on: date } }),
    });
    if (res.ok) {
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
      setTitle(''); setAmount(0); setDate('');
    }
  };

  const totalIncome = entries.filter(e => e.kind === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = entries.filter(e => e.kind === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpense;

  if (loading) return (
    <div className="h-full bg-gradient-to-br from-emerald-900/30 to-green-700/20 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-400"></div>
        <p className="text-emerald-400 font-medium">予算データを読み込み中...</p>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-gradient-to-br from-emerald-900/30 to-green-700/20">
      {/* ダッシュボードカード */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* 残高カード */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">残高</p>
                <p className="text-3xl font-bold">¥{balance.toLocaleString()}</p>
              </div>
              <Wallet className="w-12 h-12 text-green-200" />
            </div>
          </div>

          {/* 収入カード */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">収入</p>
                <p className="text-2xl font-bold">¥{totalIncome.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-200" />
            </div>
          </div>

          {/* 支出カード */}
          <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl p-6 text-white shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">支出</p>
                <p className="text-2xl font-bold">¥{totalExpense.toLocaleString()}</p>
              </div>
              <TrendingDown className="w-10 h-10 text-red-200" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* エントリー追加フォーム */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">新しい記録を追加</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-emerald-400 focus:outline-none transition-colors"
              >
                <option value="expense" className="text-gray-800">💸 支出</option>
                <option value="income" className="text-gray-800">💰 収入</option>
              </select>
              <input
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-emerald-400 focus:outline-none transition-colors"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="タイトル"
              />
              <input
                type="number"
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-emerald-400 focus:outline-none transition-colors"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="金額"
              />
              <input
                type="date"
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-emerald-400 focus:outline-none transition-colors"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={create}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 px-6 py-3 rounded-xl font-medium text-white transition-all transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>追加</span>
              </button>
            </div>
          </div>

          {/* エントリーリスト */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">記録履歴</h3>
            {entries.length === 0 ? (
              <div className="text-center text-gray-400 py-6">
                <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <p className="text-xl font-semibold">記録がありません</p>
                <p className="text-gray-400">最初の収支記録を追加してください</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {entries.slice().reverse().map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${entry.kind === 'income' ? 'bg-blue-600/20 text-blue-400' : 'bg-red-600/20 text-red-400'}`}>
                          {entry.kind === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{entry.title}</p>
                          <p className="text-sm text-gray-400 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {entry.occurred_on}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${entry.kind === 'income' ? 'text-blue-400' : 'text-red-400'}`}>
                          {entry.kind === 'income' ? '+' : '-'}¥{Math.abs(entry.amount).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{entry.kind === 'income' ? '収入' : '支出'}</p>
                      </div>
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

export const budgetPlugin: ChannelPlugin = {
  meta: { type: ChannelType.BUDGET, name: '予算管理', description: '支出と収入の記録', icon: <span>💴</span>, color: '#f97316' },
  ContentComponent: BudgetContent,
};
