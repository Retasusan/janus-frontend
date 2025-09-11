"use client";

import React, { useEffect, useState } from 'react';
import { ChannelPlugin } from '@/types/plugin';
import { ChannelType, BaseChannel } from '@/types/channel';
import { BookOpen, Plus, Calendar, Edit3, Heart, Smile, Frown, Meh, Coffee, Star } from 'lucide-react';

function DiaryContent({ channel }: { channel: BaseChannel }) {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [entryDate, setEntryDate] = useState('');
  const [mood, setMood] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await globalThis.fetch(`/api/servers/${channel.serverId}/channels/${channel.id}/diary_entries`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setEntries(Array.isArray(data) ? data : []);
        } else setEntries([]);
      } catch (e) { setEntries([]); } finally { setLoading(false); }
    };
    load();
  }, [channel]);

  const create = async () => {
    if (!title.trim()) return;
    const res = await globalThis.fetch(`/api/servers/${channel.serverId}/channels/${channel.id}/diary_entries`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ diary_entry: { title: title.trim(), content, entry_date: entryDate, mood, tags } }),
    });
    if (res.ok) {
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
      setTitle(''); setContent(''); setEntryDate(''); setMood(''); setTags('');
    }
  };

  const moodEmojis = {
    'happy': { icon: '😊', color: 'text-yellow-400', label: '嬉しい' },
    'sad': { icon: '😢', color: 'text-blue-400', label: '悲しい' },
    'excited': { icon: '🤩', color: 'text-pink-400', label: 'ワクワク' },
    'tired': { icon: '😴', color: 'text-gray-400', label: '疲れた' },
    'calm': { icon: '😌', color: 'text-green-400', label: '穏やか' },
    'angry': { icon: '😤', color: 'text-red-400', label: '怒り' },
  };

  if (loading) return (
    <div className="h-full bg-gradient-to-br from-green-900/20 to-teal-900/20 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-400"></div>
        <p className="text-teal-400 font-medium">日記を読み込み中...</p>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-gradient-to-br from-green-900/20 to-teal-900/20">
      {/* ヘッダー */}
      <div className="border-b border-white/10 p-6 bg-white/5 backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              <BookOpen className="w-8 h-8 mr-3 text-teal-400" />
              共有日記
            </h1>
            <p className="text-gray-300">思い出と体験を共有 • {entries.length} エントリ</p>
          </div>
          <button 
            onClick={() => {/* Toggle create form */}}
            className="bg-gradient-to-r from-teal-500 to-green-600 hover:from-teal-600 hover:to-green-700 px-6 py-3 rounded-xl font-medium text-white transition-all transform hover:-translate-y-1 hover:shadow-lg flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>日記を書く</span>
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 新規エントリ作成フォーム */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Edit3 className="w-5 h-5 mr-2 text-teal-400" />
              新しい日記エントリ
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-teal-400 focus:outline-none transition-colors" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="タイトル" 
                />
                <input 
                  type="date" 
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-teal-400 focus:outline-none transition-colors" 
                  value={entryDate} 
                  onChange={(e) => setEntryDate(e.target.value)} 
                />
              </div>
              
              {/* 気分選択 */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">今日の気分</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(moodEmojis).map(([key, { icon, color, label }]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setMood(key)}
                      className={`p-3 rounded-xl border transition-all ${
                        mood === key 
                          ? 'border-teal-400 bg-teal-400/20' 
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-2xl">{icon}</span>
                      <p className={`text-xs mt-1 ${color}`}>{label}</p>
                    </button>
                  ))}
                </div>
              </div>
              
              <textarea 
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-teal-400 focus:outline-none transition-colors resize-none" 
                rows={6}
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                placeholder="今日の出来事や感想を書いてください..." 
              />
              
              <input 
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-teal-400 focus:outline-none transition-colors" 
                value={tags} 
                onChange={(e) => setTags(e.target.value)} 
                placeholder="タグ (カンマ区切り)" 
              />
            </div>
            <div className="flex justify-end mt-6">
              <button 
                onClick={create} 
                className="bg-gradient-to-r from-teal-500 to-green-600 hover:from-teal-600 hover:to-green-700 px-6 py-3 rounded-xl font-medium text-white transition-all transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>投稿</span>
              </button>
            </div>
          </div>

          {/* 日記エントリリスト */}
          {entries.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <p className="text-xl font-semibold">日記がありません</p>
              <p className="text-gray-400">最初の日記エントリを作成してください</p>
            </div>
          ) : (
            <div className="space-y-6">
              {entries.slice().reverse().map((entry) => (
                <div 
                  key={entry.id} 
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">{entry.title}</h3>
                      <div className="flex items-center space-x-3 text-sm text-gray-400">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {entry.entry_date}
                        </span>
                        {entry.mood && moodEmojis[entry.mood as keyof typeof moodEmojis] && (
                          <span className="flex items-center space-x-1">
                            <span>{moodEmojis[entry.mood as keyof typeof moodEmojis].icon}</span>
                            <span className={moodEmojis[entry.mood as keyof typeof moodEmojis].color}>
                              {moodEmojis[entry.mood as keyof typeof moodEmojis].label}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                    <Heart className="w-5 h-5 text-gray-400 hover:text-red-400 cursor-pointer transition-colors" />
                  </div>
                  
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                      {entry.content}
                    </p>
                  </div>
                  
                  {entry.tags && (
                    <div className="flex flex-wrap space-x-2 mt-4">
                      {entry.tags.split(',').map((tag: string, index: number) => (
                        <span 
                          key={index}
                          className="bg-teal-600/30 px-2 py-1 rounded-lg text-xs text-teal-300"
                        >
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const diaryPlugin: ChannelPlugin = {
  meta: { type: ChannelType.DIARY, name: '日記', description: '日記エントリ', icon: <span>📔</span>, color: '#fb7185' },
  ContentComponent: DiaryContent,
};
