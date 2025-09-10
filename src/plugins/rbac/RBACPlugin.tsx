"use client";

import React, { useState, useEffect } from 'react';
import { FiShield, FiUsers, FiPlus, FiTrash2 } from 'react-icons/fi';
import { ChannelPlugin } from '@/types/plugin';

interface Role {
  id: number;
  name: string;
  color: string;
  description?: string;
  memberCount: number;
  permissionLevel: number;
  defaultRole: boolean;
}

interface Permission {
  id: number;
  targetType: 'role' | 'user';
  targetId: string;
  permissionType: string;
  allowed: boolean;
}

import { BaseChannel, ChannelType } from '@/types/channel';

interface RBACPluginProps {
  channel: BaseChannel;
}

const PERMISSION_TYPES = [
  { key: 'read_messages', label: 'メッセージを読む', description: 'チャンネルのメッセージを閲覧できます' },
  { key: 'send_messages', label: 'メッセージを送信', description: 'チャンネルにメッセージを送信できます' },
  { key: 'manage_messages', label: 'メッセージを管理', description: 'メッセージの削除や編集ができます' },
  { key: 'read_files', label: 'ファイルを閲覧', description: 'アップロードされたファイルを閲覧できます' },
  { key: 'upload_files', label: 'ファイルをアップロード', description: 'ファイルをアップロードできます' },
  { key: 'manage_files', label: 'ファイルを管理', description: 'ファイルの削除や管理ができます' },
  { key: 'manage_channel', label: 'チャンネルを管理', description: 'チャンネル設定や権限を変更できます' },
  { key: 'invite_users', label: 'ユーザーを招待', description: 'チャンネルにユーザーを招待できます' },
];

function RBACContent({ channel }: RBACPluginProps) {
  const { id: channelId, serverId } = channel;
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles');
  const [showCreateRole, setShowCreateRole] = useState(false);

  useEffect(() => {
    loadData();
  }, [channelId, serverId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesRes, permissionsRes] = await Promise.all([
        fetch(`/api/servers/${serverId}/roles`, { credentials: 'include' }),
        fetch(`/api/servers/${serverId}/channels/${channelId}/permissions`, { credentials: 'include' })
      ]);

      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        setRoles(rolesData);
      }

      if (permissionsRes.ok) {
        const permissionsData = await permissionsRes.json();
        setPermissions(permissionsData.permissions || []);
      }
    } catch (error) {
      console.error('データの読み込みに失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRole = async (roleData: { name: string; color: string; description?: string }) => {
    try {
      const res = await fetch(`/api/servers/${serverId}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(roleData)
      });

      if (res.ok) {
        const newRole = await res.json();
        setRoles(prev => [...prev, newRole]);
        setShowCreateRole(false);
      }
    } catch (error) {
      console.error('ロール作成に失敗しました:', error);
    }
  };

  const updatePermission = async (targetType: string, targetId: string, permissionType: string, allowed: boolean) => {
    try {
      const existingPermission = permissions.find(p => 
        p.targetType === targetType && p.targetId === targetId && p.permissionType === permissionType
      );

      if (existingPermission) {
        const res = await fetch(`/api/servers/${serverId}/channels/${channelId}/permissions/${existingPermission.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ allowed })
        });

        if (res.ok) {
          const updatedPermission = await res.json();
          setPermissions(prev => prev.map(p => p.id === updatedPermission.id ? updatedPermission : p));
        }
      } else {
        const res = await fetch(`/api/servers/${serverId}/channels/${channelId}/permissions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ targetType, targetId, permissionType, allowed })
        });

        if (res.ok) {
          const newPermission = await res.json();
          setPermissions(prev => [...prev, newPermission]);
        }
      }
    } catch (error) {
      console.error('権限の更新に失敗しました:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">チャンネル権限管理</h1>
        <p className="text-gray-600">このチャンネルのロールとユーザー権限を管理します</p>
      </div>

      {/* タブナビゲーション */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'roles'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiUsers className="inline mr-2" />
            ロール管理
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'permissions'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiShield className="inline mr-2" />
            権限設定
          </button>
        </nav>
      </div>

      {activeTab === 'roles' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">サーバーロール</h2>
            <button
              onClick={() => setShowCreateRole(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
            >
              <FiPlus className="mr-2" />
              新しいロール
            </button>
          </div>

          <div className="grid gap-4">
            {roles.map((role) => (
              <div key={role.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: role.color }}
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{role.name}</h3>
                      {role.description && (
                        <p className="text-sm text-gray-500">{role.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">{role.memberCount} メンバー</span>
                    {!role.defaultRole && (
                      <button className="text-red-600 hover:text-red-800">
                        <FiTrash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'permissions' && (
        <div>
          <h2 className="text-lg font-semibold mb-4">権限マトリックス</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ロール/ユーザー
                  </th>
                  {PERMISSION_TYPES.map((perm) => (
                    <th key={perm.key} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col items-center">
                        <span>{perm.label}</span>
                        <span className="text-xs text-gray-400 normal-case">{perm.description}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {roles.map((role) => (
                  <tr key={role.id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: role.color }}
                        />
                        <span className="font-medium text-gray-900">{role.name}</span>
                      </div>
                    </td>
                    {PERMISSION_TYPES.map((perm) => {
                      const permission = permissions.find(p => 
                        p.targetType === 'role' && p.targetId === role.name && p.permissionType === perm.key
                      );
                      const isAllowed = permission?.allowed ?? false;
                      
                      return (
                        <td key={perm.key} className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={isAllowed}
                            onChange={(e) => updatePermission('role', role.name, perm.key, e.target.checked)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ロール作成モーダル */}
      {showCreateRole && (
        <CreateRoleModal
          onClose={() => setShowCreateRole(false)}
          onSubmit={createRole}
        />
      )}
    </div>
  );
}

function CreateRoleModal({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (data: { name: string; color: string; description?: string }) => void;
}) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#99AAB5');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onSubmit({
      name: name.trim(),
      color,
      description: description.trim() || undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">新しいロールを作成</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ロール名 *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ロール名を入力"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              色
            </label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-10 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              説明（オプション）
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ロールの説明を入力"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              作成
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const RBACPlugin: ChannelPlugin = {
  meta: {
    type: ChannelType.RBAC,
    name: 'RBAC管理',
    description: 'ロールベースアクセス制御',
    icon: <FiShield />,
    color: '#7C3AED',
  },
  ContentComponent: RBACContent,
};

export default RBACPlugin;