"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { PenTool, Eraser, Square, Circle, Type, Download, Trash2, Users, Palette, Zap, RotateCcw } from "lucide-react";
import { ChannelPlugin, ChannelContentProps, ChannelCreateFormProps } from "@/types/plugin";
import { BaseChannel, ChannelType } from "@/types/channel";
import { useRealTimePolling } from "@/hooks/useRealTimePolling";

interface DrawingData {
  id: string;
  type: 'pen' | 'eraser' | 'rectangle' | 'circle' | 'text';
  points?: { x: number; y: number }[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
  strokeWidth: number;
  timestamp: number;
  userId: string;
}

interface WhiteboardState {
  drawings: DrawingData[];
  activeUsers: string[];
}

function WhiteboardContent({ channel }: { channel: BaseChannel }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser' | 'rectangle' | 'circle' | 'text'>('pen');
  const [currentColor, setCurrentColor] = useState('#ffffff');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [drawings, setDrawings] = useState<DrawingData[]>([]);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [textInput, setTextInput] = useState({ show: false, x: 0, y: 0, value: '' });
  const [loading, setLoading] = useState(true);

  const colors = [
    '#ffffff', '#000000', '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6',
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
  ];

  const loadWhiteboard = useCallback(async () => {
    try {
      const res = await fetch(`/api/servers/${channel.serverId}/channels/${channel.id}/whiteboards`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        // backend returns an array of whiteboard records. Each record has an `operations` JSONB.
        // We prefer the latest record's operations (most recently updated).
        if (Array.isArray(data) && data.length > 0) {
          const latest = data[0];
          if (latest.operations) {
            // operations may be an object or an array depending on implementation.
            // If it's an object with drawings key, prefer that, otherwise if it's an array use it directly.
            if (latest.operations.drawings) {
              setDrawings(latest.operations.drawings);
            } else if (Array.isArray(latest.operations)) {
              setDrawings(latest.operations);
            } else {
              // fallback: if operations itself looks like a drawing object, wrap it
              setDrawings([latest.operations]);
            }
          }
        }
        // activeUsers may be provided in a companion API in the future; keep safe fallback
        if (data && data.activeUsers) {
          setActiveUsers(data.activeUsers);
        }
      }
    } catch (e) {
      console.error('ホワイトボード読み込みエラー:', e);
    } finally {
      setLoading(false);
    }
  }, [channel.serverId, channel.id]);

  useEffect(() => {
    loadWhiteboard();
  }, [loadWhiteboard]);

  useEffect(() => {
    redrawCanvas();
  }, [drawings]);

  // リアルタイム更新（2秒間隔で高頻度更新）
  useRealTimePolling(loadWhiteboard, 2000);

  const saveDrawing = async (newDrawing: DrawingData) => {
    try {
      // 楽観的更新: 先にローカル状態を更新
      const updatedDrawings = [...drawings, newDrawing];
      setDrawings(updatedDrawings);

      const response = await fetch(`/api/servers/${channel.serverId}/channels/${channel.id}/whiteboards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        // 全体の描画配列を送信（共同編集のため）
        body: JSON.stringify({ 
          whiteboard: { 
            operations: { 
              drawings: updatedDrawings,
              timestamp: Date.now() 
            } 
          } 
        }),
      });
      
      if (response.ok) {
        // 成功時は即座にサーバーから最新状態を取得
        setTimeout(() => loadWhiteboard(), 200);
      } else {
        // 失敗時は楽観的更新をロールバック
        setDrawings(drawings);
        try {
          const body = await response.json();
          console.error('描画保存に失敗しました:', response.status, body);
        } catch (parseErr) {
          const text = await response.text();
          console.error('描画保存に失敗しました:', response.status, text);
        }
      }
    } catch (e) {
      // エラー時もロールバック
      setDrawings(drawings);
      console.error('描画保存エラー:', e);
    }
  };

  const clearBoard = async () => {
    if (!confirm('ホワイトボードをクリアしますか？')) return;
    
    try {
      // 楽観的更新
      setDrawings([]);
      
      const response = await fetch(`/api/servers/${channel.serverId}/channels/${channel.id}/whiteboards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          whiteboard: { 
            operations: { 
              drawings: [],
              timestamp: Date.now() 
            } 
          } 
        }),
      });
      
