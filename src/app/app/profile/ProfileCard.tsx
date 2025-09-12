// app/profile/ProfileCard.tsx (クライアントコンポーネント)
"use client";
import { useState, useEffect } from "react";
import { IoMdAdd } from "react-icons/io";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ProfileEditModal from "@/components/profile/ProfileEditModal";
import useProfile from "@/hooks/useProfile";

export default function ProfileCard({
  user,
}: {
  user: { name: string; email: string; picture: string; sub: string };
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profile, setProfile] = useState({
    display_name: user.name,
    avatar_url: user.picture,
    auth0_id: user.sub,
  });
  const { fetchProfile, updateProfile, loading } = useProfile();

  useEffect(() => {
    // Load profile from backend
    const loadProfile = async () => {
      try {
        const backendProfile = await fetchProfile();
        setProfile(backendProfile);
      } catch (error) {
        console.error("Failed to load profile:", error);
        // Keep default profile if backend fails
      }
    };
    
    loadProfile();
  }, []);

  const handleSaveProfile = async (userData: { name: string; avatar: string }) => {
    try {
      const updatedProfile = await updateProfile({
        display_name: userData.name,
        avatar_url: userData.avatar,
      });
      
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  console.log(profile);
  return (
    <div className="flex flex-col items-center p-8 bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen overflow-y-auto">
      <div className="bg-gray-800/95 backdrop-blur-sm border border-white/20 shadow-2xl rounded-2xl p-8 w-full max-w-2xl">
        <div className="flex flex-col items-center space-y-6">
          <Avatar className="w-32 h-32 border-4 border-purple-400/50">
            <AvatarImage src={profile.avatar_url || user.picture} alt={profile.display_name} />
            <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-purple-500 to-blue-600 text-white">
              {profile.display_name[0]}
            </AvatarFallback>
          </Avatar>

          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-white">{profile.display_name}</h1>
            <p className="text-gray-400 text-sm">
              User ID: {user.sub || "N/A"}
            </p>
          </div>

          <div className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email</label>
                <p className="text-white font-medium">{user.email}</p>
              </div>
              {/* <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-900 font-medium">Online</span>
                </div>
              </div> */}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4 w-full">
            <Button 
              onClick={() => setIsEditModalOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white flex-1 py-3 rounded-xl transition-all transform hover:-translate-y-1 hover:shadow-lg"
              disabled={loading}
            >
              {loading ? "更新中..." : "プロフィールを編集"}
            </Button>
            <Button className="bg-white/10 hover:bg-white/20 border border-white/20 text-gray-300 hover:text-white flex items-center justify-center gap-2 flex-1 py-3 rounded-xl transition-all">
              <IoMdAdd size={18} />
              フレンドを追加
            </Button>
          </div>
        </div>
      </div>

      {/* プロフィール編集モーダル */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={{
          name: profile.display_name,
          email: user.email,
          picture: profile.avatar_url || user.picture,
          sub: user.sub,
        }}
        onSave={handleSaveProfile}
      />

      {/* 追加情報セクション */}
      {/* <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-2xl mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">アカウント情報</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">アカウント作成日</span>
            <span className="text-gray-900 font-medium">2024年1月1日</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">最終ログイン</span>
            <span className="text-gray-900 font-medium">今日</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">参加サーバー数</span>
            <span className="text-gray-900 font-medium">3</span>
          </div>
        </div>
      </div> */}
    </div>
  );
}
