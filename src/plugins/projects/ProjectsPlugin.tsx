"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Folder, Target, BarChart3, Plus, Calendar, User, CheckSquare, Clock, Archive, Trash2 } from "lucide-react";
import { ChannelPlugin, ChannelContentProps, ChannelCreateFormProps } from "@/types/plugin";
import { BaseChannel, ChannelType } from "@/types/channel";
import { useRealTimePolling } from "@/hooks/useRealTimePolling";

interface Project {
  id: number;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed';
  priority: 'low' | 'medium' | 'high';
  startDate?: string;
  dueDate?: string;
  progress: number;
  tasks?: Task[];
  members?: string[];
  created_at?: string;
  updated_at?: string;
}

interface Task {
  id: number;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  assignee?: string;
  due_date?: string;
}

function ProjectsContent({ channel }: { channel: BaseChannel }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    priority: 'medium' as Project['priority'],
    startDate: '',
    dueDate: '',
    members: '',
  });
  const [filter, setFilter] = useState<'all' | 'planning' | 'active' | 'on_hold' | 'completed'>('all');

  const loadProjects = useCallback(async () => {
    try {
      const res = await fetch(`/api/servers/${channel.serverId}/channels/${channel.id}/projects`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      } else {
        setProjects([]);
      }
    } catch (e) {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [channel.serverId, channel.id]);

  useEffect(() => {
    setLoading(true);
    loadProjects();
  }, [loadProjects]);

  // リアルタイム更新（12秒間隔）
  useRealTimePolling(loadProjects, 12000);

  const createProject = async () => {
    if (!newProject.name.trim()) return;

    try {
      const res = await fetch(`/api/servers/${channel.serverId}/channels/${channel.id}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          project: {
            name: newProject.name.trim(),
            description: newProject.description.trim() || undefined,
            priority: newProject.priority,
            start_date: newProject.startDate || undefined,
            due_date: newProject.dueDate || undefined,
            members: newProject.members.split(',').map(m => m.trim()).filter(Boolean),
            status: 'planning',
            progress: 0,
          },
        }),
      });

      if (res.ok) {
        setNewProject({
          name: '',
          description: '',
          priority: 'medium',
          startDate: '',
          dueDate: '',
          members: '',
        });
        setShowCreateForm(false);
        loadProjects();
      }
    } catch (e) {
      console.error('プロジェクト作成エラー:', e);
    }
  };

  const updateProjectStatus = async (projectId: number, status: Project['status']) => {
    try {
      const res = await fetch(`/api/servers/${channel.serverId}/channels/${channel.id}/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ project: { status } }),
      });

      if (res.ok) {
        loadProjects();
      }
    } catch (e) {
      console.error('プロジェクト更新エラー:', e);
    }
  };

  const deleteProject = async (projectId: number) => {
    if (!confirm('このプロジェクトを削除しますか？')) return;

    try {
      const res = await fetch(`/api/servers/${channel.serverId}/channels/${channel.id}/projects/${projectId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        loadProjects();
        if (selectedProject?.id === projectId) {
          setSelectedProject(null);
        }
      }
    } catch (e) {
      console.error('プロジェクト削除エラー:', e);
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'planning': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'active': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'on_hold': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'completed': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
    }
  };

  const getStatusLabel = (status: Project['status']) => {
    switch (status) {
      case 'planning': return '企画中';
      case 'active': return '進行中';
      case 'on_hold': return '保留';
      case 'completed': return '完了';
    }
  };

  const filteredProjects = projects.filter(project => filter === 'all' || project.status === filter);

  if (loading) return (
    <div className="h-full bg-gradient-to-br from-indigo-900/20 to-purple-900/20 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-400"></div>
        <p className="text-indigo-400 font-medium">プロジェクトを読み込み中...</p>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-gradient-to-br from-indigo-900/20 to-purple-900/20">
      {/* ヘッダー */}
      <div className="border-b border-white/10 p-6 bg-white/5 backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              <Folder className="w-8 h-8 mr-3 text-indigo-400" />
              プロジェクト管理
            </h1>
            <p className="text-gray-300">チームのプロジェクトを管理 • {projects.length} 件のプロジェクト</p>
          </div>
          <button 
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-6 py-3 rounded-xl font-medium text-white transition-all transform hover:-translate-y-1 hover:shadow-lg flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>新しいプロジェクト</span>
          </button>
        </div>

        {/* フィルター */}
        <div className="flex space-x-2 mt-4">
          {[
            { key: 'all', label: 'すべて', count: projects.length },
            { key: 'planning', label: '企画中', count: projects.filter(p => p.status === 'planning').length },
            { key: 'active', label: '進行中', count: projects.filter(p => p.status === 'active').length },
            { key: 'on_hold', label: '保留', count: projects.filter(p => p.status === 'on_hold').length },
            { key: 'completed', label: '完了', count: projects.filter(p => p.status === 'completed').length },
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
        <div className="max-w-7xl mx-auto space-y-6">
          {/* プロジェクト作成フォーム */}
          {showCreateForm && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Plus className="w-5 h-5 mr-2 text-indigo-400" />
                新しいプロジェクトを作成
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    placeholder="プロジェクト名"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-indigo-400 focus:outline-none transition-colors"
                  />
                </div>
                <div className="md:col-span-2">
                  <textarea
                    placeholder="詳細説明（任意）"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    rows={3}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-indigo-400 focus:outline-none transition-colors resize-none"
                  />
                </div>
                <div>
                  <select
                    value={newProject.priority}
                    onChange={(e) => setNewProject({ ...newProject, priority: e.target.value as Project['priority'] })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-indigo-400 focus:outline-none transition-colors"
                  >
                    <option value="low" className="bg-gray-800">低優先度</option>
                    <option value="medium" className="bg-gray-800">中優先度</option>
                    <option value="high" className="bg-gray-800">高優先度</option>
                  </select>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="メンバー（カンマ区切り）"
                    value={newProject.members}
                    onChange={(e) => setNewProject({ ...newProject, members: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-indigo-400 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="date"
                    placeholder="開始日"
                    value={newProject.startDate}
                    onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-indigo-400 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="date"
                    placeholder="終了予定日"
                    value={newProject.dueDate}
                    onChange={(e) => setNewProject({ ...newProject, dueDate: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-indigo-400 focus:outline-none transition-colors"
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
                  onClick={createProject}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all transform hover:-translate-y-1 hover:shadow-lg flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>作成</span>
                </button>
              </div>
            </div>
          )}

          {/* プロジェクトリスト */}
          {filteredProjects.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <Folder className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <p className="text-xl font-semibold">プロジェクトがありません</p>
              <p className="text-gray-400">新しいプロジェクトを作成してください</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all group cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                >
                  {/* プロジェクトヘッダー */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{project.name}</h3>
                      {project.description && (
                        <p className="text-gray-300 text-sm mb-3 line-clamp-2">{project.description}</p>
                      )}
                    </div>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProject(project.id);
                        }}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* プログレス */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-300">進捗</span>
                      <span className="text-sm text-white font-medium">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${project.progress}%` }} 
                      />
                    </div>
                  </div>

                  {/* メタデータ */}
                  <div className="space-y-3 mb-4">
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(project.priority)}`}>
                        {project.priority === 'high' ? '高優先度' : project.priority === 'medium' ? '中優先度' : '低優先度'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                        {getStatusLabel(project.status)}
                      </span>
                    </div>

                    {project.members && project.members.length > 0 && (
                      <div className="flex items-center text-gray-300 text-sm">
                        <User className="w-4 h-4 mr-2" />
                        {project.members.slice(0, 3).join(', ')}
                        {project.members.length > 3 && ` +${project.members.length - 3}`}
                      </div>
                    )}

                    {project.dueDate && (
                      <div className="flex items-center text-gray-300 text-sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(project.dueDate).toLocaleDateString('ja-JP')}
                      </div>
                    )}
                  </div>

                  {/* アクションボタン */}
                  <div className="flex space-x-2">
                    {project.status !== 'completed' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const nextStatus = project.status === 'planning' ? 'active' : 
                                           project.status === 'active' ? 'completed' : 'active';
                          updateProjectStatus(project.id, nextStatus);
                        }}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all text-sm"
                      >
                        {project.status === 'planning' ? '開始' : '完了'}
                      </button>
                    )}
                    {project.status === 'active' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateProjectStatus(project.id, 'on_hold');
                        }}
                        className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-all text-sm"
                      >
                        保留
                      </button>
                    )}
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

const ProjectsPlugin: ChannelPlugin = {
  meta: {
    name: 'プロジェクト管理',
    description: 'チームのプロジェクトを管理',
    type: ChannelType.PROJECT,
    icon: <Folder className="w-4 h-4" />,
    color: '#6366f1',
  },
  ContentComponent: ProjectsContent,
};

export default ProjectsPlugin;
