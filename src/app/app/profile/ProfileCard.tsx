// app/profile/ProfileCard.tsx (クライアントコンポーネント)
"use client";
import { IoMdAdd } from "react-icons/io";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function ProfileCard({
  user,
}: {
  user: { name: string; email: string; picture: string; sub: string };
}) {
  return (
    <div className="flex flex-col items-center p-8 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md flex flex-col items-center space-y-6">
        <Avatar className="w-24 h-24">
          <AvatarImage src={user.picture} alt={user.name} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-gray-500">@{user.sub?.split("|")[1]}</p>
        </div>
        <div className="w-full border-t border-gray-200 pt-4">
          <p className="text-gray-600 text-sm">
            Email:{" "}
            <span className="text-gray-800 font-medium">{user.email}</span>
          </p>
        </div>
        <div className="flex space-x-3 pt-4">
          <Button className="bg-blue-600 text-white hover:bg-blue-500">
            Edit Profile
          </Button>
          <Button className="bg-gray-200 text-gray-800 hover:bg-gray-300 flex items-center gap-1">
            <IoMdAdd /> Add Friend
          </Button>
        </div>
      </div>
    </div>
  );
}
