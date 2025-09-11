"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoIosArrowDown, IoMdArrowBack } from "react-icons/io";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

type SessionUser = {
  name?: string;
};

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);
  
  const isProfilePage = pathname === "/app/profile";

  useEffect(() => {
    (async () => {
      try {
        // サーバー側APIを叩いて session を取得する想定
        const res = await fetch("/api/session");
        if (!res.ok) throw new Error("Failed to fetch session");
        const data = await res.json();
        setUser(data.user);
      } catch (e) {
        console.error(e);
        setUser(null);
      }
    })();
  }, []);

  return (
    <header className="bg-gray-800/95 backdrop-blur-sm h-12 pl-4 pr-6 py-3 flex justify-between items-center border-b border-white/10">
      <div className="flex items-center space-x-4">
        {isProfilePage ? (
          <div className="flex items-center space-x-2">
            <Link 
              href="/app" 
              className="flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <IoMdArrowBack size={16} className="mr-1" />
              戻る
            </Link>
            <span className="text-gray-500">|</span>
            <span className="text-white font-medium">プロフィール</span>
          </div>
        ) : (
          <div className="font-bold text-xl text-white flex items-center">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Janus
            </span>
          </div>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          id={"user-dropdown-trigger"}
          className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-sm flex justify-between items-center gap-2 text-white transition-all"
        >
          {user?.name ?? "ゲスト"}
          <IoIosArrowDown className="w-3 h-3" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mr-2 mt-1 bg-gray-800/95 backdrop-blur-sm border-white/20 text-white">
          <DropdownMenuLabel className="text-gray-300">アカウント設定</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/10">
            Janusについて
          </DropdownMenuItem>
          <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/10">
            <Link href="/app/profile">プロフィール</Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/10">
            <Link href="/auth/logout">ログアウト</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
