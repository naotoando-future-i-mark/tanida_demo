import { useState, useEffect } from 'react';
import { X, Palette, Clock, Building2, AlertCircle, Video, MapPin, Plus, Trash2, Repeat, FileText, Bell, Briefcase } from 'lucide-react';
import { Event, PreparationDate, NotificationConfig } from '../types/event';
import { ColorPickerModal, ColorPreset } from './ColorPickerModal';
import { RecurrenceModal, RecurrenceConfig } from './RecurrenceModal';
import { NotificationModal } from './NotificationModal';
import { supabase } from '../lib/supabase';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<Event, 'id'>) => void;
  onUpdate?: (event: Event) => void;
  initialDate?: Date;
  editingEvent?: Event;
}

export const AddEventModal = ({ isOpen, onClose, onSave, onUpdate, initialDate, editingEvent }: AddEventModalProps) => {
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<'intern' | 'fulltime' | ''>('');
  const [colorId, setColorId] = useState<string>('');
  const [allDay, setAllDay] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadlineAt, setDeadlineAt] = useState('');
  const [preparationDates, setPreparationDates] = useState<Array<{ date: string; end_date?: string; title: string; timeDiff?: number }>>([]);
  const [meetingUrl, setMeetingUrl] = useState('');
  const [location, setLocation] = useState('');
  const [memo, setMemo] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceConfig>({
    type: 'none',
    interval: 1,
    endType: 'never',
  });
  const [notifications, setNotifications] = useState<NotificationConfig[]>([]);

  const [colorPresets, setColorPresets] = useState<ColorPreset[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showRecurrenceModal, setShowRecurrenceModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const [startY, setStartY] = useState<number | null>(null);
  const [currentY, setCurrentY] = useState<number | null>(null);
  const [previousStartDate, setPreviousStartDate] = useState('');
  const [previousEndDate, setPreviousEndDate] = useState('');

  const formatDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const formatDateOnly = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleAllDayToggle = () => {
    const newAllDay = !allDay;
    setAllDay(newAllDay);

    if (newAllDay) {
      // Save current datetime values before switching to all-day
      setPreviousStartDate(startDate);
      setPreviousEndDate(endDate);

      // Convert to date-only format
      if (startDate) {
        const start = new Date(startDate);
        setStartDate(formatDateOnly(start));
      } else if (initialDate) {
        setStartDate(formatDateOnly(initialDate));
      }

      if (endDate) {
        const end = new Date(endDate);
        setEndDate(formatDateOnly(end));
      } else if (initialDate) {
        setEndDate(formatDateOnly(initialDate));
      }
    } else {
      // Restore previous datetime values when unchecking all-day
      if (previousStartDate && previousEndDate) {
        setStartDate(previousStartDate);
        setEndDate(previousEndDate);
      } else {
        // Fallback: convert date to datetime with current time
        const now = new Date();
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(now.getHours(), 0, 0, 0);
          setStartDate(formatDateTimeLocal(start));
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(now.getHours() + 1, 0, 0, 0);
          setEndDate(formatDateTimeLocal(end));
        }
      }
    }
  };

  useEffect(() => {
    const fetchColorPresets = async () => {
      const { data, error } = await supabase
        .from('color_presets')
        .select('*')
        .order('order_index');

      if (data && !error) {
        setColorPresets(data);
        if (!editingEvent && !colorId && data.length > 0) {
          setColorId(data[0].id);
        }
      }
    };

    if (isOpen) {
      fetchColorPresets();
    }
  }, [isOpen]);

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setEventType(editingEvent.event_type || '');
      setColorId(editingEvent.color_id);
      setAllDay(editingEvent.all_day);

      if (editingEvent.all_day) {
        setStartDate(editingEvent.start_at);
        setEndDate(editingEvent.end_at);
      } else {
        const start = new Date(editingEvent.start_at);
        const end = new Date(editingEvent.end_at);
        setStartDate(formatDateTimeLocal(start));
        setEndDate(formatDateTimeLocal(end));
      }

      setCompanyName(editingEvent.company_name || '');
      setHasDeadline(!!editingEvent.deadline_at);
      setDeadlineAt(editingEvent.deadline_at ? new Date(editingEvent.deadline_at).toISOString().split('T')[0] : '');
      setPreparationDates(
        editingEvent.preparation_dates?.map(pd => {
          let timeDiff = 60;
          if (pd.date && pd.end_date) {
            const start = new Date(pd.date);
            const end = new Date(pd.end_date);
            timeDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
          }
          return {
            date: pd.date,
            end_date: pd.end_date,
            title: pd.title || editingEvent.title,
            timeDiff: timeDiff,
          };
        }) || []
      );
      setMeetingUrl(editingEvent.meeting_url || '');
      setLocation(editingEvent.location || '');
      setMemo(editingEvent.memo || '');
      setRecurrence({
        type: editingEvent.recurrence_type || 'none',
        interval: editingEvent.recurrence_interval || 1,
        customType: editingEvent.recurrence_type === 'custom' ? 'day' : undefined,
        days: editingEvent.recurrence_days,
        monthlyType: editingEvent.recurrence_monthly_type,
        monthlyDay: editingEvent.recurrence_monthly_day,
        monthlyWeekday: editingEvent.recurrence_monthly_weekday,
        endType: editingEvent.recurrence_end_type || 'never',
        endCount: editingEvent.recurrence_end_count,
        endDate: editingEvent.recurrence_end_date,
      });
      setNotifications((editingEvent as any).notifications || []);
    } else if (initialDate) {
      const now = new Date();
      const start = new Date(initialDate);

      start.setHours(now.getHours());
      start.setMinutes(0);
      start.setSeconds(0);
      start.setMilliseconds(0);

      const end = new Date(start);
      end.setHours(end.getHours() + 1);

      setStartDate(formatDateTimeLocal(start));
      setEndDate(formatDateTimeLocal(end));
    }
  }, [editingEvent, initialDate, isOpen]);

  const handleStartDateChange = (newStartDate: string) => {
    setStartDate(newStartDate);

    if (!allDay && newStartDate) {
      if (endDate && startDate) {
        const oldStart = new Date(startDate);
        const newStart = new Date(newStartDate);
        const end = new Date(endDate);

        const durationMs = end.getTime() - oldStart.getTime();

        const newEnd = new Date(newStart.getTime() + durationMs);
        setEndDate(formatDateTimeLocal(newEnd));
      } else {
        const newStart = new Date(newStartDate);
        const newEnd = new Date(newStart);
        newEnd.setHours(newEnd.getHours() + 1);
        setEndDate(formatDateTimeLocal(newEnd));
      }
    }
  };

  const handleEndDateChange = (newEndDate: string) => {
    setEndDate(newEndDate);
  };

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title || !startDate || !endDate || !colorId) return;

    const eventData = {
      title,
      start_at: allDay ? new Date(startDate).toISOString().split('T')[0] : startDate,
      end_at: allDay ? new Date(endDate).toISOString().split('T')[0] : endDate,
      all_day: allDay,
      color_id: colorId,
      event_type: eventType || undefined,
      company_name: companyName || undefined,
      deadline_at: hasDeadline && deadlineAt ? deadlineAt : undefined,
      meeting_url: meetingUrl || undefined,
      location: location || undefined,
      memo: memo || undefined,
      recurrence_type: recurrence.type,
      recurrence_interval: recurrence.interval,
      recurrence_days: recurrence.days,
      recurrence_monthly_type: recurrence.monthlyType,
      recurrence_monthly_day: recurrence.monthlyDay,
      recurrence_monthly_weekday: recurrence.monthlyWeekday,
      recurrence_end_type: recurrence.endType,
      recurrence_end_count: recurrence.endCount,
      recurrence_end_date: recurrence.endDate,
      notifications: notifications,
      preparation_dates: preparationDates.filter(d => d.date).map((pd) => ({
        id: crypto.randomUUID(),
        event_id: editingEvent?.id || '',
        date: pd.date,
        end_date: pd.end_date,
        title: pd.title || title,
      })),
    };

    if (editingEvent && editingEvent.id && onUpdate) {
      onUpdate({ ...eventData, id: editingEvent.id });
    } else {
      onSave(eventData);
    }
    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setEventType('');
    setColorId('');
    setAllDay(false);
    setStartDate('');
    setEndDate('');
    setCompanyName('');
    setHasDeadline(false);
    setDeadlineAt('');
    setPreparationDates([]);
    setMeetingUrl('');
    setLocation('');
    setMemo('');
    setRecurrence({ type: 'none', interval: 1, endType: 'never' });
    setNotifications([]);
    setShowColorPicker(false);
    setShowRecurrenceModal(false);
    setShowNotificationModal(false);
    setStartY(null);
    setCurrentY(null);
    setPreviousStartDate('');
    setPreviousEndDate('');
    onClose();
  };

  const handleUpdateLabel = async (colorPresetId: string, newLabel: string) => {
    const { error } = await supabase
      .from('color_presets')
      .update({ label: newLabel })
      .eq('id', colorPresetId);

    if (!error) {
      setColorPresets((prev) =>
        prev.map((preset) =>
          preset.id === colorPresetId ? { ...preset, label: newLabel } : preset
        )
      );
    }
  };

  const handleUpdateLabels = async (updatedPresets: ColorPreset[]) => {
    for (const preset of updatedPresets) {
      await supabase
        .from('color_presets')
        .update({ label: preset.label, order_index: preset.order_index })
        .eq('id', preset.id);
    }

    setColorPresets(updatedPresets);
  };

  const selectedColor = colorPresets.find((p) => p.id === colorId);

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

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black bg-opacity-50" onClick={handleClose}>
      <div
        className="w-full max-w-2xl bg-white rounded-t-3xl shadow-2xl max-h-[95vh] flex flex-col transition-transform border-t-2 border-[#FFA52F]/40 overflow-hidden"
        style={{ transform: currentY ? `translateY(${currentY}px)` : 'translateY(0)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative flex items-center justify-between px-6 py-4 border-b-2 border-gray-100 cursor-grab active:cursor-grabbing bg-gradient-to-r from-white via-orange-50/30 to-white"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={startY !== null ? handleMouseMove : undefined}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="absolute left-1/2 top-2 -translate-x-1/2 w-12 h-1 bg-gray-300 rounded-full"></div>
          <button
            onClick={handleClose}
            className="text-gray-600 text-base font-medium hover:text-gray-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="relative text-white text-base font-semibold disabled:opacity-50 px-5 py-2 rounded-xl bg-gradient-to-r from-[#FFA52F] to-[#FF8C00] shadow-md hover:shadow-lg disabled:shadow-none transition-all disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100"
            disabled={!title || !startDate || !endDate}
          >
            保存
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="divide-y divide-gray-100">
            <div className="px-6 py-5">
              <input
                type="text"
                placeholder="タイトルを追加"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-lg font-medium outline-none placeholder-gray-400 focus:placeholder-gray-500 transition-all"
              />
            </div>

            <button
              onClick={() => setShowColorPicker(true)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-amber-50/50 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="relative p-2 bg-gradient-to-br from-orange-50 to-amber-100 rounded-lg shadow-sm group-hover:shadow-md transition-all">
                  <Palette size={20} className="text-[#FFA52F]" />
                </div>
                <span className="text-gray-700 font-medium">予定カラー</span>
              </div>
              {selectedColor && (
                <div className="flex items-center gap-2.5">
                  <span className="text-gray-800 font-medium">{selectedColor.label}</span>
                  <div
                    className="w-5 h-5 rounded-lg shadow-md border-2 border-white"
                    style={{ backgroundColor: selectedColor.color }}
                  />
                </div>
              )}
            </button>

            <div className="px-6 py-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative p-2 bg-gradient-to-br from-indigo-50 to-blue-100 rounded-lg shadow-sm">
                  <Briefcase size={20} className="text-indigo-600" />
                </div>
                <span className="text-gray-700 font-medium">イベントタイプ</span>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEventType(eventType === 'intern' ? '' : 'intern')}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all shadow-sm ${
                    eventType === 'intern'
                      ? 'bg-gradient-to-r from-[#FFA52F] to-[#FF8C00] text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  インターン
                </button>
                <button
                  type="button"
                  onClick={() => setEventType(eventType === 'fulltime' ? '' : 'fulltime')}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all shadow-sm ${
                    eventType === 'fulltime'
                      ? 'bg-gradient-to-r from-[#FFA52F] to-[#FF8C00] text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  本選考
                </button>
              </div>
            </div>

            <div className="relative px-6 py-5 bg-gradient-to-br from-blue-50/50 via-sky-50/50 to-cyan-50/50 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-transparent rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-200/20 to-transparent rounded-full blur-xl"></div>

              <div className="relative flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative p-2 bg-gradient-to-br from-blue-50 to-sky-100 rounded-lg shadow-sm">
                    <Clock size={20} className="text-blue-500" />
                  </div>
                  <span className="text-gray-700 font-medium">終日</span>
                </div>
                <button
                  onClick={handleAllDayToggle}
                  className={`w-14 h-8 rounded-full transition-all duration-300 shadow-md ${
                    allDay ? 'bg-gradient-to-r from-blue-500 to-sky-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-sm ${
                      allDay ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="relative space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative p-2 bg-white rounded-lg shadow-sm">
                    <Clock size={20} className="text-[#FFA52F]" />
                  </div>
                  <span className="text-gray-700 font-medium flex-shrink-0 w-12">開始</span>
                  <div className="flex-1 relative">
                    <input
                      type={allDay ? 'date' : 'datetime-local'}
                      value={startDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      className="w-full px-3 py-2.5 pr-10 border-2 border-gray-200 rounded-lg outline-none focus:border-[#FFA52F] focus:ring-2 focus:ring-[#FFA52F]/20 bg-white shadow-sm transition-all"
                    />
                    {startDate && (
                      <button
                        type="button"
                        onClick={() => setStartDate('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative p-2 bg-white rounded-lg shadow-sm">
                    <Clock size={20} className="text-gray-400" />
                  </div>
                  <span className="text-gray-700 font-medium flex-shrink-0 w-12">終了</span>
                  <div className="flex-1 relative">
                    <input
                      type={allDay ? 'date' : 'datetime-local'}
                      value={endDate}
                      onChange={(e) => handleEndDateChange(e.target.value)}
                      className="w-full px-3 py-2.5 pr-10 border-2 border-gray-200 rounded-lg outline-none focus:border-[#FFA52F] focus:ring-2 focus:ring-[#FFA52F]/20 bg-white shadow-sm transition-all"
                    />
                    {endDate && (
                      <button
                        type="button"
                        onClick={() => setEndDate('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative p-2 bg-gradient-to-br from-emerald-50 to-green-100 rounded-lg shadow-sm">
                  <Building2 size={20} className="text-emerald-600" />
                </div>
                <span className="text-gray-700 font-medium">会社名を追加</span>
              </div>
              <input
                type="text"
                placeholder="会社名"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder-gray-400 shadow-sm transition-all"
              />
            </div>

            <div className="relative px-7 py-4 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100/70 rounded-2xl border-2 border-[#FFA52F]/40 shadow-lg overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FFA52F]/10 to-transparent rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-200/20 to-transparent rounded-full blur-xl"></div>

              <div className="relative flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative p-2.5 bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-md">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 to-red-500/10 rounded-xl"></div>
                    <AlertCircle size={22} className="relative text-red-500" />
                  </div>
                  <span className="text-gray-800 text-[15px]">応募締切日時を追加</span>
                </div>
                <button
                  onClick={() => setHasDeadline(!hasDeadline)}
                  className={`w-14 h-8 rounded-full transition-all duration-300 shadow-md ${
                    hasDeadline ? 'bg-gradient-to-r from-[#FFA52F] to-[#FF8C00]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-sm ${
                      hasDeadline ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {hasDeadline && (
                <div className="relative mb-3 animate-[slideDown_0.3s_ease-out]">
                  <input
                    type="date"
                    value={deadlineAt}
                    onChange={(e) => setDeadlineAt(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl outline-none focus:border-[#FFA52F] focus:ring-2 focus:ring-[#FFA52F]/20 bg-white shadow-md transition-all"
                  />
                </div>
              )}

              <div className="relative border-t-2 border-white/80 pt-3 mt-2 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative p-2.5 bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl shadow-md">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#FFA52F]/10 to-amber-400/10 rounded-xl"></div>
                      <Clock size={22} className="relative text-[#FFA52F]" />
                    </div>
                    <span className="text-gray-800 text-[15px]">選考対策日時を追加</span>
                  </div>
                  <button
                    onClick={() => {
                      const now = new Date();
                      const startTime = new Date(now);
                      startTime.setMinutes(0, 0, 0);
                      const endTime = new Date(startTime);
                      endTime.setHours(endTime.getHours() + 1);

                      const startDateStr = formatDateTimeLocal(startTime);
                      const endDateStr = formatDateTimeLocal(endTime);
                      setPreparationDates([...preparationDates, { date: startDateStr, end_date: endDateStr, title: title || '', timeDiff: 60 }]);
                    }}
                    className="relative group text-[#FFA52F] hover:text-[#FF8C00] bg-white hover:bg-gradient-to-br hover:from-orange-50 hover:to-amber-50 p-2.5 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                  >
                    <Plus size={20} className="transition-transform group-hover:rotate-90 duration-300" />
                  </button>
                </div>
                {preparationDates.length > 0 && (
                  <div className="space-y-3">
                    {preparationDates.map((prepDate, index) => (
                      <div key={index} className="flex flex-col gap-2.5 p-4 border-2 border-orange-100 rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="タイトル"
                            value={prepDate.title}
                            onChange={(e) => {
                              const newDates = [...preparationDates];
                              newDates[index].title = e.target.value;
                              setPreparationDates(newDates);
                            }}
                            className="flex-1 px-3 py-2.5 border-2 border-gray-200 rounded-lg outline-none focus:border-[#FFA52F] focus:ring-2 focus:ring-[#FFA52F]/20 placeholder-gray-400 transition-all"
                          />
                          <button
                            onClick={() => {
                              const newDates = preparationDates.filter((_, i) => i !== index);
                              setPreparationDates(newDates);
                            }}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2.5 rounded-lg transition-all duration-200 flex-shrink-0 hover:scale-105"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 w-12">開始</span>
                            <input
                              type="datetime-local"
                              value={prepDate.date}
                              onChange={(e) => {
                                const newDates = [...preparationDates];
                                newDates[index].date = e.target.value;

                                if (e.target.value) {
                                  const start = new Date(e.target.value);
                                  const timeDiff = newDates[index].timeDiff || 60;
                                  const end = new Date(start.getTime() + timeDiff * 60 * 1000);
                                  newDates[index].end_date = formatDateTimeLocal(end);
                                }

                                setPreparationDates(newDates);
                              }}
                              className="flex-1 px-3 py-2.5 border-2 border-gray-200 rounded-lg outline-none focus:border-[#FFA52F] focus:ring-2 focus:ring-[#FFA52F]/20 transition-all"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 w-12">終了</span>
                            <input
                              type="datetime-local"
                              value={prepDate.end_date || ''}
                              onChange={(e) => {
                                const newDates = [...preparationDates];
                                newDates[index].end_date = e.target.value;

                                if (e.target.value && newDates[index].date) {
                                  const start = new Date(newDates[index].date);
                                  const end = new Date(e.target.value);
                                  const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
                                  if (diff > 0) {
                                    newDates[index].timeDiff = diff;
                                  }
                                }

                                setPreparationDates(newDates);
                              }}
                              className="flex-1 px-3 py-2.5 border-2 border-gray-200 rounded-lg outline-none focus:border-[#FFA52F] focus:ring-2 focus:ring-[#FFA52F]/20 transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative p-2 bg-gradient-to-br from-violet-50 to-purple-100 rounded-lg shadow-sm">
                  <Video size={20} className="text-violet-600" />
                </div>
                <span className="text-gray-700 font-medium">ビデオ会議を追加</span>
              </div>
              <input
                type="url"
                placeholder="URL"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 placeholder-gray-400 shadow-sm transition-all"
              />
            </div>

            <div className="px-6 py-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative p-2 bg-gradient-to-br from-rose-50 to-pink-100 rounded-lg shadow-sm">
                  <MapPin size={20} className="text-rose-600" />
                </div>
                <span className="text-gray-700 font-medium">場所を追加</span>
              </div>
              <input
                type="text"
                placeholder="場所"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 placeholder-gray-400 shadow-sm transition-all"
              />
            </div>

            <button
              onClick={() => setShowNotificationModal(true)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gradient-to-r hover:from-cyan-50/50 hover:to-teal-50/50 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="relative p-2 bg-gradient-to-br from-cyan-50 to-teal-100 rounded-lg shadow-sm group-hover:shadow-md transition-all">
                  <Bell size={20} className="text-teal-600" />
                </div>
                <span className="text-gray-700 font-medium">通知</span>
              </div>
              <span className="text-gray-600 text-sm">
                {notifications.length === 0 ? 'なし' : `${notifications.length}件`}
              </span>
            </button>

            <button
              onClick={() => setShowRecurrenceModal(true)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="relative p-2 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow-sm group-hover:shadow-md transition-all">
                  <Repeat size={20} className="text-blue-600" />
                </div>
                <span className="text-gray-700 font-medium">繰り返し</span>
              </div>
              <span className="text-gray-600 text-sm">
                {recurrence.type === 'none' && 'しない'}
                {recurrence.type === 'daily' && '毎日'}
                {recurrence.type === 'weekly' && '毎週'}
                {recurrence.type === 'monthly' && '毎月'}
                {recurrence.type === 'yearly' && '毎年'}
                {recurrence.type === 'custom' && 'カスタム'}
              </span>
            </button>

            <div className="px-6 py-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative p-2 bg-gradient-to-br from-amber-50 to-yellow-100 rounded-lg shadow-sm">
                  <FileText size={20} className="text-amber-600" />
                </div>
                <span className="text-gray-700 font-medium">メモ</span>
              </div>
              <textarea
                placeholder="メモを追加"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 placeholder-gray-400 shadow-sm transition-all resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      <ColorPickerModal
        isOpen={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        selectedColorId={colorId}
        onSelect={setColorId}
        colorPresets={colorPresets}
        onUpdateLabel={handleUpdateLabel}
        onUpdateLabels={handleUpdateLabels}
      />

      <RecurrenceModal
        isOpen={showRecurrenceModal}
        onClose={() => setShowRecurrenceModal(false)}
        config={recurrence}
        onSave={setRecurrence}
        startDate={startDate}
      />

      <NotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        notifications={notifications}
        onSave={setNotifications}
      />
    </div>
  );
};
