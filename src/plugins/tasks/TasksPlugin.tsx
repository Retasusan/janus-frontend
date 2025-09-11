"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CheckSquare, Plus, Calendar, User, Clock, Filter, Trash2 } from "lucide-react";
import { ChannelPlugin, ChannelContentProps, ChannelCreateFormProps } from "@/types/plugin";
import { BaseChannel, ChannelType } from "@/types/channel";
import { useRealTimePolling } from "@/hooks/useRealTimePolling";

interface Task {
  id: number;
  title: string;
  description?: string;
  status: number; // 0: todo, 1: done
  priority?: string;
  assignee?: string;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
}

export function TasksContent({ channel }: { channel: BaseChannel }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignee: '',
    due_date: '',
  });
  const [filter, setFilter] = useState<'all' | 'todo' | 'done'>('all');

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch(`/api/servers/${channel.serverId}/channels/${channel.id}/tasks`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [channel.id, channel.serverId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // リアルタイム更新（10秒間隔）
  useRealTimePolling(fetchTasks, 10000);

  const createTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      const res = await globalThis.fetch(`/api/servers/${channel.serverId}/channels/${channel.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          task: {
            title: newTask.title.trim(),
            description: newTask.description.trim() || undefined,
            priority: newTask.priority,
            assignee: newTask.assignee.trim() || undefined,
            due_date: newTask.due_date || undefined,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : []);
        setNewTask({
          title: '',
          description: '',
          priority: 'medium',
          assignee: '',
          due_date: '',
        });
        setShowCreateForm(false);
      }
    } catch (e) {
      console.error('タスク作成エラー:', e);
    }
  };

  const toggleStatus = async (id: number) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const newStatus = task.status === 1 ? 0 : 1;
    
    try {
      const res = await globalThis.fetch(`/api/servers/${channel.serverId}/channels/${channel.id}/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ task: { status: newStatus } }),
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('タスク更新エラー:', e);
    }
  };

  const deleteTask = async (id: number) => {
    if (!confirm('このタスクを削除しますか？')) return;

    try {
      const res = await globalThis.fetch(`/api/servers/${channel.serverId}/channels/${channel.id}/tasks/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('タスク削除エラー:', e);
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'todo') return task.status === 0;
    if (filter === 'done') return task.status === 1;
    return true;
  });

  if (loading) return (
    <div className="h-full bg-gradient-to-br from-blue-900/20 to-purple-900/20 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400"></div>
        <p className="text-blue-400 font-medium">タスクを読み込み中...</p>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-gradient-to-br from-blue-900/20 to-purple-900/20">
      {/* ヘッダー */}
      <div className="border-b border-white/10 p-6 bg-white/5 backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              <CheckSquare className="w-8 h-8 mr-3 text-blue-400" />
              タスク管理
            </h1>
            <p className="text-gray-300">チームのタスクを管理 • {tasks.length} 件のタスク</p>
          </div>
          <button 
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-6 py-3 rounded-xl font-medium text-white transition-all transform hover:-translate-y-1 hover:shadow-lg flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>新しいタスク</span>
          </button>
        </div>

        {/* フィルター */}
        <div className="flex space-x-2 mt-4">
          {[
            { key: 'all', label: 'すべて', count: tasks.length },
            { key: 'todo', label: '未完了', count: tasks.filter(t => t.status === 0).length },
            { key: 'done', label: '完了', count: tasks.filter(t => t.status === 1).length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === key
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* タスク作成フォーム */}
          {showCreateForm && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Plus className="w-5 h-5 mr-2 text-blue-400" />
                新しいタスクを作成
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    placeholder="タスクのタイトル"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-colors"
                  />
                </div>
                <div className="md:col-span-2">
                  <textarea
                    placeholder="詳細説明（任意）"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    rows={3}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-colors resize-none"
                  />
                </div>
                <div>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-blue-400 focus:outline-none transition-colors"
                  >
                    <option value="low" className="bg-gray-800 text-white">低優先度</option>
                    <option value="medium" className="bg-gray-800 text-white">中優先度</option>
                    <option value="high" className="bg-gray-800 text-white">高優先度</option>
                  </select>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="担当者（任意）"
                    value={newTask.assignee}
                    onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-colors"
                  />
                </div>
                <div className="md:col-span-2">
                  <input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-blue-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-3 text-gray-300 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 hover:text-white transition-all"
                >
                  キャンセル
                </button>
                <button
                  onClick={createTask}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all transform hover:-translate-y-1 hover:shadow-lg flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>作成</span>
                </button>
              </div>
            </div>
          )}

          {/* タスクリスト */}
          {filteredTasks.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <CheckSquare className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <p className="text-xl font-semibold">タスクがありません</p>
              <p className="text-gray-400">新しいタスクを作成してください</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all group"
                >
                  {/* タスクヘッダー */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold mb-2 ${task.status === 1 ? 'text-gray-400 line-through' : 'text-white'}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-gray-300 text-sm mb-3">{task.description}</p>
                      )}
                    </div>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* メタデータ */}
                  <div className="space-y-3 mb-4">
                    <div className="flex flex-wrap gap-2">
                      {task.priority && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                          {task.priority === 'high' ? '高優先度' : task.priority === 'medium' ? '中優先度' : '低優先度'}
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        task.status === 1 ? 'text-green-400 bg-green-500/20 border-green-500/30' : 'text-gray-400 bg-gray-500/20 border-gray-500/30'
                      }`}>
                        {task.status === 1 ? '完了' : '未完了'}
                      </span>
                    </div>

                    {task.assignee && (
                      <div className="flex items-center text-gray-300 text-sm">
                        <User className="w-4 h-4 mr-2" />
                        {task.assignee}
                      </div>
                    )}

                    {task.due_date && (
                      <div className="flex items-center text-gray-300 text-sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(task.due_date).toLocaleDateString('ja-JP')}
                      </div>
                    )}
                  </div>

                  {/* アクションボタン */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleStatus(task.id)}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                        task.status === 1
                          ? 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white'
                          : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                      }`}
                    >
                      {task.status === 1 ? '未完了に戻す' : '完了にする'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const tasksPlugin: ChannelPlugin = {
  meta: { 
    type: ChannelType.PROJECT, 
    name: 'タスク管理', 
    description: 'チームのタスクを管理', 
    icon: <CheckSquare className="w-4 h-4" />, 
    color: '#3b82f6' 
  },
  ContentComponent: TasksContent,
};
