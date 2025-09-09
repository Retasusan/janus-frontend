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
    <header className="bg-white h-10 pl-2 pr-5 py-2 flex justify-between items-center border-b border-gray-200">
      <div className="flex items-center space-x-4">
        {isProfilePage ? (
          <div className="flex items-center space-x-2">
            <Link 
              href="/app" 
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <IoMdArrowBack size={16} className="mr-1" />
              戻る
            </Link>
            <span className="text-gray-400">|</span>
            <span className="text-gray-900 font-medium">プロフィール</span>
          </div>
        ) : (
          <div className="font-semibold text-gray-900">Janus</div>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          id={"user-dropdown-trigger"}
          className="text-xs flex justify-between gap-2 m-1"
        >
          {user?.name ?? "ゲスト"}
          <IoIosArrowDown className="mt-[2.2px]" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mr-2 mt-1">
          <DropdownMenuLabel>アカウント設定</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Janusについて</DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/app/profile">プロフィール</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/auth/logout">ログアウト</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
