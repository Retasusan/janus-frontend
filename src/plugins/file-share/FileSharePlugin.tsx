"use client";

import { useState, useEffect } from 'react';
import { ChannelPlugin, ChannelCreateFormProps } from '@/types/plugin';
import { ChannelType, BaseChannel } from '@/types/channel';

// ファイル型
interface FileItem {
    id: number;
    filename: string;
    size: number;
    mimeType: string;
    uploadedBy: string;
    uploadedAt: string;
    downloadUrl: string;
}

// ファイル共有チャンネルの設定フォーム
function FileShareCreateForm({ onSubmit }: ChannelCreateFormProps) {
    const [maxFileSize, setMaxFileSize] = useState(10); // MB
    const [allowedTypes, setAllowedTypes] = useState<string[]>([]);

    const handleSubmit = () => {
        onSubmit({
            maxFileSize: maxFileSize * 1024 * 1024, // バイトに変換
            allowedTypes: allowedTypes.length > 0 ? allowedTypes : undefined,
        });
    };

    const fileTypes = [
        { value: 'image/*', label: '画像ファイル' },
        { value: 'application/pdf', label: 'PDFファイル' },
        { value: 'text/*', label: 'テキストファイル' },
        { value: 'application/zip', label: 'ZIPファイル' },
    ];

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    最大ファイルサイズ (MB)
                </label>
                <input
                    type="number"
                    value={maxFileSize}
                    onChange={(e) => setMaxFileSize(Number(e.target.value))}
                    min={1}
                    max={100}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    許可するファイルタイプ（未選択の場合は全て許可）
                </label>
                <div className="space-y-2">
                    {fileTypes.map((type) => (
                        <label key={type.value} className="flex items-center">
                            <input
                                type="checkbox"
                                checked={allowedTypes.includes(type.value)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setAllowedTypes([...allowedTypes, type.value]);
                                    } else {
                                        setAllowedTypes(allowedTypes.filter(t => t !== type.value));
                                    }
                                }}
                                className="mr-2"
                            />
                            {type.label}
                        </label>
                    ))}
                </div>
            </div>

            <button
                type="button"
                onClick={handleSubmit}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
                設定を保存
            </button>
        </div>
    );
}

// ファイル共有チャンネルのコンテンツコンポーネント
function FileShareContent({ channel }: { channel: BaseChannel }) {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    useEffect(() => {
        fetchFiles();
    }, [channel]);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `/api/servers/${channel.serverId}/channels/${channel.id}/files`,
                { credentials: "include" }
            );
            if (res.ok) {
                const data: FileItem[] = await res.json();
                setFiles(data);
            }
        } catch (error) {
            console.error('ファイル取得エラー:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (fileList: FileList) => {
        if (!fileList.length) return;

        setUploading(true);
        try {
            for (const file of Array.from(fileList)) {
                const formData = new FormData();
                formData.append('file', file);

                const res = await fetch(
                    `/api/servers/${channel.serverId}/channels/${channel.id}/files`,
                    {
                        method: 'POST',
                        credentials: 'include',
                        body: formData,
                    }
                );

                if (res.ok) {
                    const newFile: FileItem = await res.json();
                    setFiles(prev => [newFile, ...prev]);
                }
            }
        } catch (error) {
            console.error('ファイルアップロードエラー:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        handleFileUpload(e.dataTransfer.files);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">ファイルを読み込み中...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* ヘッダー */}
            <div className="h-16 flex items-center px-4 border-b border-gray-300 bg-white shadow-sm">
                <div className="flex items-center">
                    <span className="text-gray-500 mr-2">📁</span>
                    <h1 className="text-lg font-semibold text-gray-800">{channel.name}</h1>
                    {channel.description && (
                        <span className="ml-2 text-sm text-gray-500">- {channel.description}</span>
                    )}
                </div>
            </div>

            {/* ファイルアップロードエリア */}
            <div
                className={`m-4 p-8 border-2 border-dashed rounded-lg text-center ${dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                    }`}
                onDrop={handleDrop}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
            >
                <div className="text-gray-500">
                    <div className="text-4xl mb-2">📤</div>
                    <p className="mb-2">ファイルをドラッグ&ドロップするか、クリックして選択</p>
                    <input
                        type="file"
                        multiple
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                        className="hidden"
                        id="file-upload"
                    />
                    <label
                        htmlFor="file-upload"
                        className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
                    >
                        ファイルを選択
                    </label>
                </div>
            </div>

            {uploading && (
                <div className="mx-4 mb-4 p-2 bg-blue-100 text-blue-800 rounded">
                    アップロード中...
                </div>
            )}

            {/* ファイル一覧 */}
            <div className="flex-1 overflow-auto p-4">
                {files.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                        <p>まだファイルがアップロードされていません</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {files.map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                <div className="flex items-center space-x-3">
                                    <div className="text-2xl">📄</div>
                                    <div>
                                        <div className="font-medium">{file.filename}</div>
                                        <div className="text-sm text-gray-500">
                                            {formatFileSize(file.size)} • {file.uploadedBy} • {new Date(file.uploadedAt).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <a
                                    href={file.downloadUrl}
                                    download
                                    className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                >
                                    ダウンロード
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ファイル共有プラグインの定義
export const fileSharePlugin: ChannelPlugin = {
    meta: {
        type: ChannelType.FILE_SHARE,
        name: 'ファイル共有',
        description: 'ファイルのアップロードと共有',
        icon: <span className="text-lg">📁</span>,
        color: '#10b981',
    },
    CreateForm: FileShareCreateForm,
    ContentComponent: FileShareContent,
};