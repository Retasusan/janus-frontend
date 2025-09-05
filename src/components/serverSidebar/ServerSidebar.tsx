"use client";

import { useRouter } from "next/navigation"; // ← これを使う
import { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Server = {
  id: number;
  name: string;
  src: string;
  fallback: string;
  url: string;
};

export default function ServerSidebar() {
  const router = useRouter();

  const [servers] = useState<Server[]>([
    {
      id: 1,
      name: "Server One",
      src: "/server1.png",
      fallback: "A",
      url: "/app/servers/1/channels/1",
    },
    {
      id: 2,
      name: "Server Two",
      src: "/server2.png",
      fallback: "B",
      url: "/app/servers/2/channels/1",
    },
  ]);

  return (
    <div className="w-14 bg-gray-900 text-gray-600 h-full flex flex-col items-center py-3 space-y-2">
      {/* サーバーアイコンたち */}
      <div className="flex flex-col items-center space-y-2 flex-1">
        {servers.map((server) => (
          <button
            type="button"
            key={server.id}
            onClick={() => router.push(server.url)} // ← router.push に置き換え
            className="group relative focus:outline-none"
          >
            <Avatar className="w-10 h-10 rounded-lg transition-all group-hover:rounded-xl">
              <AvatarImage
                className="rounded-lg"
                src={server.src}
                alt={server.name}
              />
              <AvatarFallback className="rounded-lg">
                {server.fallback}
              </AvatarFallback>
            </Avatar>
          </button>
        ))}
      </div>

      {/* サーバー追加アイコン */}
      <button
        type="button"
        className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-700 hover:rounded-xl hover:bg-green-600 transition-all cursor-pointer text-white"
        onClick={() => alert("新しいサーバーを追加！(モック)")}
      >
        <IoMdAdd size={22} />
      </button>
    </div>
  );
}