      if (response.ok) {
        redrawCanvas();
        setTimeout(() => loadWhiteboard(), 200);
      } else {
        console.error('ボードクリアに失敗しました');
      }
    } catch (e) {
      console.error('ボードクリアエラー:', e);
    }
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // キャンバスをクリア
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 全ての描画を再描画
    drawings.forEach(drawing => {
      ctx.strokeStyle = drawing.color;
      ctx.fillStyle = drawing.color;
      ctx.lineWidth = drawing.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      switch (drawing.type) {
        case 'pen':
          if (drawing.points && drawing.points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(drawing.points[0].x, drawing.points[0].y);
            drawing.points.forEach(point => {
              ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
          }
          break;
        case 'eraser':
          if (drawing.points && drawing.points.length > 1) {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.moveTo(drawing.points[0].x, drawing.points[0].y);
            drawing.points.forEach(point => {
              ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
            ctx.globalCompositeOperation = 'source-over';
          }
          break;
        case 'rectangle':
          if (drawing.x !== undefined && drawing.y !== undefined && 
              drawing.width !== undefined && drawing.height !== undefined) {
            ctx.strokeRect(drawing.x, drawing.y, drawing.width, drawing.height);
          }
          break;
        case 'circle':
          if (drawing.x !== undefined && drawing.y !== undefined && 
              drawing.width !== undefined) {
            ctx.beginPath();
            ctx.arc(drawing.x, drawing.y, drawing.width / 2, 0, 2 * Math.PI);
            ctx.stroke();
          }
          break;
        case 'text':
          if (drawing.x !== undefined && drawing.y !== undefined && drawing.text) {
            ctx.font = `${drawing.strokeWidth * 6}px Arial`;
            ctx.fillText(drawing.text, drawing.x, drawing.y);
          }
          break;
      }
    });
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    
    if (currentTool === 'text') {
      setTextInput({ show: true, x: pos.x, y: pos.y, value: '' });
      return;
    }
    
    setIsDrawing(true);
    setCurrentPath([pos]);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const pos = getMousePos(e);
    setCurrentPath(prev => [...prev, pos]);
    
    // リアルタイム描画
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }
    
    if (currentPath.length > 1) {
      ctx.beginPath();
      ctx.moveTo(currentPath[currentPath.length - 2].x, currentPath[currentPath.length - 2].y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing || currentPath.length === 0) return;
    
    const newDrawing: DrawingData = {
      id: Date.now().toString(),
      type: currentTool,
      points: currentPath,
      color: currentColor,
      strokeWidth,
      timestamp: Date.now(),
      userId: 'current_user' // 実際のプロジェクトでは実際のユーザーIDを使用
    };
    
    setDrawings(prev => [...prev, newDrawing]);
    saveDrawing(newDrawing);
    setIsDrawing(false);
    setCurrentPath([]);
  };

  const addText = () => {
    if (!textInput.value.trim()) {
      setTextInput({ show: false, x: 0, y: 0, value: '' });
      return;
    }
    
    const newDrawing: DrawingData = {
      id: Date.now().toString(),
      type: 'text',
      x: textInput.x,
      y: textInput.y,
      text: textInput.value,
      color: currentColor,
      strokeWidth,
      timestamp: Date.now(),
      userId: 'current_user'
    };
    
    setDrawings(prev => [...prev, newDrawing]);
    saveDrawing(newDrawing);
    setTextInput({ show: false, x: 0, y: 0, value: '' });
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  if (loading) return (
    <div className="h-full bg-gradient-to-br from-green-900/20 to-emerald-900/20 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400"></div>
        <p className="text-green-400 font-medium">ホワイトボードを読み込み中...</p>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-gradient-to-br from-green-900/20 to-emerald-900/20 flex flex-col">
      {/* ツールバー */}
      <div className="border-b border-white/10 p-4 bg-white/5 backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <Zap className="w-6 h-6 mr-2 text-green-400" />
              共同ホワイトボード
            </h1>
            
            {/* リアルタイムユーザー表示 */}
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <Users className="w-4 h-4" />
              <span>{activeUsers.length + 1} 人が編集中</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={downloadCanvas}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-white transition-all flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>ダウンロード</span>
            </button>
            
            <button
              onClick={clearBoard}
              className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg px-3 py-2 text-red-300 transition-all flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>クリア</span>
            </button>
          </div>
        </div>
        
        {/* ツールパレット */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            {/* 描画ツール */}
            <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-2">
              {[
                { tool: 'pen', icon: PenTool, label: 'ペン' },
                { tool: 'eraser', icon: Eraser, label: '消しゴム' },
                { tool: 'rectangle', icon: Square, label: '四角形' },
                { tool: 'circle', icon: Circle, label: '円' },
                { tool: 'text', icon: Type, label: 'テキスト' },
              ].map(({ tool, icon: Icon, label }) => (
                <button
                  key={tool}
                  onClick={() => setCurrentTool(tool as any)}
                  className={`p-2 rounded transition-all ${
                    currentTool === tool
                      ? 'bg-green-500 text-white'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                  title={label}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
            
            {/* 線の太さ */}
            <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-2">
              <span className="text-sm text-gray-300">太さ:</span>
              <input
                type="range"
                min="1"
                max="20"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-sm text-white w-6">{strokeWidth}</span>
            </div>
          </div>
          
          {/* カラーパレット */}
          <div className="flex items-center space-x-2">
            <Palette className="w-4 h-4 text-gray-300" />
            <div className="flex items-center space-x-1 bg-white/10 rounded-lg p-2">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setCurrentColor(color)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    currentColor === color ? 'border-white scale-110' : 'border-gray-500'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* キャンバス領域 */}
      <div className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          width={1200}
          height={800}
          className="absolute inset-0 cursor-crosshair"
          style={{ width: '100%', height: '100%' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
        
        {/* テキスト入力モーダル */}
        {textInput.show && (
          <div
            className="absolute bg-white/90 backdrop-blur-sm border border-white/20 rounded-lg p-3 z-10"
            style={{ left: textInput.x, top: textInput.y }}
          >
            <input
              type="text"
              value={textInput.value}
              onChange={(e) => setTextInput(prev => ({ ...prev, value: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addText();
                if (e.key === 'Escape') setTextInput({ show: false, x: 0, y: 0, value: '' });
              }}
              placeholder="テキストを入力..."
              className="bg-transparent border-none outline-none text-gray-800 placeholder-gray-500"
              autoFocus
            />
            <div className="flex space-x-2 mt-2">
              <button
                onClick={addText}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm"
              >
                追加
              </button>
              <button
                onClick={() => setTextInput({ show: false, x: 0, y: 0, value: '' })}
                className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const whiteboardPlugin: ChannelPlugin = {
  meta: {
    type: ChannelType.WHITEBOARD,
    name: 'ホワイトボード',
    description: 'リアルタイム共同ホワイトボード',
    icon: <Zap className="w-4 h-4" />,
    color: '#10b981',
  },
  ContentComponent: WhiteboardContent,
};
