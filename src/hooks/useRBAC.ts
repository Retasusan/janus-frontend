import { useState, useEffect, useCallback } from 'react';

interface UserRole {
    id: number;
    name: string;
    color: string;
    description: string;
    permissionLevel: number;
}

interface RBACData {
    user_permissions: Record<string, boolean>;
    user_roles: UserRole[];
    max_permission_level: number;
}

export function useRBAC(serverId?: string) {
    const [rbacData, setRbacData] = useState<RBACData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRBACData = useCallback(async () => {
        if (!serverId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`/api/servers/${serverId}/members/me`);

            if (!response.ok) {
                throw new Error('Failed to fetch RBAC data');
            }

            const data = await response.json();

            // データの構造を確認してから設定
            setRbacData({
                user_permissions: data.user_permissions || {},
                user_roles: Array.isArray(data.user_roles) ? data.user_roles : [],
                max_permission_level: data.max_permission_level || 0
            });
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            setRbacData(null);
        } finally {
            setLoading(false);
        }
    }, [serverId]);

    useEffect(() => {
        fetchRBACData();
    }, [fetchRBACData]);

    // 権限チェック関数
    const can = useCallback((permission: string): boolean => {
        if (!rbacData) return false;
        return rbacData.user_permissions[permission] || false;
    }, [rbacData]);

    // ロールチェック関数
    const hasRole = useCallback((roleName: string): boolean => {
        if (!rbacData || !Array.isArray(rbacData.user_roles)) return false;
        return rbacData.user_roles.some(role =>
            role.name.toLowerCase() === roleName.toLowerCase()
        );
    }, [rbacData]);

    // 管理者チェック
    const isAdmin = useCallback((): boolean => {
        return can('manage_server');
    }, [can]);

    // モデレーターチェック
    const isModerator = useCallback((): boolean => {
        if (!rbacData) return false;
        return rbacData.max_permission_level >= 50; // moderator level
    }, [rbacData]);

    // 権限レベルチェック
    const hasPermissionLevel = useCallback((level: number): boolean => {
        if (!rbacData) return false;
        return rbacData.max_permission_level >= level;
    }, [rbacData]);

    // 複数権限のORチェック
    const canAny = useCallback((permissions: string[]): boolean => {
        return permissions.some(permission => can(permission));
    }, [can]);

    // 複数権限のANDチェック
    const canAll = useCallback((permissions: string[]): boolean => {
        return permissions.every(permission => can(permission));
    }, [can]);

    return {
        // データ
        rbacData,
        userRoles: rbacData?.user_roles || [],
        maxPermissionLevel: rbacData?.max_permission_level || 0,

        // 状態
        loading,
        error,

        // 権限チェック関数
        can,
        hasRole,
        isAdmin,
        isModerator,
        hasPermissionLevel,
        canAny,
        canAll,

        // ユーティリティ
        refresh: fetchRBACData
    };
}