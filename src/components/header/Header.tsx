"use client";

import Link from "next/link";
import { useId } from "react";
import { IoIosArrowDown } from "react-icons/io";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const triggerId = useId();

  return (
    <header className="bg-white h-10 pl-2 pr-5 py-2 flex justify-between">
      <div>logo</div>
      <DropdownMenu>
        <DropdownMenuTrigger
          id={"user-dropdown-trigger"}
          className="text-xs flex justify-between gap-2 m-1"
        >
          山田太郎
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
