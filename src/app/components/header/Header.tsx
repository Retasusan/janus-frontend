"use client"

import { IoIosArrowDown } from "react-icons/io";

export default function Header() {
  return (
    <header className="bg-white h-10 pl-2 pr-5 py-2 flex justify-between">
      <div>logo</div>
      <button type="button" className="text-xs flex justify-between gap-2 mt-1">
        山田太郎
        <IoIosArrowDown className="mt-[1.5px]"/>
      </button>
    </header>
  );
}
