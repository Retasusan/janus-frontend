"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ChannelPlugin, ChannelContentProps, ChannelCreateFormProps } from "@/types/plugin";
import { BaseChannel, ChannelType } from "@/types/channel";
import { useRealTimePolling } from "@/hooks/useRealTimePolling";

interface ForumThread { id: number; title: string; created_by: string; created_at: string; }
interface ForumPost { id: number; content: string; created_by: string; created_at: string; }

function CreateThreadForm({ onSubmit, onCancel }: ChannelCreateFormProps) {
  const [title, setTitle] = useState("");
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 space-y-4">
      <h3 className="text-lg font-semibold text-white">新しいスレッドを作成</h3>
      <input 
        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-slate-400 focus:outline-none transition-colors" 
        placeholder="スレッドタイトル" 
        value={title} 
        onChange={e=>setTitle(e.target.value)} 
      />
      <div className="flex gap-2">
        <button 
          className="bg-gradient-to-r from-slate-500 to-gray-600 hover:from-slate-600 hover:to-gray-700 disabled:from-gray-600 disabled:to-gray-700 px-4 py-2 rounded-lg text-white font-medium transition-all transform hover:-translate-y-1 disabled:transform-none" 
          onClick={()=> onSubmit({ title })} 
          disabled={!title.trim()}
        >
          作成
        </button>
        <button 
          className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-lg text-gray-300 font-medium transition-all" 
          onClick={onCancel}
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}

