"use client";

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
  return (
    <header className="bg-white h-10 pl-2 pr-5 py-2 flex justify-between">
      <div>logo</div>
      <DropdownMenu>
        <DropdownMenuTrigger className="text-xs flex justify-between gap-2 m-1">
          山田太郎
          <IoIosArrowDown className="mt-[2.2px]" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mr-2 mt-1">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuItem>Team</DropdownMenuItem>
          <DropdownMenuItem>Subscription</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
