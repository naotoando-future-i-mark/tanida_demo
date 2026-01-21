import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Building2, AlertCircle, Video, MapPin, Edit2, Trash2, Repeat, FileText, Bell } from 'lucide-react';
import { Event } from '../types/event';
import { ColorPreset } from './ColorPickerModal';
import { supabase } from '../lib/supabase';

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
}

export const EventDetailModal = ({ isOpen, onClose, event, onEdit, onDelete }: EventDetailModalProps) => {
  const [startY, setStartY] = useState<number | null>(null);
  const [currentY, setCurrentY] = useState<number | null>(null);
  const [colorPresets, setColorPresets] = useState<ColorPreset[]>([]);

  useEffect(() => {
    const fetchColorPresets = async () => {
      const { data, error } = await supabase
        .from('color_presets')
        .select('*')
        .order('order_index');

      if (data && !error) {
        setColorPresets(data);
      }
    };

    if (isOpen) {
      fetchColorPresets();
    }
  }, [isOpen]);

  if (!isOpen || !event) return null;

  const eventColor = colorPresets.find((p) => p.id === event.color_id);

  const handleDelete = () => {
    if (window.confirm('この予定を削除してもよろしいですか？')) {
      onDelete(event.id);
      onClose();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY !== null) {
      const deltaY = e.touches[0].clientY - startY;
      if (deltaY > 0) {
        setCurrentY(deltaY);
      }
    }
  };

  const handleTouchEnd = () => {
    if (currentY !== null && currentY > 100) {
      handleClose();
    } else {
      setCurrentY(null);
    }
    setStartY(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setStartY(e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (startY !== null) {
      const deltaY = e.clientY - startY;
      if (deltaY > 0) {
        setCurrentY(deltaY);
      }
    }
  };

  const handleMouseUp = () => {
    if (currentY !== null && currentY > 100) {
      handleClose();
    } else {
      setCurrentY(null);
    }
    setStartY(null);
  };

  const handleClose = () => {
    setStartY(null);
    setCurrentY(null);
    onClose();
  };

  const formatDateTime = () => {
    if (event.all_day) {
      const start = new Date(event.start_at);
      const end = new Date(event.end_at);

      if (start.toDateString() === end.toDateString()) {
        return `${start.getFullYear()}年${start.getMonth() + 1}月${start.getDate()}日 (終日)`;
      }

      return `${start.getFullYear()}年${start.getMonth() + 1}月${start.getDate()}日 〜 ${end.getFullYear()}年${end.getMonth() + 1}月${end.getDate()}日 (終日)`;
    } else {
      const start = new Date(event.start_at);
      const end = new Date(event.end_at);

      return `${start.getFullYear()}年${start.getMonth() + 1}月${start.getDate()}日 ${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')} 〜 ${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
    }
  };

  const formatDeadline = () => {
    if (!event.deadline_at) return null;
    const deadline = new Date(event.deadline_at);
    return `${deadline.getFullYear()}年${deadline.getMonth() + 1}月${deadline.getDate()}日`;
  };

  const formatPrepDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const getRecurrenceLabel = () => {
    if (!event.recurrence_type || event.recurrence_type === 'none') return null;

    if (event.recurrence_type === 'daily') return '毎日';
    if (event.recurrence_type === 'weekly') return '毎週';
    if (event.recurrence_type === 'monthly') return '毎月';
    if (event.recurrence_type === 'yearly') return '毎年';
    if (event.recurrence_type === 'custom') return 'カスタム';

    return null;
  };

  const getNotificationLabel = (notification: any) => {
    if (notification.type === 'at_time') return '予定時間';
    if (notification.type === 'before_10min') return '10分前';
    if (notification.type === 'before_1hour') return '1時間前';
    if (notification.type === 'custom') {
      const unitLabels = {
        minute: '分',
        hour: '時間',
        day: '日',
        week: '週間',
      };
      const unitLabel = unitLabels[notification.customUnit as keyof typeof unitLabels];
      const refLabel = notification.referenceTime === 'start' ? '開始' : '終了';
      return `${notification.customValue}${unitLabel}前（${refLabel}時間）`;
    }
    return '';
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black bg-opacity-50 backdrop-blur-sm" onClick={handleClose} />
      <div
        className="fixed inset-0 z-[60] bg-gradient-to-b from-white to-gray-50/80 shadow-2xl flex flex-col transition-transform"
        style={{ transform: currentY ? `translateY(${currentY}px)` : 'translateY(0)' }}
      >
        <div
          className="relative flex items-center justify-between px-6 py-4 border-b-2 border-gray-100 cursor-grab active:cursor-grabbing bg-white/80 backdrop-blur-sm"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={startY !== null ? handleMouseMove : undefined}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="absolute left-1/2 top-2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full"></div>
          <h3 className="text-lg font-bold text-gray-800">予定詳細</h3>
          <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="relative bg-white rounded-xl p-4 shadow-lg border border-gray-100">
            <div className="absolute top-0 left-0 w-2 h-full rounded-l-xl"
                 style={{ backgroundColor: eventColor?.color || '#9E9E9E' }}></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 pl-3">{event.title}</h2>
            {eventColor && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm ml-3"
                   style={{ backgroundColor: `${eventColor.color}20`, color: eventColor.color }}>
                <Calendar size={14} />
                <span>{eventColor.label}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-sky-100 flex items-center justify-center shadow-sm">
                  <Clock size={20} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">日時</p>
                  <p className="text-gray-900 font-medium leading-relaxed">{formatDateTime()}</p>
                </div>
              </div>
            </div>

            {event.company_name && (
              <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center shadow-sm">
                    <Building2 size={20} className="text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">会社名</p>
                    <p className="text-gray-900 font-medium">{event.company_name}</p>
                  </div>
                </div>
              </div>
            )}

            {event.deadline_at && (
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-5 shadow-md border-2 border-red-100 hover:shadow-lg transition-shadow">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shadow-sm">
                    <AlertCircle size={20} className="text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-1.5">応募締切</p>
                    <p className="text-red-700 font-bold text-lg">{formatDeadline()}</p>
                  </div>
                </div>
              </div>
            )}

            {event.preparation_dates && event.preparation_dates.length > 0 && (
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 shadow-md border-2 border-orange-100 hover:shadow-lg transition-shadow">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-amber-200 flex items-center justify-center shadow-sm">
                    <Clock size={20} className="text-[#FFA52F]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-orange-700 uppercase tracking-wider mb-3">選考対策日</p>
                    <div className="space-y-2.5">
                      {event.preparation_dates.map((pd) => (
                        <div key={pd.id} className="p-3.5 bg-white rounded-xl shadow-sm border border-orange-100">
                          <p className="text-gray-900 font-semibold mb-1.5">{pd.title || event.title}</p>
                          <p className="text-sm text-gray-600 font-medium">
                            {formatPrepDateTime(pd.date)}
                            {pd.end_date && ` - ${formatPrepDateTime(pd.end_date)}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {event.meeting_url && (
              <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-50 to-purple-100 flex items-center justify-center shadow-sm">
                    <Video size={20} className="text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">ビデオ会議</p>
                    <a
                      href={event.meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-600 hover:text-violet-700 font-medium underline break-all transition-colors"
                    >
                      {event.meeting_url}
                    </a>
                  </div>
                </div>
              </div>
            )}

            {event.location && (
              <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center shadow-sm">
                    <MapPin size={20} className="text-rose-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">場所</p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-rose-600 hover:text-rose-700 font-medium underline break-all transition-colors cursor-pointer"
                    >
                      {event.location}
                    </a>
                  </div>
                </div>
              </div>
            )}

            {getRecurrenceLabel() && (
              <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-sky-100 flex items-center justify-center shadow-sm">
                    <Repeat size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">繰り返し</p>
                    <p className="text-gray-900 font-medium">{getRecurrenceLabel()}</p>
                  </div>
                </div>
              </div>
            )}

            {event.notifications && event.notifications.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-100 flex items-center justify-center shadow-sm">
                    <Bell size={20} className="text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">通知</p>
                    <div className="space-y-2">
                      {event.notifications.map((notification, index) => (
                        <div key={index} className="flex items-center gap-2 px-3 py-2 bg-teal-50/60 rounded-lg border border-teal-100">
                          <Bell size={14} className="text-teal-600" />
                          <span className="text-sm text-gray-800 font-medium">{getNotificationLabel(notification)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {event.memo && (
              <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center shadow-sm">
                    <FileText size={20} className="text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">メモ</p>
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{event.memo}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t-2 border-gray-100 flex gap-3 bg-white/80 backdrop-blur-sm">
          <button
            onClick={handleDelete}
            className="flex-1 flex items-center justify-center gap-2.5 px-5 py-3.5 border-2 border-red-200 text-red-600 rounded-2xl hover:bg-red-50 hover:border-red-300 transition-all font-semibold shadow-sm hover:shadow-md"
          >
            <Trash2 size={19} />
            削除
          </button>
          <button
            onClick={() => onEdit(event)}
            className="flex-1 flex items-center justify-center gap-2.5 px-5 py-3.5 bg-gradient-to-r from-[#FFA52F] to-[#FF8C00] text-white rounded-2xl hover:from-[#FF9520] hover:to-[#FF7B00] transition-all font-semibold shadow-md hover:shadow-lg hover:scale-[1.02]"
          >
            <Edit2 size={19} />
            編集
          </button>
        </div>
      </div>
    </>
  );
};
