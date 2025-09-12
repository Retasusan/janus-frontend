"use client";

import React, { useState, useEffect, useCallback } from "react";
import { BookOpen, Edit3, Save, Search, Tag, FileText, Plus, X, Trash2, User, Calendar } from "lucide-react";
import { ChannelPlugin, ChannelContentProps, ChannelCreateFormProps } from "@/types/plugin";
import { BaseChannel, ChannelType } from "@/types/channel";
import { useRealTimePolling } from "@/hooks/useRealTimePolling";

interface WikiPage {
  id: number;
  title: string;
  content: string;
  author?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

function WikiContent({ channel }: { channel: BaseChannel }) {
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<WikiPage | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editContent, setEditContent] = useState({
    title: "",
    content: "",
    tags: "",
  });

  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch(`/api/servers/${channel.serverId}/channels/${channel.id}/wiki_pages`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        const pagesData = Array.isArray(data) ? data : [];
        setPages(pagesData);
        if (!selectedPage && pagesData.length > 0) {
          setSelectedPage(pagesData[0]);
        }
      } else {
        setPages([]);
      }
    } catch (e) {
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, [channel.serverId, channel.id, selectedPage]);

  useEffect(() => {
    setLoading(true);
    fetchPages();
  }, [fetchPages]);

  // リアルタイム更新（15秒間隔）
  useRealTimePolling(fetchPages, 15000);

  const handleCreate = async () => {
    if (!editContent.title.trim()) return;
    
    try {
      const res = await fetch(`/api/servers/${channel.serverId}/channels/${channel.id}/wiki_pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ 
          wiki_page: { 
            title: editContent.title.trim(), 
            content: editContent.content,
            tags: editContent.tags.split(',').map(t => t.trim()).filter(Boolean),
          } 
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        const pagesData = Array.isArray(data) ? data : [];
        setPages(pagesData);
        setEditContent({ title: "", content: "", tags: "" });
        setIsCreating(false);
        // 新しく作成されたページを選択
        const newPage = pagesData.find(p => p.title === editContent.title.trim());
        if (newPage) setSelectedPage(newPage);
      }
    } catch (e) {
      console.error('ページ作成エラー:', e);
    }
  };

  const handleEdit = () => {
    if (!selectedPage) return;
    setEditContent({
      title: selectedPage.title,
      content: selectedPage.content,
      tags: (selectedPage.tags || []).join(', '),
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!selectedPage || !editContent.title.trim()) return;
    
    try {
      const res = await fetch(`/api/servers/${channel.serverId}/channels/${channel.id}/wiki_pages/${selectedPage.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ 
          wiki_page: { 
            title: editContent.title.trim(), 
            content: editContent.content,
            tags: editContent.tags.split(',').map(t => t.trim()).filter(Boolean),
          } 
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        const pagesData = Array.isArray(data) ? data : [];
        setPages(pagesData);
        const updatedPage = pagesData.find(p => p.id === selectedPage.id);
        if (updatedPage) setSelectedPage(updatedPage);
        setIsEditing(false);
      }
    } catch (e) {
      console.error('ページ更新エラー:', e);
    }
  };

  const handleDelete = async (pageId: number) => {
    if (!confirm('このページを削除しますか？')) return;
    
    try {
      const res = await fetch(`/api/servers/${channel.serverId}/channels/${channel.id}/wiki_pages/${pageId}`, {
        method: "DELETE",
        credentials: 'include',
      });
      
      if (res.ok) {
        const data = await res.json();
        const pagesData = Array.isArray(data) ? data : [];
        setPages(pagesData);
        if (selectedPage?.id === pageId) {
          setSelectedPage(pagesData.length > 0 ? pagesData[0] : null);
        }
      }
    } catch (e) {
      console.error('ページ削除エラー:', e);
    }
  };

  const renderMarkdown = (content: string) => {
    // 簡単なMarkdown変換（実際のプロジェクトではmarkedなどのライブラリを使用推奨）
    return content
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-white mb-4">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold text-white mb-3">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium text-white mb-2">$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-bold text-white">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em class="italic text-gray-300">$1</em>')
      .replace(/`([^`]+)`/gim, '<code class="bg-gray-700 text-green-400 px-2 py-1 rounded text-sm">$1</code>')
      .replace(/^\- (.*$)/gim, '<li class="text-gray-300 ml-4">• $1</li>')
      .replace(/\n/g, '<br>');
  };

  const filteredPages = pages.filter(page => 
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="h-full bg-gradient-to-br from-amber-900/20 to-orange-900/20 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400"></div>
        <p className="text-amber-400 font-medium">Wikiを読み込み中...</p>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-gradient-to-br from-amber-900/20 to-orange-900/20 flex">
      {/* サイドバー */}
      <div className="w-80 bg-white/5 backdrop-blur-sm border-r border-white/10 flex flex-col">
        {/* ヘッダー */}
        <div className="p-6 border-b border-white/10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <BookOpen className="w-6 h-6 mr-2 text-amber-400" />
              Wiki
            </h2>
            <button 
              onClick={() => setIsCreating(true)}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 p-2 rounded-lg transition-all"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
          
          {/* 検索 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ページを検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-amber-400 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* ページリスト */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredPages.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-sm">ページがありません</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPages.map((page) => (
                <div
                  key={page.id}
                  onClick={() => setSelectedPage(page)}
                  className={`p-3 rounded-lg cursor-pointer transition-all group ${
                    selectedPage?.id === page.id
                      ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-white text-sm mb-1 line-clamp-2">{page.title}</h3>
                      <p className="text-xs text-gray-400 line-clamp-2">{page.content.substring(0, 60)}...</p>
                      {page.tags && page.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {page.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="bg-amber-600/20 text-amber-300 px-2 py-0.5 rounded text-xs">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(page.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-1 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col">
        {isCreating ? (
          // 新規作成フォーム
          <div className="h-full p-6">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Plus className="w-6 h-6 mr-2 text-amber-400" />
                  新しいページを作成
                </h2>
                <div className="flex space-x-3">
                  <button
                    onClick={handleCreate}
                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 px-4 py-2 rounded-lg text-white font-medium transition-all flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>作成</span>
                  </button>
                  <button
                    onClick={() => setIsCreating(false)}
                    className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-white transition-all flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>キャンセル</span>
                  </button>
                </div>
              </div>
              
              <div className="space-y-4 flex-1 flex flex-col">
                <input
                  type="text"
                  placeholder="ページタイトル"
                  value={editContent.title}
                  onChange={(e) => setEditContent({ ...editContent, title: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-amber-400 focus:outline-none transition-colors text-lg font-semibold"
                />
                
                <input
                  type="text"
                  placeholder="タグ（カンマ区切り）"
                  value={editContent.tags}
                  onChange={(e) => setEditContent({ ...editContent, tags: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-amber-400 focus:outline-none transition-colors"
                />
                
                <textarea
                  placeholder="内容をMarkdownで記述してください..."
                  value={editContent.content}
                  onChange={(e) => setEditContent({ ...editContent, content: e.target.value })}
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-amber-400 focus:outline-none transition-colors resize-none font-mono"
                />
              </div>
            </div>
          </div>
        ) : selectedPage ? (
          // ページ表示/編集
          <div className="h-full flex flex-col">
            {/* ページヘッダー */}
            <div className="border-b border-white/10 p-6 bg-white/5 backdrop-blur-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editContent.title}
                      onChange={(e) => setEditContent({ ...editContent, title: e.target.value })}
                      className="text-3xl font-bold text-white bg-transparent border-b border-white/20 focus:border-amber-400 focus:outline-none transition-colors w-full mb-2"
                    />
                  ) : (
                    <h1 className="text-3xl font-bold text-white mb-2">{selectedPage.title}</h1>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    {selectedPage.author && (
                      <>
                        <span className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {selectedPage.author}
                        </span>
                        <span>•</span>
                      </>
                    )}
                    {selectedPage.created_at && (
                      <>
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(selectedPage.created_at).toLocaleDateString('ja-JP')}
                        </span>
                      </>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <input
                      type="text"
                      placeholder="タグ（カンマ区切り）"
                      value={editContent.tags}
                      onChange={(e) => setEditContent({ ...editContent, tags: e.target.value })}
                      className="mt-3 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-amber-400 focus:outline-none transition-colors"
                    />
                  ) : selectedPage.tags && selectedPage.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedPage.tags.map(tag => (
                        <span key={tag} className="bg-amber-600/20 text-amber-300 px-3 py-1 rounded-full text-sm flex items-center">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-4 py-2 rounded-lg text-white font-medium transition-all flex items-center space-x-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>保存</span>
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-white transition-all flex items-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>キャンセル</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleEdit}
                      className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 px-4 py-2 rounded-lg text-white font-medium transition-all flex items-center space-x-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>編集</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* ページ内容 */}
            <div className="flex-1 p-6 overflow-y-auto">
              {isEditing ? (
                <textarea
                  value={editContent.content}
                  onChange={(e) => setEditContent({ ...editContent, content: e.target.value })}
                  className="w-full h-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-amber-400 focus:outline-none transition-colors resize-none font-mono"
                  placeholder="内容をMarkdownで記述してください..."
                />
              ) : (
                <div className="prose prose-invert max-w-none">
                  <div 
                    className="text-gray-200 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedPage.content) }}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          // ページが選択されていない場合
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-6">
              <BookOpen className="w-20 h-20 mx-auto text-gray-500" />
              <div>
                <p className="text-2xl font-semibold text-white mb-2">Wikiページがありません</p>
                <p className="text-gray-400 text-lg">最初のナレッジベースページを作成してください</p>
              </div>
              <button 
                onClick={() => setIsCreating(true)}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 px-6 py-3 rounded-xl font-medium text-white transition-all transform hover:-translate-y-1 hover:shadow-lg flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>最初のページを作成</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const wikiPlugin: ChannelPlugin = {
  meta: {
    type: ChannelType.WIKI,
    name: 'Wiki',
    description: 'ナレッジベース・ドキュメント',
    icon: <BookOpen className="w-4 h-4" />,
    color: '#f59e0b',
  },
  ContentComponent: WikiContent,
};
