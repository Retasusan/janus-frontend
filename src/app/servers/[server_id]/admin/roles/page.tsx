'use client';

import { useState, useEffect } from 'react';
import { AdminGate } from '@/components/rbac/PermissionGate';
import { FiUsers, FiShield, FiSettings, FiEdit3, FiTrash2 } from 'react-icons/fi';

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
  roles: Role[];
  joinedAt: string;
}

interface RoleManagementPageProps {
  params: { server_id: string };
}

export default function RoleManagementPage({ params }: RoleManagementPageProps) {
  const { server_id } = params;
  const [roles, setRoles] = useState<Role[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'roles' | 'members'>('roles');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showRoleAssignModal, setShowRoleAssignModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [server_id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesRes, membersRes] = await Promise.all([
        fetch(`/api/servers/${server_id}/roles`, { credentials: 'include' }),
        fetch(`/api/servers/${server_id}/members`, { credentials: 'include' })
      ]);

      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        setRoles(rolesData);
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
      const res = await fetch(`/api/servers/${server_id}/role_assignments/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role_id: roleId })
      });

      if (res.ok) {
        await loadData(); // データを再読み込み
        setShowRoleAssignModal(false);
        setSelectedMember(null);
      } else {
        const error = await res.json();
        console.error('ロール割り当てに失敗しました:', error);
      }
    } catch (error) {
      console.error('ロール割り当てに失敗しました:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <AdminGate 
      serverId={server_id}
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <FiShield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">アクセス権限がありません</h3>
            <p className="mt-1 text-sm text-gray-500">
              この権限管理ページにアクセスするには管理者権限が必要です。
            </p>
          </div>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FiSettings className="mr-3" />
            権限管理
          </h1>
          <p className="mt-2 text-gray-600">
            サーバーのロールとメンバーの権限を管理します
          </p>
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
              ロール管理
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

        {/* ロール管理タブ */}
        {activeTab === 'roles' && (
          <div className="space-y-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  サーバーロール一覧
                </h3>
                <div className="space-y-4">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: role.color }}
                          />
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">
                              {role.name}
                              {role.defaultRole && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  デフォルト
                                </span>
                              )}
                            </h4>
                            <p className="text-sm text-gray-500">{role.description}</p>
                            <p className="text-xs text-gray-400">
                              権限レベル: {role.permissionLevel} | メンバー数: {role.memberCount}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {!role.defaultRole && (
                            <>
                              <button className="p-2 text-gray-400 hover:text-gray-600">
                                <FiEdit3 className="h-4 w-4" />
                              </button>
                              <button className="p-2 text-red-400 hover:text-red-600">
                                <FiTrash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* 権限詳細 */}
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">権限詳細:</h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {role.permissions.map((permission) => (
                            <div
                              key={permission.name}
                              className={`px-3 py-1 rounded-full text-xs ${
                                permission.hasPermission
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {permission.description}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* メンバー管理タブ */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  メンバー一覧
                </h3>
                <div className="space-y-3">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between border border-gray-200 rounded-lg p-4"
                    >
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{member.userName}</h4>
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
                  ))}
                </div>
              </div>
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
