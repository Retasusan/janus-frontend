"use client";

import { useState } from "react";

export default function useProfile() {
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/users/profile', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('プロフィールの取得に失敗しました');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
    }
  };

  const updateProfile = async (data: { display_name: string; avatar_url: string }) => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('プロフィールの更新に失敗しました');
      }

      return await response.json();
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchProfile,
    updateProfile,
    loading,
  };
}
