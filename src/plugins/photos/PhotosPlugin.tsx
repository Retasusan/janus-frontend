"use client";

import React, { useEffect, useState } from 'react';
import { ChannelPlugin } from '@/types/plugin';
import { ChannelType, BaseChannel } from '@/types/channel';
import { Camera, Upload, Grid, Image as ImageIcon, Eye, X } from 'lucide-react';

function PhotosContent({ channel }: { channel: BaseChannel }) {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await globalThis.fetch(`/api/servers/${channel.serverId}/channels/${channel.id}/photos`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setPhotos(Array.isArray(data) ? data : []);
        } else {
          setPhotos([]);
        }
      } catch (e) { setPhotos([]); } finally { setLoading(false); }
    };
    load();
  }, [channel]);

  const upload = async () => {
    if (!file) return;
    const fd = new FormData();
    fd.append('photo[image]', file);
    if (caption) fd.append('photo[caption]', caption);
    const res = await globalThis.fetch(`/api/servers/${channel.serverId}/channels/${channel.id}/photos`, {
      method: 'POST', body: fd, credentials: 'include'
    });
    if (res.ok) {
      const newPhoto = await res.json();
      setPhotos(prev => [newPhoto, ...prev]);
      setFile(null);
      setCaption('');
    }
  };

  if (loading) return (
    <div className="h-full bg-gradient-to-br from-pink-900/20 to-purple-900/20 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-400"></div>
        <p className="text-pink-400 font-medium">写真を読み込み中...</p>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-gradient-to-br from-pink-900/20 to-purple-900/20">
      {/* ヘッダー */}
      <div className="border-b border-white/10 p-6 bg-white/5 backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              <Camera className="w-8 h-8 mr-3 text-pink-400" />
              フォトアルバム
            </h1>
            <p className="text-gray-300">{photos.length} 枚の写真</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => document.getElementById('photo-input')?.click()}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 px-6 py-3 rounded-xl font-medium text-white transition-all transform hover:-translate-y-1 hover:shadow-lg flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>写真をアップロード</span>
            </button>
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white transition-all">
              <Grid className="w-4 h-4 mr-2 inline" />
              表示切り替え
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        {photos.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-6">
              <ImageIcon className="w-20 h-20 mx-auto text-gray-500" />
              <p className="text-2xl font-semibold text-white">写真がありません</p>
              <p className="text-gray-400 text-lg">最初の写真をアップロードしてください</p>
              <button 
                onClick={() => document.getElementById('photo-input')?.click()}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 px-8 py-4 rounded-xl font-medium text-white transition-all transform hover:-translate-y-1 hover:shadow-lg flex items-center space-x-2 mx-auto"
              >
                <Upload className="w-5 h-5" />
                <span>写真をアップロード</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {photos.map((photo, index) => (
              <div 
                key={photo.id} 
                className="group relative aspect-square bg-gray-800 rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-105 hover:shadow-xl"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img 
                  src={photo.downloadUrl || photo.url} 
                  alt={photo.caption || ''} 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzc0MTUxIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUM5Qzk5IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=';
                  }}
                />
                
                {/* ホバーオーバーレイ */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="text-white text-center">
                    <Eye className="w-6 h-6 mx-auto mb-1" />
                    <p className="text-xs">表示</p>
                  </div>
                </div>
                
                {/* キャプション */}
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <p className="text-white text-sm truncate">{photo.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* アップロードフォーム */}
      <div className="border-t border-white/10 p-6 bg-white/5 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <input 
            id="photo-input"
            type="file" 
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)} 
            className="hidden" 
          />
          {file && (
            <div className="mb-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <ImageIcon className="w-12 h-12 text-pink-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-gray-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button 
                  onClick={() => setFile(null)}
                  className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-600/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input 
                value={caption} 
                onChange={(e) => setCaption(e.target.value)} 
                placeholder="キャプションを入力..." 
                className="w-full mt-3 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-pink-400 focus:outline-none transition-colors" 
              />
              <div className="flex justify-end mt-3">
                <button 
                  onClick={upload} 
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 px-6 py-2 rounded-lg font-medium text-white transition-all transform hover:-translate-y-1 hover:shadow-lg flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>アップロード</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 写真詳細モーダル */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 max-w-4xl max-h-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-white/20 flex justify-between items-center">
              <h3 className="text-white font-semibold">
                {selectedPhoto.caption || '写真'}
              </h3>
              <button 
                onClick={() => setSelectedPhoto(null)}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <img 
                src={selectedPhoto.downloadUrl || selectedPhoto.url} 
                alt={selectedPhoto.caption || ''} 
                className="max-w-full max-h-96 mx-auto rounded-lg"
              />
              {selectedPhoto.caption && (
                <p className="text-gray-300 mt-4 text-center">{selectedPhoto.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const photosPlugin: ChannelPlugin = {
  meta: { type: ChannelType.PHOTOS, name: 'アルバム', description: '写真アルバム', icon: <span>🖼️</span>, color: '#a78bfa' },
  ContentComponent: PhotosContent,
};
