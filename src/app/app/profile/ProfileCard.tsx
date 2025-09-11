// app/profile/ProfileCard.tsx (クライアントコンポーネント)
"use client";
import { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ProfileEditModal from "@/components/profile/ProfileEditModal";

export default function ProfileCard({
  user,
}: {
  user: { name: string; email: string; picture: string; sub: string };
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  const handleSaveProfile = async (userData: { name: string; avatar: string }) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('プロフィールの更新に失敗しました');
      }

      // ローカル状態を更新
      setCurrentUser(prev => ({
        ...prev,
        name: userData.name,
        picture: userData.avatar,
      }));
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  console.log(currentUser);
  return (
    <div className="flex flex-col items-center p-8 bg-gray-50 min-h-full">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-2xl">
        <div className="flex flex-col items-center space-y-6">
          <Avatar className="w-32 h-32 border-4 border-gray-200">
            <AvatarImage src={currentUser.picture} alt={currentUser.name} />
            <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {currentUser.name[0]}
            </AvatarFallback>
          </Avatar>

          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">{currentUser.name}</h1>
            <p className="text-gray-500 text-sm">
              User ID: {currentUser.sub || "N/A"}
            </p>
          </div>

          <div className="w-full bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900 font-medium">{currentUser.email}</p>
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
              className="bg-blue-600 text-white hover:bg-blue-700 flex-1 py-2"
            >
              プロフィールを編集
            </Button>
            <Button className="bg-gray-200 text-gray-800 hover:bg-gray-300 flex items-center justify-center gap-2 flex-1 py-2">
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
        user={currentUser}
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
