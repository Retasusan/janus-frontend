"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BiHash } from "react-icons/bi";
import { IoMdAdd } from "react-icons/io";

type Server = {
  id: number;
  name: string;
  src: string;
  fallback: string;
  url: string;
};

type Channel = {
  id: number;
  name: string;
  url: string;
};

export default function ChannelSidebar() {
  const router = useRouter();

  const [servers] = useState<Server[]>([
    {
      id: 1,
      name: "Server One",
      src: "/server1.png",
      fallback: "A",
      url: "/app/servers/1",
    },
    {
      id: 2,
      name: "Server Two",
      src: "/server2.png",
      fallback: "B",
      url: "/app/servers/2",
    },
  ]);

  const [channels] = useState<Channel[]>([
    { id: 1, name: "general", url: "/app/servers/1/channels/general" },
    { id: 2, name: "random", url: "/app/servers/1/channels/random" },
    { id: 3, name: "project", url: "/app/servers/1/channels/project" },
  ]);

  return (
    <div className="w-56 bg-gray-800 text-gray-200 h-full flex flex-col">
      {/* サーバー名 */}
      <div className="h-16 flex items-center px-4 border-b border-gray-700 font-bold">
        {servers[0].name}
      </div>

      {/* チャンネルリスト */}
      <div className="flex-1 overflow-auto px-2 py-3">
        <div className="flex items-center justify-between px-2 mb-2 text-gray-400 uppercase text-xs font-semibold">
          <span>Text Channels</span>
          <button
            type="button"
            className="hover:text-white"
            onClick={() => alert("チャンネル追加！(モック)")}
          >
            <IoMdAdd size={16} />
          </button>
        </div>

        <div className="flex flex-col space-y-1">
          {channels.map((channel) => (
            <button
              type="button"
              key={channel.id}
              onClick={() => router.push(channel.url)}
              className="flex items-center px-2 py-1 text-gray-300 rounded hover:bg-gray-700 hover:text-white text-sm font-medium focus:outline-none"
            >
              <BiHash className="mr-2" />
              {channel.name}
            </button>
          ))}
        </div>
      </div>

      {/* ボトムユーザーなどは省略、必要なら追加 */}
    </div>
  );
}
