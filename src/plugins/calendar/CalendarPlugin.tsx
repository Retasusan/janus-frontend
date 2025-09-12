"use client";

import { useState, useEffect } from 'react';
import { ChannelPlugin, ChannelCreateFormProps } from '@/types/plugin';
import { ChannelType, BaseChannel } from '@/types/channel';

// イベント型
interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  createdBy: string;
  createdAt: string;
}

// カレンダーチャンネルの設定フォーム
function CalendarCreateForm({ onSubmit }: ChannelCreateFormProps) {
  const [allowAllMembers, setAllowAllMembers] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);

  const handleSubmit = () => {
    onSubmit({
      allowAllMembers,
      requireApproval,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={allowAllMembers}
            onChange={(e) => setAllowAllMembers(e.target.checked)}
            className="mr-2"
          />
          全メンバーがイベントを作成可能
        </label>
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={requireApproval}
            onChange={(e) => setRequireApproval(e.target.checked)}
            className="mr-2"
          />
          イベント作成時に承認が必要
        </label>
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

// カレンダーチャンネルのコンテンツコンポーネント
function CalendarContent({ channel }: { channel: BaseChannel }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    allDay: false,
  });

  useEffect(() => {
    fetchEvents();
  }, [channel, currentDate]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const res = await fetch(
        `/api/servers/${channel.serverId}/channels/${channel.id}/events?year=${year}&month=${month}`,
        { credentials: "include" }
      );
      if (res.ok) {
        const data: CalendarEvent[] = await res.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('イベント取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `/api/servers/${channel.serverId}/channels/${channel.id}/events`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(newEvent),
        }
      );

      if (res.ok) {
        const createdEvent: CalendarEvent = await res.json();
        setEvents(prev => [...prev, createdEvent]);
        setNewEvent({
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          allDay: false,
        });
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('イベント作成エラー:', error);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // 前月の日付を埋める
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // 当月の日付
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.startDate.startsWith(dateStr));
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-gray-300">カレンダーを読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 to-gray-800">
      {/* ヘッダー */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 bg-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center">
          <span className="text-gray-300 mr-2">📅</span>
          <h1 className="text-lg font-semibold text-white">{channel.name}</h1>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-lg transition-all transform hover:-translate-y-1 hover:shadow-lg"
        >
          イベント作成
        </button>
      </div>

      {/* カレンダーナビゲーション */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
          className="px-3 py-1 border border-white/20 bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
        >
          ←
        </button>
        <h2 className="text-xl font-semibold text-white">
          {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
        </h2>
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
          className="px-3 py-1 border border-white/20 bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
        >
          →
        </button>
      </div>

      {/* カレンダーグリッド */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['日', '月', '火', '水', '木', '金', '土'].map(day => (
            <div key={day} className="p-2 text-center font-semibold text-gray-300">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div
              key={index}
              className={`min-h-24 p-1 border border-white/10 rounded-lg ${
                day ? 'bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-sm' : 'bg-gray-900/50'
              } transition-colors`}
            >
              {day && (
                <>
                  <div className="font-medium text-sm mb-1 text-white">{day}</div>
                  <div className="space-y-1">
                    {getEventsForDay(day).map(event => (
                      <div
                        key={event.id}
                        className="text-xs p-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 text-purple-300 rounded truncate"
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* イベント作成フォーム */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800/95 backdrop-blur-sm border border-white/20 rounded-2xl p-6 w-full max-w-md mx-4 text-white">
            <h3 className="text-lg font-semibold mb-4 text-white">新しいイベント</h3>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  タイトル *
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  開始日時
                </label>
                <input
                  type="datetime-local"
                  value={newEvent.startDate}
                  onChange={(e) => setNewEvent({...newEvent, startDate: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  終了日時
                </label>
                <input
                  type="datetime-local"
                  value={newEvent.endDate}
                  onChange={(e) => setNewEvent({...newEvent, endDate: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newEvent.allDay}
                    onChange={(e) => setNewEvent({...newEvent, allDay: e.target.checked})}
                    className="mr-2 accent-purple-500"
                  />
                  <span className="text-gray-300">終日イベント</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-300 border border-white/20 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-lg transition-all transform hover:-translate-y-1 hover:shadow-lg"
                >
                  作成
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// カレンダープラグインの定義
export const calendarPlugin: ChannelPlugin = {
  meta: {
    type: ChannelType.CALENDAR,
    name: 'カレンダー',
    description: 'イベントとスケジュールの管理',
    icon: <span className="text-lg">📅</span>,
    color: '#f59e0b',
  },
  CreateForm: CalendarCreateForm,
  ContentComponent: CalendarContent,
};