function ForumContent({ channel }: ChannelContentProps) {
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [selected, setSelected] = useState<ForumThread | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const base = `/api/servers/${channel.serverId}/channels/${channel.id}`;

  // スレッド一覧の取得関数
  const fetchThreads = useCallback(async () => {
    try {
      const r = await fetch(`${base}/forum_threads`, { credentials: 'include' });
      if (!r.ok) {
        const body = await r.json().catch(()=>({}));
        console.warn('Forum threads fetch error', r.status, body);
        return;
      }
      const data = await r.json();
      setThreads(Array.isArray(data) ? data : []);
    } catch (error) {
      console.warn('Forum threads fetch error', error);
    }
  }, [base]);

  // 投稿一覧の取得関数
  const fetchPosts = useCallback(async () => {
    if (!selected) return;
    try {
      const r = await fetch(`${base}/forum_threads/${selected.id}/forum_posts`, { credentials: 'include' });
      if (!r.ok) {
        const body = await r.json().catch(()=>({}));
        console.warn('Forum posts fetch error', r.status, body);
        return;
      }
      const data = await r.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.warn('Forum posts fetch error', error);
    }
  }, [base, selected?.id]);

  // 初期データ読み込み
  useEffect(() => {
    setLoading(true);
    fetchThreads().finally(() => setLoading(false));
  }, [channel.id, fetchThreads]);

  useEffect(() => {
    if (selected) {
      fetchPosts();
    }
  }, [selected?.id, fetchPosts]);

  // リアルタイム更新
  useRealTimePolling(fetchThreads, 10000); // 10秒間隔でスレッド更新
  useRealTimePolling(fetchPosts, 5000, !!selected); // 5秒間隔で投稿更新（スレッド選択時のみ）

  const createThread = async (data: any)=>{
    const res = await fetch(`${base}/forum_threads`, { method:"POST", headers:{"Content-Type":"application/json"}, credentials: 'include', body: JSON.stringify(data)});
    if (!res.ok) {
      const body = await res.json().catch(()=>({}));
      alert(`スレッド作成に失敗しました: ${res.status} ${JSON.stringify(body)}`);
      return;
    }
    const listRes = await fetch(`${base}/forum_threads`, { credentials: 'include' });
    const list = await listRes.json();
    setThreads(Array.isArray(list) ? list : []);
    setShowCreateForm(false);
  };

  const createPost = async ()=>{
    if(!selected || !newPost.trim()) return;
    const res = await fetch(`${base}/forum_threads/${selected.id}/forum_posts`, { method:"POST", headers:{"Content-Type":"application/json"}, credentials: 'include', body: JSON.stringify({ content: newPost })});
    if (!res.ok) {
      const body = await res.json().catch(()=>({}));
      alert(`投稿に失敗しました: ${res.status} ${JSON.stringify(body)}`);
      return;
    }
    const listRes = await fetch(`${base}/forum_threads/${selected.id}/forum_posts`, { credentials: 'include' });
    const list = await listRes.json();
    setPosts(Array.isArray(list) ? list : []);
    setNewPost("");
  };

  if (loading) return (
    <div className="h-full bg-gradient-to-br from-slate-900/20 to-gray-900/20 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-slate-400"></div>
        <p className="text-slate-400 font-medium">フォーラムを読み込み中...</p>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-gradient-to-br from-slate-900/20 to-gray-900/20 flex">
      {/* スレッドリスト */}
      <div className="w-1/3 bg-white/5 backdrop-blur-sm border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">スレッド一覧</h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-gradient-to-r from-slate-500 to-gray-600 hover:from-slate-600 hover:to-gray-700 px-4 py-2 rounded-lg text-white font-medium transition-all flex items-center space-x-2"
            >
              <span>+</span>
              <span>新規スレッド</span>
            </button>
          </div>
          
          {showCreateForm && (
            <CreateThreadForm 
              onSubmit={createThread} 
              onCancel={() => setShowCreateForm(false)} 
            />
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {threads.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p className="text-lg font-semibold">スレッドがありません</p>
              <p className="text-sm">新しいスレッドを作成してください</p>
            </div>
          ) : (
            threads.map(t=> (
              <button 
                key={t.id} 
                className={`block w-full text-left p-4 rounded-xl transition-all ${
                  selected?.id === t.id 
                    ? 'bg-gradient-to-r from-slate-500/20 to-gray-500/20 border border-slate-400/30' 
                    : 'bg-white/5 hover:bg-white/10 border border-transparent'
                }`} 
                onClick={() => setSelected(t)}
              >
                <div className="font-semibold text-white mb-1">{t.title}</div>
                <div className="text-xs text-gray-400">
                  by {t.created_by} • {new Date(t.created_at).toLocaleDateString('ja-JP')}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
      
      {/* 投稿表示エリア */}
      <div className="flex-1 flex flex-col">
        {!selected ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-500 to-gray-600 rounded-2xl mx-auto flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <div>
                <p className="text-xl font-semibold text-white mb-2">スレッドを選択してください</p>
                <p className="text-gray-400">左側からスレッドを選んで議論に参加しましょう</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* スレッドヘッダー */}
            <div className="border-b border-white/10 p-6 bg-white/5 backdrop-blur-sm">
              <h1 className="text-2xl font-bold text-white mb-2">{selected.title}</h1>
              <div className="text-sm text-gray-400">
                作成者: {selected.created_by} • {new Date(selected.created_at).toLocaleDateString('ja-JP')} • {posts.length} 件の投稿
              </div>
            </div>
            
            {/* 投稿リスト */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {posts.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <p className="text-lg font-semibold">まだ投稿がありません</p>
                  <p className="text-sm">最初の投稿をしてみましょう</p>
                </div>
              ) : (
                posts.map(p=> (
                  <div key={p.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all">
                    <div className="text-white whitespace-pre-wrap leading-relaxed mb-3">{p.content}</div>
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>投稿者: {p.created_by}</span>
                      <span>{new Date(p.created_at).toLocaleString('ja-JP')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* 新規投稿フォーム */}
            <div className="border-t border-white/10 p-6 bg-white/5 backdrop-blur-sm">
              <div className="flex gap-4">
                <textarea 
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-slate-400 focus:outline-none transition-colors resize-none" 
                  placeholder="投稿内容を入力してください..." 
                  value={newPost} 
                  onChange={e=>setNewPost(e.target.value)}
                  rows={3}
                />
                <button 
                  className="bg-gradient-to-r from-slate-500 to-gray-600 hover:from-slate-600 hover:to-gray-700 disabled:from-gray-600 disabled:to-gray-700 px-6 py-3 rounded-xl text-white font-medium transition-all transform hover:-translate-y-1 hover:shadow-lg disabled:transform-none disabled:shadow-none h-fit" 
                  onClick={createPost} 
                  disabled={!newPost.trim()}
                >
                  投稿
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export const forumPlugin: ChannelPlugin = {
  meta: {
    type: ChannelType.FORUM,
    name: "フォーラム",
    description: "スレッドと投稿で議論",
    icon: "💬",
    color: "#64748b",
  },
  CreateForm: CreateThreadForm as unknown as React.ComponentType<ChannelCreateFormProps>,
  ContentComponent: ForumContent as React.ComponentType<ChannelContentProps>,
};
