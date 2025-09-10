"use client";

import React from 'react';
import { useRBAC } from '../../hooks/useRBAC';

interface PermissionGateProps {
  permission: string;
  serverId: string;
  channelId?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({
  permission,
  serverId,
  channelId,
  children,
  fallback = null
}: PermissionGateProps) {
  const { can, loading } = useRBAC(serverId);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-4 rounded"></div>;
  }

  if (!can(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface RoleGateProps {
  roleName: string;
  serverId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGate({
  roleName,
  serverId,
  children,
  fallback = null
}: RoleGateProps) {
  const { hasRole, loading } = useRBAC(serverId);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-4 rounded"></div>;
  }

  if (!hasRole(roleName)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface AdminGateProps {
  serverId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AdminGate({
  serverId,
  children,
  fallback = null
}: AdminGateProps) {
  const { isAdmin, loading } = useRBAC(serverId);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-4 rounded"></div>;
  }

  if (!isAdmin()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface ModeratorGateProps {
  serverId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ModeratorGate({
  serverId,
  children,
  fallback = null
}: ModeratorGateProps) {
  const { isModerator, loading } = useRBAC(serverId);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-4 rounded"></div>;
  }

  if (!isModerator()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface PermissionLevelGateProps {
  level: number;
  serverId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionLevelGate({
  level,
  serverId,
  children,
  fallback = null
}: PermissionLevelGateProps) {
  const { hasPermissionLevel, loading } = useRBAC(serverId);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-4 rounded"></div>;
  }

  if (!hasPermissionLevel(level)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}