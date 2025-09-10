import React, { useState, useEffect } from 'react';
import { FiUsers, FiShield, FiLock } from 'react-icons/fi';
import { AdminGate } from '@/components/rbac/PermissionGate';
import { useToast } from '@/hooks/use-toast';

interface Role {
  id: number;
  serverId: string;
  name: string;
  color: string;
  description: string;
  position: number;
  permissionLevel: number;
  defaultRole: boolean;
  memberCount: number;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

interface Permission {
  name: string;
  description: string;
  hasPermission: boolean;
  required_level: number;
}

interface Member {
  id: string;
  userAuth0Id: string;
  userName: string;
  userEmail: string;
  userPicture?: string;
  role: string;
  roles: Role[];
  joinedAt: string;
}

interface RBACPluginProps {
  channel: {
    id: string;
    serverId: string;
    name: string;
  };
}

function RBACContent({ channel }: RBACPluginProps) {
  const { id: channelId, serverId } = channel;
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'roles' | 'members'>('roles');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showRoleAssignModal, setShowRoleAssignModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [channelId, serverId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesRes, membersRes] = await Promise.all([
        fetch(`/api/servers/${serverId}/roles`, { credentials: 'include' }),
        fetch(`/api/servers/${serverId}/members`, { credentials: 'include' })
      ]);

      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        setRoles(Array.isArray(rolesData) ? rolesData : []);
      }

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData.members || []);
      }
    } catch (error) {
      console.error('データの読み込みに失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (userId: string, roleId: number) => {
    try {
      const res = await fetch(`/api/servers/${serverId}/role_assignments/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role_id: roleId })
      });

      if (res.ok) {
        await loadData();
        setShowRoleAssignModal(false);
        setSelectedMember(null);
        toast({
          title: "成功",
          description: "ロールを正常に割り当てました",
        });
      } else {
        const error = await res.json();
        console.error('ロール割り当てに失敗しました:', error);
        toast({
          title: "エラー",
          description: error.error || "ロール割り当てに失敗しました",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('ロール割り当てに失敗しました:', error);
      toast({
        title: "エラー",
        description: "ロール割り当てに失敗しました",
        variant: "destructive",
      });
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
    <AdminGate 
      serverId={serverId}
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FiLock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">管理者権限が必要です</h3>
            <p className="mt-1 text-sm text-gray-500">
              この権限管理機能にアクセスするには管理者権限が必要です。
            </p>
          </div>
        </div>
      }
    >
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">権限管理</h1>
          <p className="text-gray-600">サーバーの権限は固定レベル制です。ロールを変更することで権限が変わります。</p>
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
              <FiShield className="inline mr-2" />
              ロール一覧
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'members'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiUsers className="inline mr-2" />
              メンバー管理
            </button>
          </nav>
        </div>

        {activeTab === 'roles' && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">ロール一覧と権限</h2>
              <p className="text-sm text-gray-600">各ロールの権限は固定です。チェックボックスは現在の権限状態を表示しています（変更不可）。</p>
            </div>

            <div className="space-y-4">
              {roles.map((role) => (
                <div key={role.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: role.color }}
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {role.name}
                          {role.defaultRole && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              デフォルト
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500">{role.description}</p>
                        <p className="text-xs text-gray-400">
                          権限レベル: {role.permissionLevel} | メンバー数: {role.memberCount}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* 権限詳細（読み取り専用） */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">このロールの権限:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {role.permissions?.map((permission) => (
                        <div
                          key={permission.name}
                          className="flex items-center space-x-2 p-2 rounded border"
                        >
                          <input
                            type="checkbox"
                            checked={permission.hasPermission}
                            disabled
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                          />
                          <div className="flex-1">
                            <span className={`text-sm ${permission.hasPermission ? 'text-gray-900' : 'text-gray-400'}`}>
                              {permission.description}
                            </span>
                            <div className="text-xs text-gray-400">
                              必要レベル: {permission.required_level}
                            </div>
                          </div>
                        </div>
                      )) || (
                        <div className="text-sm text-gray-500">権限情報の読み込み中...</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">メンバー管理</h2>
            
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {member.userPicture ? (
                        <img 
                          src={member.userPicture} 
                          alt={member.userName}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {member.userName?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-gray-900">{member.userName}</h3>
                        <p className="text-sm text-gray-500">{member.userEmail}</p>
                        <div className="mt-1 flex space-x-2">
                          {member.roles?.map((role) => (
                            <span
                              key={role.id}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: role.color + '20',
                                color: role.color
                              }}
                            >
                              {role.name}
                            </span>
                          )) || (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              ロール未割り当て
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedMember(member);
                        setShowRoleAssignModal(true);
                      }}
                      className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
                    >
                      ロール変更
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ロール割り当てモーダル */}
        {showRoleAssignModal && selectedMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedMember.userName} のロールを変更
              </h3>
              <div className="space-y-3">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => assignRole(selectedMember.userAuth0Id, role.id)}
                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: role.color }}
                      />
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-900">
                          {role.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {role.description}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      レベル {role.permissionLevel}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowRoleAssignModal(false);
                    setSelectedMember(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGate>
  );
}

// プラグイン定義
const RBACPlugin = {
  meta: {
    name: 'RBAC管理',
    description: 'サーバーの権限とロールを管理します',
    type: 'rbac' as const,
    icon: '🔒',
    color: '#8B5CF6',
  },
  ContentComponent: RBACContent,
};

export default RBACPlugin;
