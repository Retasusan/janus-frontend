import { Skeleton } from "@/components/ui/skeleton";

interface ChannelItemSkeletonProps {
  width?: string;
}

export function ChannelItemSkeleton({ width = "100%" }: ChannelItemSkeletonProps) {
  return (
    <div className="flex items-center px-2 py-1 rounded">
      {/* アイコン部分のスケルトン */}
      <Skeleton className="w-4 h-4 mr-2 bg-gray-600" />
      {/* チャンネル名部分のスケルトン */}
      <Skeleton className="h-4 bg-gray-600" style={{ width }} />
    </div>
  );
}

export function ChannelSidebarSkeleton() {
  // 異なる幅でよりリアルに見せる
  const channelWidths = ["60%", "80%", "45%", "70%"];

  return (
    <div className="w-56 bg-gray-800 text-gray-200 h-full flex flex-col">
      {/* 固定ヘッダー */}
      <div className="h-16 flex items-center px-4 border-b border-gray-700 flex-shrink-0">
        <Skeleton className="h-6 w-32 bg-gray-600" />
      </div>

      {/* スクロール可能エリア */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-2 py-3">
          {/* Text Channels ヘッダー */}
          <div className="flex items-center justify-between px-2 mb-2">
            <Skeleton className="h-3 w-20 bg-gray-600" />
            <Skeleton className="w-4 h-4 bg-gray-600" />
          </div>

          {/* チャンネルアイテムのスケルトン */}
          <div className="flex flex-col space-y-1">
            {channelWidths.map((width, index) => (
              <ChannelItemSkeleton key={index} width={width} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
